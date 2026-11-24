"use server";

import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { toActionResult } from "@/lib/actions/result";
import { getSiteUrl } from "@/lib/siteUrl";
import { AVATAR_BUCKET } from "@/lib/admin/avatars";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOwner } from "@/lib/auth/isAdmin";
import { formatAdminRole } from "@/lib/auth/permissions";
import { sendTeamInviteEmail } from "@/lib/email/sendTeamInviteEmail";

/** A custom role must exist and be built on the chosen base level. */
async function validCustomRoleKey(key: string | null | undefined, role: string): Promise<string | null> {
  if (!key) return null;
  const { data } = await createAdminClient().from("admin_roles").select("key, base_role").eq("key", key).maybeSingle();
  if (!data) throw new Error("That custom role no longer exists. Refresh the page.");
  if (data.base_role !== role) throw new Error("That custom role doesn't match the chosen access level.");
  return data.key;
}

export type InviteableRole = "admin" | "community_manager" | "support";

const allowedRoles: InviteableRole[] = [
  "admin",
  "community_manager",
  "support",
];

/**
 * Invite a team member.
 *
 * Creates the Auth user, inserts the admin_team_members row, then sends
 * a branded TransVista invitation via Resend. Owner-only.
 *
 * generateLink() is used instead of inviteUserByEmail() so the email
 * comes from welcome@transvistaafrica.com rather than Supabase.
 */
async function inviteTeamMemberUnsafe({
  fullName,
  email,
  role,
  customRoleKey,
}: {
  fullName: string;
  email: string;
  role: InviteableRole;
  customRoleKey?: string | null;
}) {
  /*
   * ------------------------------------------------------------
   * 1. Verify the caller is the authenticated owner
   * ------------------------------------------------------------
   */

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isOwner(user))) {
    throw new Error("Only the TransVista owner can invite team members.");
  }

  /*
   * ------------------------------------------------------------
   * 2. Validate input
   * ------------------------------------------------------------
   */

  const cleanName = fullName.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error("Please enter the team member's full name.");
  }

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid team member role.");
  }

  const customRole = await validCustomRoleKey(customRoleKey, role);

  /*
   * ------------------------------------------------------------
   * 3. Create the Auth user and invite link (no email sent yet)
   * ------------------------------------------------------------
   *
   * generateLink() creates the Auth user and returns the action URL.
   * The branded email is sent separately via Resend.
   */

  const adminSupabase = createAdminClient();

  const { data: existingMember } = await adminSupabase
    .from("admin_team_members")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existingMember) {
    throw new Error("A team member with this email already exists.");
  }

  // The address the owner is using (e.g. https://www.transvistaafrica.com),
  // never a hard-coded localhost fallback. See lib/siteUrl.ts.
  const siteUrl = await getSiteUrl();

  const { data: invitation, error: inviteError } =
    await adminSupabase.auth.admin.generateLink({
      type: "invite",
      email: cleanEmail,
      options: {
        data: {
          full_name: cleanName,
          role,
        },
        redirectTo: `${siteUrl}/auth/callback?next=/invite/set-password`,
      },
    });

  if (inviteError) {
    console.error("[inviteTeamMember] Auth invitation error:", inviteError);

    throw new Error(
      inviteError.message || "Failed to create the invitation.",
    );
  }

  const invitedUserId = invitation.user?.id;
  // Link straight to our own /auth/confirm with the token hash. Supabase's
  // default action_link returns the session in the URL fragment, which the
  // server can't read, and it depends on the project's redirect allow-list.
  const hashedToken = invitation.properties?.hashed_token;
  const inviteUrl = hashedToken
    ? `${siteUrl}/auth/confirm?${new URLSearchParams({
        token_hash: hashedToken,
        type: "invite",
        next: "/invite/set-password",
      })}`
    : null;

  if (!invitedUserId) {
    throw new Error("Invitation was created but no user id was returned.");
  }

  if (!inviteUrl) {
    await adminSupabase.auth.admin.deleteUser(invitedUserId);
    throw new Error("Invitation was created but no invite link was returned.");
  }

  /*
   * ------------------------------------------------------------
   * 4. Create the team-member record
   * ------------------------------------------------------------
   */

  const { error: memberError } = await adminSupabase
    .from("admin_team_members")
    .insert({
      user_id: invitedUserId,
      full_name: cleanName,
      email: cleanEmail,
      role,
      custom_role_key: customRole,
    });

  if (memberError) {
    console.error(
      "[inviteTeamMember] Team member insert error:",
      memberError,
    );

    await adminSupabase.auth.admin.deleteUser(invitedUserId);

    throw new Error(
      "The invitation could not be completed. No team member was created.",
    );
  }

  /*
   * ------------------------------------------------------------
   * 5. Send the branded TransVista invitation email
   * ------------------------------------------------------------
   */

  try {
    await sendTeamInviteEmail({
      fullName: cleanName,
      email: cleanEmail,
      roleLabel: formatAdminRole(role),
      inviteUrl,
    });
  } catch (emailError) {
    console.error("[inviteTeamMember] Email send error:", emailError);

    await adminSupabase
      .from("admin_team_members")
      .delete()
      .eq("user_id", invitedUserId);
    await adminSupabase.auth.admin.deleteUser(invitedUserId);

    throw new Error(
      emailError instanceof Error
        ? `The invitation email could not be sent (${emailError.message}). No team member was created.`
        : "The invitation email could not be sent. No team member was created.",
    );
  }

  return {
    success: true,
    member: {
      id: invitedUserId,
      fullName: cleanName,
      email: cleanEmail,
      role,
    },
  };
}

/**
 * Deactivate or reactivate a team member without deleting their account.
 * The owner account and the current user's own access are protected.
 */
async function updateTeamMemberStatus(memberId: string, status: "active" | "inactive") {
  if (!memberId) throw new Error("Team member id is required.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isOwner(user))) throw new Error("Only the TransVista owner can manage team access.");
  const adminSupabase = createAdminClient();
  const { data: member, error: lookupError } = await adminSupabase.from("admin_team_members").select("id,user_id,full_name,role").eq("id",memberId).maybeSingle();
  if (lookupError || !member) throw new Error("This team member could not be found.");
  if (member.role === "owner") throw new Error("The owner account is protected.");
  if (member.user_id === user.id) throw new Error("You cannot change your own access.");
  const { error } = await adminSupabase.from("admin_team_members").update({status,updated_at:new Date().toISOString()}).eq("id",memberId);
  if (error) throw new Error("The team member's access could not be updated.");
  // Also block (or restore) the login itself, so a removed member can't sign
  // in again, and any session they still have stops refreshing.
  if (member.user_id) {
    const { error: banError } = await adminSupabase.auth.admin.updateUserById(member.user_id, {
      ban_duration: status === "inactive" ? "876000h" : "none",
    });
    if (banError) console.error("[updateTeamMemberStatus] login ban update:", banError);
  }
  return {success:true,member:{id:member.id,fullName:member.full_name,status}};
}
async function removeTeamMemberImpl(memberId: string) { return toActionResult(() => updateTeamMemberStatus(memberId,"inactive")); }
async function reactivateTeamMemberImpl(memberId: string) { return toActionResult(() => updateTeamMemberStatus(memberId,"active")); }


/** Owner-only profile and role editing. Login email is intentionally immutable here. */
async function updateTeamMemberDetailsUnsafe({memberId,fullName,role,customRoleKey}:{memberId:string;fullName:string;role:InviteableRole;customRoleKey?:string|null}) {
  const cleanName=fullName.trim();
  if(!memberId || cleanName.length<2 || cleanName.length>120) throw new Error("Enter a valid team member name.");
  if(!allowedRoles.includes(role)) throw new Error("Choose a valid team role.");
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user || !(await isOwner(user))) throw new Error("Only the TransVista owner can edit team profiles and roles.");
  const adminSupabase=createAdminClient();
  const {data:member,error:lookupError}=await adminSupabase.from("admin_team_members").select("id,user_id,role").eq("id",memberId).maybeSingle();
  if(lookupError || !member) throw new Error("This team member could not be found.");
  if(member.role==="owner") throw new Error("The owner account is protected.");
  if(member.user_id===user.id) throw new Error("You cannot change your own team role.");
  const customRole=await validCustomRoleKey(customRoleKey,role);
  const {error}=await adminSupabase.from("admin_team_members").update({full_name:cleanName,role,custom_role_key:customRole,updated_at:new Date().toISOString()}).eq("id",memberId);
  if(error) throw new Error("The team member details could not be saved.");
  if(member.user_id) {
    const {error:authError}=await adminSupabase.auth.admin.updateUserById(member.user_id,{user_metadata:{full_name:cleanName,role}});
    if(authError) throw new Error("The team profile was updated, but the login profile metadata could not be synchronized. Please contact support.");
  }
  return {success:true};
}

// Errors are returned rather than thrown so their messages reach the UI in
// production (see lib/actions/result.ts).
async function inviteTeamMemberImpl(input: Parameters<typeof inviteTeamMemberUnsafe>[0]) {
  return toActionResult(() => inviteTeamMemberUnsafe(input));
}

async function updateTeamMemberDetailsImpl(input: Parameters<typeof updateTeamMemberDetailsUnsafe>[0]) {
  return toActionResult(() => updateTeamMemberDetailsUnsafe(input));
}

/**
 * Email a fresh sign-in link to a team member who hasn't set up their
 * account yet (e.g. their first invite link expired or was broken).
 * Uses a one-time magic link that lands on the set-password page.
 */
async function resendTeamInviteUnsafe(memberId: string) {
  if (!memberId) throw new Error("Team member id is required.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isOwner(user))) {
    throw new Error("Only the TransVista owner can resend invitations.");
  }

  const adminSupabase = createAdminClient();
  const { data: member, error: lookupError } = await adminSupabase
    .from("admin_team_members")
    .select("id, user_id, full_name, email, role, status")
    .eq("id", memberId)
    .maybeSingle();
  if (lookupError || !member) throw new Error("This team member could not be found.");
  if (member.role === "owner") throw new Error("The owner account is protected.");
  if (member.status !== "active") throw new Error("Reactivate this team member before resending their invitation.");

  const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(member.user_id);
  if (authError || !authUser.user) throw new Error("This team member's login could not be found.");
  if (authUser.user.last_sign_in_at) {
    throw new Error(`${member.full_name} has already set up their account. They can sign in at /login.`);
  }

  const { data: link, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email: member.email,
  });
  const hashedToken = link?.properties?.hashed_token;
  if (linkError || !hashedToken) {
    console.error("[resendTeamInvite] generateLink:", linkError);
    throw new Error("A new invitation link could not be created. Please try again.");
  }

  const siteUrl = await getSiteUrl();
  const inviteUrl = `${siteUrl}/auth/confirm?${new URLSearchParams({
    token_hash: hashedToken,
    type: "magiclink",
    next: "/invite/set-password",
  })}`;

  await sendTeamInviteEmail({
    fullName: member.full_name,
    email: member.email,
    roleLabel: formatAdminRole(member.role as InviteableRole),
    inviteUrl,
  });

  return { success: true, email: member.email };
}

async function resendTeamInviteImpl(memberId: string) {
  return toActionResult(() => resendTeamInviteUnsafe(memberId));
}

/**
 * Permanently delete a team member (owner only, never the owner or yourself).
 *
 * - If they never acted in the admin, their team record and login are erased.
 * - If bookings, payments or activity reference them, those links must stay
 *   valid, so their record is anonymised ("Former team member", no email,
 *   phone or photo) and their login is erased.
 */
async function deleteTeamMemberPermanentlyUnsafe(input: { memberId: string; confirmName: string }) {
  if (!input.memberId) throw new Error("Team member id is required.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isOwner(user))) throw new Error("Only the TransVista owner can delete team members.");

  const adminSupabase = createAdminClient();
  const { data: member, error: lookupError } = await adminSupabase
    .from("admin_team_members")
    .select("id, user_id, full_name, role, avatar_path, status")
    .eq("id", input.memberId)
    .maybeSingle();
  if (lookupError || !member || member.status === "removed") throw new Error("This team member could not be found.");
  if (member.role === "owner") throw new Error("The owner account is protected.");
  if (member.user_id === user.id) throw new Error("You cannot delete your own account.");
  if (input.confirmName.trim().toLowerCase() !== member.full_name.trim().toLowerCase()) {
    throw new Error("Type the team member's full name exactly to confirm.");
  }

  if (member.avatar_path) {
    await adminSupabase.storage.from(AVATAR_BUCKET).remove([member.avatar_path]);
  }

  // 1. Try a full erase (works when nothing in the history points to them).
  const { error: deleteError } = await adminSupabase.from("admin_team_members").delete().eq("id", member.id);
  let outcome: "erased" | "anonymised" = "erased";

  if (deleteError) {
    if (deleteError.code !== "23503") {
      console.error("[deleteTeamMember] delete:", deleteError);
      throw new Error("This team member could not be deleted. Please try again.");
    }
    // 2. Referenced by history: anonymise instead, detaching the login first
    //    (deleting the login would otherwise cascade to this row).
    outcome = "anonymised";
    const now = new Date().toISOString();
    const { error: anonymiseError } = await adminSupabase
      .from("admin_team_members")
      .update({
        full_name: "Former team member",
        email: `removed+${member.id}@invalid.transvistaafrica.com`,
        phone: null,
        avatar_path: null,
        status: "removed",
        removed_at: now,
        user_id: null,
        updated_at: now,
      })
      .eq("id", member.id);
    if (anonymiseError) {
      console.error("[deleteTeamMember] anonymise:", anonymiseError);
      throw new Error("This team member could not be deleted. Please try again.");
    }
  }

  // 3. Erase the login.
  if (member.user_id) {
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(member.user_id);
    if (authError && authError.status !== 404) {
      console.error("[deleteTeamMember] auth delete:", authError);
      throw new Error("Their team record was removed, but their login could not be erased. Please contact support.");
    }
  }

  return { outcome, fullName: member.full_name };
}

async function deleteTeamMemberPermanentlyImpl(input: { memberId: string; confirmName: string }) {
  return toActionResult(() => deleteTeamMemberPermanentlyUnsafe(input));
}

/** Audited entry point: runs inviteTeamMemberImpl and records it in the audit log on success. */
export async function inviteTeamMember(...args: Parameters<typeof inviteTeamMemberImpl>) {
  const result = await inviteTeamMemberImpl(...args);
  if (result.ok) await logAudit("team.invited", `Invited ${args[0].fullName} as ${args[0].role}`, { type: "team_member" }, { role: args[0].role });
  return result;
}

/** Audited entry point: runs resendTeamInviteImpl and records it in the audit log on success. */
export async function resendTeamInvite(...args: Parameters<typeof resendTeamInviteImpl>) {
  const result = await resendTeamInviteImpl(...args);
  if (result.ok) await logAudit("team.invite_resent", "Resent a team invitation", { type: "team_member", id: args[0] });
  return result;
}

/** Audited entry point: runs removeTeamMemberImpl and records it in the audit log on success. */
export async function removeTeamMember(...args: Parameters<typeof removeTeamMemberImpl>) {
  const result = await removeTeamMemberImpl(...args);
  if (result.ok) await logAudit("team.access_removed", "Removed a team member's access", { type: "team_member", id: args[0] });
  return result;
}

/** Audited entry point: runs reactivateTeamMemberImpl and records it in the audit log on success. */
export async function reactivateTeamMember(...args: Parameters<typeof reactivateTeamMemberImpl>) {
  const result = await reactivateTeamMemberImpl(...args);
  if (result.ok) await logAudit("team.access_restored", "Restored a team member's access", { type: "team_member", id: args[0] });
  return result;
}

/** Audited entry point: runs updateTeamMemberDetailsImpl and records it in the audit log on success. */
export async function updateTeamMemberDetails(...args: Parameters<typeof updateTeamMemberDetailsImpl>) {
  const result = await updateTeamMemberDetailsImpl(...args);
  if (result.ok) await logAudit("team.updated", `Updated ${args[0].fullName}'s name or role`, { type: "team_member", id: args[0].memberId }, { role: args[0].role });
  return result;
}

/** Audited entry point: runs deleteTeamMemberPermanentlyImpl and records it in the audit log on success. */
export async function deleteTeamMemberPermanently(...args: Parameters<typeof deleteTeamMemberPermanentlyImpl>) {
  const result = await deleteTeamMemberPermanentlyImpl(...args);
  if (result.ok) await logAudit("team.deleted", `Permanently deleted a team member (${result.ok ? result.data.outcome : ""})`, { type: "team_member", id: args[0].memberId });
  return result;
}

/**
 * Owner-only: remove a member's two-step sign-in (e.g. they lost their phone).
 * They sign in with their password next time and can set it up again.
 */
async function resetTeamMemberTwoFactorUnsafe(memberId: string) {
  if (!memberId) throw new Error("Team member id is required.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isOwner(user))) throw new Error("Only the TransVista owner can reset two-step sign-in.");

  const adminSupabase = createAdminClient();
  const { data: member } = await adminSupabase
    .from("admin_team_members")
    .select("id, user_id, full_name, role")
    .eq("id", memberId)
    .maybeSingle();
  if (!member || !member.user_id) throw new Error("This team member could not be found.");
  if (member.user_id === user.id) throw new Error("Turn off your own two-step sign-in from My account.");

  const { data: factors, error: listError } = await adminSupabase.auth.admin.mfa.listFactors({ userId: member.user_id });
  if (listError) throw new Error("Their two-step sign-in could not be checked.");
  const all = factors?.factors ?? [];
  if (!all.length) throw new Error(`${member.full_name} doesn't have two-step sign-in turned on.`);

  for (const factor of all) {
    const { error } = await adminSupabase.auth.admin.mfa.deleteFactor({ userId: member.user_id, id: factor.id });
    if (error) throw new Error("Their two-step sign-in could not be reset. Please try again.");
  }
  return { fullName: member.full_name };
}

export async function resetTeamMemberTwoFactor(memberId: string) {
  const result = await toActionResult(() => resetTeamMemberTwoFactorUnsafe(memberId));
  if (result.ok) await logAudit("team.mfa_reset", `Reset ${result.data.fullName}'s two-step sign-in`, { type: "team_member", id: memberId });
  return result;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { toActionResult } from "@/lib/actions/result";
import { getSiteUrl } from "@/lib/siteUrl";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOwner } from "@/lib/auth/isAdmin";
import { formatAdminRole } from "@/lib/auth/permissions";
import { sendTeamInviteEmail } from "@/lib/email/sendTeamInviteEmail";

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
}: {
  fullName: string;
  email: string;
  role: InviteableRole;
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
  return {success:true,member:{id:member.id,fullName:member.full_name,status}};
}
export async function removeTeamMember(memberId: string) { return toActionResult(() => updateTeamMemberStatus(memberId,"inactive")); }
export async function reactivateTeamMember(memberId: string) { return toActionResult(() => updateTeamMemberStatus(memberId,"active")); }


/** Owner-only profile and role editing. Login email is intentionally immutable here. */
async function updateTeamMemberDetailsUnsafe({memberId,fullName,role}:{memberId:string;fullName:string;role:InviteableRole}) {
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
  const {error}=await adminSupabase.from("admin_team_members").update({full_name:cleanName,role,updated_at:new Date().toISOString()}).eq("id",memberId);
  if(error) throw new Error("The team member details could not be saved.");
  if(member.user_id) {
    const {error:authError}=await adminSupabase.auth.admin.updateUserById(member.user_id,{user_metadata:{full_name:cleanName,role}});
    if(authError) throw new Error("The team profile was updated, but the login profile metadata could not be synchronized. Please contact support.");
  }
  return {success:true};
}

// Errors are returned rather than thrown so their messages reach the UI in
// production (see lib/actions/result.ts).
export async function inviteTeamMember(input: Parameters<typeof inviteTeamMemberUnsafe>[0]) {
  return toActionResult(() => inviteTeamMemberUnsafe(input));
}

export async function updateTeamMemberDetails(input: Parameters<typeof updateTeamMemberDetailsUnsafe>[0]) {
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

export async function resendTeamInvite(memberId: string) {
  return toActionResult(() => resendTeamInviteUnsafe(memberId));
}

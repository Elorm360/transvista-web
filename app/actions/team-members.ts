"use server";

import { createClient } from "@/lib/supabase/server";
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
export async function inviteTeamMember({
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

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

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
  const inviteUrl = invitation.properties?.action_link;

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
export async function removeTeamMember(memberId: string) { return updateTeamMemberStatus(memberId,"inactive"); }
export async function reactivateTeamMember(memberId: string) { return updateTeamMemberStatus(memberId,"active"); }

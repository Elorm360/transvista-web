"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOwner } from "@/lib/auth/isAdmin";

export type InviteableRole = "admin" | "community_manager" | "support";

const allowedRoles: InviteableRole[] = [
  "admin",
  "community_manager",
  "support",
];

/**
 * Invite a team member.
 *
 * Creates the Auth user via inviteUserByEmail and inserts the matching
 * admin_team_members row. Owner-only. If the database insert fails, the
 * Auth user is rolled back so the two records stay in sync.
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
   * 3. Create the Supabase Auth invitation
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   * createAdminClient() uses the service-role key.
   * It must ONLY run on the server.
   */

  const adminSupabase = createAdminClient();

  const { data: invitation, error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(cleanEmail);

  if (inviteError) {
    console.error("[inviteTeamMember] Auth invitation error:", inviteError);

    throw new Error(
      inviteError.message || "Failed to send the invitation.",
    );
  }

  const invitedUserId = invitation.user?.id;

  if (!invitedUserId) {
    throw new Error("Invitation was created but no user id was returned.");
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

  /*
   * ------------------------------------------------------------
   * 5. Roll back Auth user if database insert fails
   * ------------------------------------------------------------
   */

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

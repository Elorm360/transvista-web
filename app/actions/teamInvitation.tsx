"use server";

import { Resend } from "resend";
import { render } from "@react-email/render";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminRole } from "@/lib/auth/getAdminRole";
import { getSiteUrl } from "@/lib/siteUrl";
import TeamInvitationEmail from "@/components/emails/TeamInvitationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export type InviteableRole = "admin" | "community_manager" | "support";

const allowedRoles: InviteableRole[] = [
  "admin",
  "community_manager",
  "support",
];

interface SendTeamInvitationInput {
  name: string;
  email: string;
  role: InviteableRole;
}

/**
 * sendTeamInvitation
 *
 * Owner-only onboarding:
 *   1. Confirm the caller is an active owner
 *   2. Create/invite the Auth user (service-role, server-only)
 *   3. Upsert admin_team_members by email
 *   4. Send the branded Resend email
 *
 * The service-role key and Resend API key never leave the server.
 */
export async function sendTeamInvitation({
  name,
  email,
  role,
}: SendTeamInvitationInput) {
  /*
   * ------------------------------------------------------------
   * 1. Authentication + owner authorization
   * ------------------------------------------------------------
   */

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to invite team members.");
  }

  const callerRole = await getAdminRole(user.email);

  if (callerRole !== "owner") {
    throw new Error("Only the TransVista owner can invite team members.");
  }

  /*
   * ------------------------------------------------------------
   * 2. Validate input
   * ------------------------------------------------------------
   */

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error("Recipient name is required.");
  }

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Recipient email is required.");
  }

  if (!allowedRoles.includes(role)) {
    throw new Error("Team member role is required.");
  }

  const siteUrl = getSiteUrl();

  /*
   * ------------------------------------------------------------
   * 3. Create the Auth user and a one-time invite token
   *
   * generateLink({ type: "invite" }) creates the user and returns
   * hashed_token. We put that token on our /auth/callback URL so
   * the branded Resend email is the presentation layer and
   * Supabase remains the security layer. We do not call
   * inviteUserByEmail(), which would also send Supabase's default
   * invite email.
   *
   * createAdminClient() uses the service-role key and must ONLY
   * run on the server.
   * ------------------------------------------------------------
   */

  const adminSupabase = createAdminClient();

  const { data: invitation, error: inviteError } =
    await adminSupabase.auth.admin.generateLink({
      type: "invite",
      email: cleanEmail,
      options: {
        data: {
          full_name: cleanName,
          must_set_password: true,
        },
        redirectTo: `${siteUrl}/admin/setup`,
      },
    });

  if (inviteError) {
    console.error(
      "[sendTeamInvitation] Auth invitation error:",
      inviteError,
    );

    throw new Error(
      inviteError.message || "Failed to create the invitation.",
    );
  }

  const invitedUserId = invitation.user?.id;
  const hashedToken = invitation.properties?.hashed_token;

  if (!invitedUserId) {
    throw new Error("Invitation was created but no user id was returned.");
  }

  if (!hashedToken) {
    throw new Error("Invitation was created but no secure token was returned.");
  }

  /*
   * ------------------------------------------------------------
   * 4–5. Upsert the team-member record
   * ------------------------------------------------------------
   */

  const { error: memberError } = await adminSupabase
    .from("admin_team_members")
    .upsert(
      {
        user_id: invitedUserId,
        full_name: cleanName,
        email: cleanEmail,
        role,
        status: "active",
      },
      {
        onConflict: "email",
      },
    );

  if (memberError) {
    console.error(
      "[sendTeamInvitation] Team member insert error:",
      memberError,
    );

    /*
     * If the Auth user was created but the team record failed,
     * don't silently pretend the invitation succeeded.
     */
    await adminSupabase.auth.admin.deleteUser(invitedUserId);

    throw new Error(
      "The account was created, but the team membership could not be saved.",
    );
  }

  /*
   * ------------------------------------------------------------
   * 6. Generate our branded invitation email
   * ------------------------------------------------------------
   */

  const inviteUrl = `${siteUrl}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=invite&next=${encodeURIComponent("/admin/setup")}`;

  const emailHtml = await render(
    <TeamInvitationEmail
      recipientName={cleanName}
      role={role.replace("_", " ")}
      inviteUrl={inviteUrl}
    />,
  );

  /*
   * ------------------------------------------------------------
   * 7. Send through Resend
   * ------------------------------------------------------------
   */

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Email service is not configured.");
  }

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: "TransVista Africa <info@transvistaafrica.com>",
    to: [cleanEmail],
    subject: "You’re invited to join the TransVista Africa team",
    html: emailHtml,
  });

  if (emailError) {
    console.error("[sendTeamInvitation] Resend error:", emailError);

    throw new Error(
      "The team member was created, but the invitation email could not be sent.",
    );
  }

  return {
    success: true,
    userId: invitedUserId,
    emailId: emailData?.id ?? null,
  };
}

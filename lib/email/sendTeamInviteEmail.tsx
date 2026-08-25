import { render } from "@react-email/render";
import { resend } from "./resend";
import TeamInviteEmail from "@/emails/team-invite";

/**
 * Send a branded TransVista admin invitation via Resend.
 *
 * From: welcome@transvistaafrica.com
 * Reply-To: info@transvistaafrica.com
 */
export async function sendTeamInviteEmail({
  fullName,
  email,
  roleLabel,
  inviteUrl,
}: {
  fullName: string;
  email: string;
  roleLabel: string;
  inviteUrl: string;
}) {
  const html = await render(
    <TeamInviteEmail
      fullName={fullName}
      roleLabel={roleLabel}
      inviteUrl={inviteUrl}
    />,
  );

  const { data, error } = await resend.emails.send({
    from: "TransVista Africa <welcome@transvistaafrica.com>",
    to: email,
    replyTo: "info@transvistaafrica.com",
    subject: "You're invited to TransVista Admin",
    html,
  });

  if (error) {
    console.error("[sendTeamInviteEmail] Resend API error:", {
      name: error.name,
      message: error.message,
      to: email,
    });
    throw new Error(error.message);
  }

  console.log("[sendTeamInviteEmail] Email sent:", {
    id: data?.id,
    to: email,
  });

  return data;
}

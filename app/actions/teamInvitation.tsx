"use server";

import { Resend } from "resend";
import { render } from "@react-email/render";
import TeamInvitationEmail from "@/components/emails/TeamInvitationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendTeamInvitationInput {
  recipientName: string;
  recipientEmail: string;
  role: string;
  inviteUrl: string;
}

/**
 * sendTeamInvitation
 *
 * Server-only: renders the branded invitation and sends it via Resend.
 * The Resend API key never leaves the server.
 */
export async function sendTeamInvitation({
  recipientName,
  recipientEmail,
  role,
  inviteUrl,
}: SendTeamInvitationInput) {
  if (!recipientName.trim()) {
    throw new Error("Recipient name is required.");
  }

  if (!recipientEmail.trim()) {
    throw new Error("Recipient email is required.");
  }

  if (!role.trim()) {
    throw new Error("Team member role is required.");
  }

  if (!inviteUrl.trim()) {
    throw new Error("Invitation URL is required.");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Email service is not configured.");
  }

  const emailHtml = await render(
    <TeamInvitationEmail
      recipientName={recipientName}
      role={role}
      inviteUrl={inviteUrl}
    />,
  );

  const { data, error } = await resend.emails.send({
    from: "TransVista Africa <info@transvistaafrica.com>",
    to: [recipientEmail],
    subject: "You’re invited to join the TransVista Africa team",
    html: emailHtml,
  });

  if (error) {
    console.error("[sendTeamInvitation] Resend error:", error);

    throw new Error(
      "We could not send the invitation email. Please try again.",
    );
  }

  return {
    success: true,
    id: data?.id ?? null,
  };
}

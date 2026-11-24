"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { allowFormSubmission } from "@/lib/security/rateLimit";
import { getSiteUrl } from "@/lib/siteUrl";
import { sendTeamInviteEmail } from "@/lib/email/sendTeamInviteEmail";
import { formatAdminRole, type AdminRole } from "@/lib/auth/permissions";

export type PasswordResetState = { status: "idle" | "sent" | "error"; message: string };

/** Always the same reply, so the form never reveals who has an account. */
const SENT: PasswordResetState = {
  status: "sent",
  message: "If that email belongs to an active TransVista team member, a reset link is on its way. Check your inbox (and spam folder).",
};

/**
 * "Forgot password" for admin team members.
 * Emails a one-time link to /auth/confirm, which opens the set-password page.
 */
export async function requestPasswordReset(
  _previous: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { status: "error", message: "Enter the email address you use to sign in." };
  }

  if (!(await allowFormSubmission("password_reset", { email }))) {
    return { status: "error", message: "Too many reset requests. Please wait a few minutes and try again." };
  }

  try {
    const admin = createAdminClient();
    const { data: member } = await admin
      .from("admin_team_members")
      .select("full_name, role, status, user_id")
      .eq("email", email)
      .maybeSingle();

    // Only active members with a login get an email; everyone sees the same reply.
    if (!member || member.status !== "active" || !member.user_id) return SENT;

    const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const hashedToken = link?.properties?.hashed_token;
    if (error || !hashedToken) {
      console.error("[requestPasswordReset] generateLink:", error);
      return SENT;
    }

    const siteUrl = await getSiteUrl();
    await sendTeamInviteEmail({
      fullName: member.full_name,
      email,
      roleLabel: formatAdminRole(member.role as AdminRole),
      inviteUrl: `${siteUrl}/auth/confirm?${new URLSearchParams({
        token_hash: hashedToken,
        type: "magiclink",
        next: "/invite/set-password",
      })}`,
      variant: "reset",
    });
  } catch (error) {
    // Log, but still give the neutral reply.
    console.error("[requestPasswordReset]", error);
  }

  return SENT;
}

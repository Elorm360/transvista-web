import { render } from "@react-email/render";
import { resend } from "./resend";
import WelcomeEmail from "@/emails/welcome";

/**
 * sendWelcomeEmail
 *
 * Sends a welcome email to a new community member via Resend.
 *
 * This function has a single responsibility: send welcome emails.
 * It does not know about forms, Supabase, or React components.
 *
 * @param fullName - The recipient's full name (used for personalisation)
 * @param email - The recipient's email address
 */
export async function sendWelcomeEmail(
  fullName: string,
  email: string,
) {
  try {
    const html = await render(
      <WelcomeEmail fullName={fullName} />,
    );

    const { data, error } = await resend.emails.send({
      from: "TransVista Africa <welcome@transvistaafrica.com>",
      to: email,
      subject: "🌍 Welcome to the TransVista Family!",
      html,
    });

    if (error) {
      console.error("[sendWelcomeEmail] Resend API error:", {
        name: error.name,
        message: error.message,
        statusCode: "statusCode" in error ? error.statusCode : undefined,
        to: email,
        from: "welcome@transvistaafrica.com",
      });
      throw new Error(error.message);
    }

    console.log("[sendWelcomeEmail] Email sent:", {
      id: data?.id,
      to: email,
    });

    return data;
  } catch (err) {
    console.error("[sendWelcomeEmail] Email service failed:", err);
    throw err;
  }
}

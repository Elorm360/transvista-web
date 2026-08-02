import { render } from "@react-email/render";
import { resend } from "./resend";
import AdminNotification from "@/emails/admin-notification";

/**
 * sendAdminNotification
 *
 * Sends an internal notification to info@transvistaafrica.com whenever a
 * new community member joins the waitlist.
 *
 * This function has a single responsibility: send admin notifications.
 * It does not know about forms, Supabase, or React components.
 *
 * @param fullName - The new member's full name
 * @param email - The new member's email address
 * @param phone - The new member's phone number (optional)
 * @param country - The new member's country
 * @param interest - The new member's interest/role
 */
export async function sendAdminNotification(data: {
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  interest: string;
}) {
  try {
    const html = await render(
      <AdminNotification
        fullName={data.fullName}
        email={data.email}
        phone={data.phone}
        country={data.country}
        interest={data.interest}
      />,
    );

    const { data: emailData, error } = await resend.emails.send({
      from: "TransVista Website <welcome@transvistaafrica.com>",
      to: ["info@transvistaafrica.com"],
      subject: "🎉 New TransVista Community Member",
      html,
    });

    if (error) {
      console.error("[sendAdminNotification] Resend API error:", {
        name: error.name,
        message: error.message,
        statusCode: "statusCode" in error ? error.statusCode : undefined,
        to: "info@transvistaafrica.com",
        from: "welcome@transvistaafrica.com",
      });
      throw new Error(error.message);
    }

    console.log("[sendAdminNotification] Admin notification sent:", {
      id: emailData?.id,
      to: "info@transvistaafrica.com",
    });

    return emailData;
  } catch (err) {
    console.error("[sendAdminNotification] Email service failed:", err);
    throw err;
  }
}


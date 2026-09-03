import { render } from "@react-email/render";
import BookingUpdateEmail from "@/emails/booking-update";
import { resend } from "./resend";

type SendBookingUpdateEmailInput = {
  fullName: string;
  email: string;
  reference: string;
  status: string;
  paymentStatus: string;
  amountPaid: number;
  currency: string;
  note?: string;
};

export async function sendBookingUpdateEmail(
  input: SendBookingUpdateEmailInput,
) {
  const html = await render(<BookingUpdateEmail {...input} />);
  const result = await resend.emails.send({
    from: "TransVista Africa <welcome@transvistaafrica.com>",
    to: input.email,
    subject: `${input.reference} — booking update`,
    html,
  });

  if (result.error) {
    console.error("[sendBookingUpdateEmail] Resend error:", result.error);
    return false;
  }

  return true;
}

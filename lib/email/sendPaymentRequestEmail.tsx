import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { render } from "@react-email/render";
import PaymentRequestEmail from "@/emails/payment-request";
import { createPaymentDocuments } from "@/lib/pdf/createPaymentDocuments";
import { resend } from "./resend";

type SendPaymentRequestEmailInput = {
  fullName: string;
  email: string;
  reference: string;
  bookingSummary: string;
  travellers: number;
  currency: string;
  quotedAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentType: string;
  dueDate: string;
  itinerary: string;
  message?: string;
};

export async function sendPaymentRequestEmail(
  input: SendPaymentRequestEmailInput,
) {
  const html = await render(<PaymentRequestEmail {...input} />);
  const documents = createPaymentDocuments(input);
  const policy = await readFile(
    join(
      process.cwd(),
      "public",
      "documents",
      "transvista-payment-booking-refund-policy.pdf",
    ),
  );
  const safeReference = input.reference.replace(/[^a-zA-Z0-9-]/g, "-");

  const result = await resend.emails.send({
    from: "TransVista Africa <welcome@transvistaafrica.com>",
    to: input.email,
    subject:
      input.reference +
      " - " +
      input.currency +
      " " +
      input.amountDue.toFixed(2) +
      " payment request",
    html,
    attachments: [
      {
        filename: safeReference + "-invoice.pdf",
        content: documents.invoice,
      },
      {
        filename: safeReference + "-itinerary.pdf",
        content: documents.itinerary,
      },
      {
        filename: "TransVista-Payment-Booking-Refund-Policy.pdf",
        content: policy,
      },
    ],
  });

  if (result.error) {
    console.error("[sendPaymentRequestEmail] Resend error:", result.error);
    return false;
  }

  return true;
}

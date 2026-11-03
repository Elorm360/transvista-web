import { createPaymentReceiptDocument } from "@/lib/pdf/createPaymentDocuments";
import { resend } from "./resend";

type ReceiptInput = Parameters<typeof createPaymentReceiptDocument>[0] & {
  email: string;
};

export async function sendPaymentReceiptEmail(input: ReceiptInput) {
  const pdf = createPaymentReceiptDocument(input);
  const safeReceipt = input.receiptNumber.replace(/[^a-zA-Z0-9-]/g,"-");
  const result = await resend.emails.send({
    from: "TransVista Africa <welcome@transvistaafrica.com>",
    to: input.email,
    subject: input.receiptNumber + " - payment receipt for " + input.reference,
    html: `<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6"><h2>Payment received - thank you</h2><p>Dear ${input.fullName},</p><p>We acknowledge receipt of your payment of <strong>${input.currency} ${input.amount.toFixed(2)}</strong> for booking <strong>${input.reference}</strong>.</p><p>Your receipt number is <strong>${input.receiptNumber}</strong>. The attached PDF includes this transaction and your updated booking account summary.</p><p>Thank you for choosing TransVista Africa.</p><p>Kind regards,<br/>TransVista Africa Team</p></div>`,
    attachments: [{filename:safeReceipt+".pdf",content:pdf}],
  });
  if(result.error){console.error("[sendPaymentReceiptEmail]",result.error);return {success:false,message:"Receipt email could not be delivered."};}
  return {success:true,messageId:result.data?.id ?? null};
}

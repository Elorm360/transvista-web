import { render } from "@react-email/render";
import { resend } from "./resend";
import RequestReceivedEmail from "@/emails/request-received";

type EmailDetail = {
  label: string;
  value: string;
};

type SendRequestEmailsInput = {
  fullName: string;
  email: string;
  reference: string;
  customerTitle: string;
  customerIntro: string;
  adminTitle: string;
  details: EmailDetail[];
};

export async function sendRequestEmails({
  fullName,
  email,
  reference,
  customerTitle,
  customerIntro,
  adminTitle,
  details,
}: SendRequestEmailsInput) {
  const customerHtml = await render(
    <RequestReceivedEmail
      fullName={fullName}
      reference={reference}
      title={customerTitle}
      intro={customerIntro}
      details={details}
    />,
  );
  const adminHtml = await render(
    <RequestReceivedEmail
      fullName={fullName}
      reference={reference}
      title={adminTitle}
      intro={`${fullName} submitted a new request. Review it in the TransVista admin dashboard.`}
      details={details}
      admin
    />,
  );

  const results = await Promise.allSettled([
    resend.emails.send({
      from: "TransVista Africa <welcome@transvistaafrica.com>",
      to: email,
      subject: `${reference} — we received your request`,
      html: customerHtml,
    }),
    resend.emails.send({
      from: "TransVista Africa <welcome@transvistaafrica.com>",
      to: "info@transvistaafrica.com",
      subject: `New request: ${reference}`,
      html: adminHtml,
    }),
  ]);

  const customerResult = results[0];
  return (
    customerResult.status === "fulfilled" &&
    !customerResult.value.error
  );
}

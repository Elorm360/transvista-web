import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type PaymentRequestEmailProps = {
  fullName: string;
  reference: string;
  bookingSummary: string;
  currency: string;
  amountDue: number;
  paymentType: string;
  dueDate: string;
  message?: string;
};

export default function PaymentRequestEmail({
  fullName,
  reference,
  bookingSummary,
  currency,
  amountDue,
  paymentType,
  dueDate,
  message,
}: PaymentRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Payment request for your TransVista booking {reference}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>TRANSVISTA AFRICA LTD</Text>
          <Heading style={heading}>Your payment request is ready</Heading>
          <Text style={paragraph}>Hello {fullName},</Text>
          <Text style={paragraph}>
            TransVista has prepared the payment request for your confirmed
            travel arrangements. Your invoice, itinerary and payment policy are
            attached to this email.
          </Text>

          <Section style={referenceBox}>
            <Text style={referenceLabel}>BOOKING REFERENCE</Text>
            <Text style={referenceValue}>{reference}</Text>
            <Text style={summary}>{bookingSummary}</Text>
          </Section>

          <Section style={amountBox}>
            <Text style={amountLabel}>
              {paymentType.replaceAll("-", " ").toUpperCase()} DUE
            </Text>
            <Text style={amountValue}>
              {currency} {amountDue.toFixed(2)}
            </Text>
            <Text style={deadline}>Pay by {dueDate}</Text>
          </Section>

          <Heading as="h2" style={subheading}>Mobile Money details</Heading>
          <Section style={detailsBox}>
            <Text style={detailRow}>
              <strong>MTN MoMo:</strong> 0248442916
              <br />
              <strong>Account name:</strong> TRANSVISTA AFRICA LTD
            </Text>
            <Hr style={innerHr} />
            <Text style={detailRow}>
              <strong>Telecel Cash:</strong> 0506191365
              <br />
              <strong>Account name:</strong> TRANSVISTA AFRICA LTD
            </Text>
          </Section>

          <Section style={noticeBox}>
            <Text style={notice}>
              Use <strong>{reference}</strong> as the payment reference. A
              payment is confirmed only after it reflects in the designated
              TransVista account and has been verified by our team.
            </Text>
          </Section>

          {message && (
            <Text style={messageBox}>
              <strong>Message from TransVista:</strong>
              <br />
              {message}
            </Text>
          )}

          <Text style={paragraph}>
            Please retain your proof of payment. You may reply to this email or
            call/WhatsApp payment support on{" "}
            <Link href="tel:+233248442916" style={link}>0248442916</Link>.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            TransVista Africa Ltd · Accra, Ghana
          </Text>
          <Text style={footer}>
            <Link
              href="https://transvistaafrica.com/policies/payment-booking-refunds"
              style={link}
            >
              Payment, Booking & Refund Policy
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  padding: "40px 0",
};
const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "36px 32px",
};
const brand = {
  color: "#f47b20",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  margin: "0 0 18px",
};
const heading = {
  color: "#0f172a",
  fontSize: "26px",
  lineHeight: "1.3",
  margin: "0 0 18px",
};
const subheading = {
  color: "#0f172a",
  fontSize: "17px",
  margin: "24px 0 10px",
};
const paragraph = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.65",
  margin: "0 0 16px",
};
const referenceBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "12px",
  margin: "24px 0 14px",
  padding: "18px",
};
const referenceLabel = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  margin: "0 0 5px",
};
const referenceValue = {
  color: "#1e3a8a",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 7px",
};
const summary = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};
const amountBox = {
  backgroundColor: "#fff7ed",
  border: "1px solid #fed7aa",
  borderRadius: "12px",
  margin: "0 0 24px",
  padding: "18px",
  textAlign: "center" as const,
};
const amountLabel = {
  color: "#9a3412",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  margin: "0 0 5px",
};
const amountValue = {
  color: "#7c2d12",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 5px",
};
const deadline = {
  color: "#9a3412",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};
const detailsBox = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  margin: "0 0 18px",
  padding: "18px",
};
const detailRow = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "1.65",
  margin: "0",
};
const innerHr = { borderColor: "#e2e8f0", margin: "14px 0" };
const noticeBox = {
  backgroundColor: "#f8fafc",
  borderLeft: "4px solid #2563eb",
  margin: "18px 0",
  padding: "13px 15px",
};
const notice = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};
const messageBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "10px",
  color: "#166534",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "18px 0",
  padding: "14px",
};
const hr = { borderColor: "#e4e4e7", margin: "28px 0 20px" };
const footer = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 8px",
  textAlign: "center" as const,
};
const link = { color: "#1e40af", textDecoration: "underline" };

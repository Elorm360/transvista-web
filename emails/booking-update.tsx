import {
  Body,
  Button,
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

type BookingUpdateEmailProps = {
  fullName: string;
  reference: string;
  status: string;
  paymentStatus: string;
  amountPaid: number;
  currency: string;
  note?: string;
};

export default function BookingUpdateEmail({
  fullName,
  reference,
  status,
  paymentStatus,
  amountPaid,
  currency,
  note,
}: BookingUpdateEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your TransVista booking {reference} has been updated</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>TRANSVISTA AFRICA</Text>
          <Heading style={heading}>Your booking has been updated</Heading>
          <Text style={paragraph}>Hello {fullName},</Text>
          <Text style={paragraph}>
            The TransVista team has updated your travel request. Your request
            reference remains the same.
          </Text>

          <Section style={referenceBox}>
            <Text style={referenceLabel}>REQUEST REFERENCE</Text>
            <Text style={referenceValue}>{reference}</Text>
          </Section>

          <Section style={detailsBox}>
            <Text style={detailRow}>
              <strong>Booking status:</strong> {status}
            </Text>
            <Text style={detailRow}>
              <strong>Payment status:</strong> {paymentStatus}
            </Text>
            <Text style={detailRow}>
              <strong>Amount recorded:</strong> {currency} {amountPaid.toFixed(2)}
            </Text>
            {note && (
              <Text style={noteText}>
                <strong>Message from TransVista:</strong>
                <br />
                {note}
              </Text>
            )}
          </Section>

          <Text style={paragraph}>
            Please reply to this email if any detail needs clarification. Only
            use payment instructions sent through an official TransVista
            channel.
          </Text>
          <Section style={buttonSection}>
            <Button href="https://transvistaafrica.com" style={button}>
              Visit TransVista Africa
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            <Link
              href="https://transvistaafrica.com/policies/payment-booking-refunds"
              style={link}
            >
              Payment, Booking & Refund Policy
            </Link>
          </Text>
          <Text style={footer}>
            Questions?{" "}
            <Link href="mailto:info@transvistaafrica.com" style={link}>
              info@transvistaafrica.com
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
const paragraph = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.65",
  margin: "0 0 16px",
};
const referenceBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "12px",
  margin: "24px 0",
  padding: "18px",
};
const referenceLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1px",
  margin: "0 0 5px",
};
const referenceValue = {
  color: "#1e3a8a",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
};
const detailsBox = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  margin: "0 0 24px",
  padding: "18px",
};
const detailRow = {
  color: "#475569",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 8px",
};
const noteText = {
  backgroundColor: "#fff7ed",
  borderRadius: "8px",
  color: "#7c2d12",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "16px 0 0",
  padding: "12px",
};
const buttonSection = { margin: "28px 0", textAlign: "center" as const };
const button = {
  backgroundColor: "#f47b20",
  borderRadius: "999px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  padding: "13px 24px",
  textDecoration: "none",
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

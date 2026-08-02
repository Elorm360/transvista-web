import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AdminNotificationProps {
  /** The new member's full name */
  fullName: string;
  /** The new member's email address */
  email: string;
  /** The new member's phone number (optional) */
  phone?: string;
  /** The new member's country */
  country: string;
  /** The new member's interest/role */
  interest: string;
}

/**
 * AdminNotification
 *
 * Internal notification sent to info@transvistaafrica.com whenever a new
 * person joins the TransVista Community. Kept deliberately clean and
 * information-focused so it's easy to scan at a glance.
 *
 * This is an internal tool — not customer-facing — so clarity beats polish.
 */
export default function AdminNotification({
  fullName,
  email,
  phone,
  country,
  interest,
}: AdminNotificationProps) {
  const previewText = `🎉 New TransVista Community Member: ${fullName}`;

  const submittedAt = new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            🎉 New TransVista Community Member
          </Heading>

          <Text style={paragraph}>
            A new person has joined the TransVista Family.
          </Text>

          <Hr style={hr} />

          {/* Member details */}
          <Section style={detailsSection}>
            <Text style={label}>Name:</Text>
            <Text style={value}>{fullName}</Text>

            <Text style={label}>Email:</Text>
            <Text style={value}>{email}</Text>

            {phone && (
              <>
                <Text style={label}>Phone:</Text>
                <Text style={value}>{phone}</Text>
              </>
            )}

            <Text style={label}>Country:</Text>
            <Text style={value}>{country}</Text>

            <Text style={label}>Interest:</Text>
            <Text style={value}>{interest}</Text>
          </Section>

          <Hr style={hr} />

          {/* Meta */}
          <Text style={label}>Submitted from:</Text>
          <Text style={value}>https://transvistaafrica.com</Text>

          <Text style={label}>Time:</Text>
          <Text style={value}>{submittedAt}</Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ───────────────────────────────────────────────

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "40px 32px",
};

const heading = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 16px",
  textAlign: "left" as const,
};

const paragraph = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
};

const detailsSection = {
  margin: "0 0 0 0",
};

const label = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "600",
  lineHeight: "1.5",
  margin: "12px 0 2px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const value = {
  color: "#0f172a",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1.5",
  margin: "0 0 4px",
};


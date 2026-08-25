import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { isPartnerInterest } from "@/lib/waitlist/intent";

interface WelcomeEmailProps {
  /** The recipient's full name */
  fullName: string;
  /** Waitlist interest, used to send traveler vs partner follow-up copy */
  interest?: string;
}

/**
 * WelcomeEmail
 *
 * Sent to new community members after they join the TransVista waitlist.
 * Designed to feel like an extension of the product — same tone, branding,
 * and professionalism as the website.
 */
export default function WelcomeEmail({
  fullName,
  interest = "Traveler",
}: WelcomeEmailProps) {
  const partner = isPartnerInterest(interest);
  const previewText = partner
    ? `Welcome to the TransVista partner community, ${fullName}.`
    : `Welcome to the TransVista Family, ${fullName}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://transvistaafrica.com/images/hero/transvista-logo.png"
              alt="TransVista Africa"
              width="180"
              height="60"
              style={logo}
            />
          </Section>

          <Hr style={hr} />

          <Heading style={heading}>
            Welcome to the TransVista Family!
          </Heading>

          <Text style={paragraph}>Hello {fullName},</Text>

          {partner ? (
            <>
              <Text style={paragraph}>
                Thank you for joining as a partner. You&apos;re on the list for
                TransVista&apos;s travel ecosystem — transport, stays, guides,
                and tourism businesses connected in one trusted network.
              </Text>
              <Text style={paragraph}>We&apos;ll email you about:</Text>
              <Text style={listItem}>✓ When partner onboarding opens</Text>
              <Text style={listItem}>✓ How verified providers join the platform</Text>
              <Text style={listItem}>✓ Ecosystem and launch updates</Text>
              <Text style={listItem}>✓ The right moment to get involved</Text>
            </>
          ) : (
            <>
              <Text style={paragraph}>
                Thank you for joining the TransVista Family as a traveler.
                You&apos;re one of our earliest community members as we build a
                trusted way to plan Ghana — transport, experiences, and local
                partners in one journey.
              </Text>
              <Text style={paragraph}>We&apos;ll keep you updated with:</Text>
              <Text style={listItem}>✓ Product launch announcements</Text>
              <Text style={listItem}>✓ New destinations and travel experiences</Text>
              <Text style={listItem}>✓ Early access before public launch</Text>
              <Text style={listItem}>✓ Stories from Accra, Cape Coast, Volta, Mole, and beyond</Text>
            </>
          )}

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button
              href="https://transvistaafrica.com"
              style={button}
            >
              Visit Our Website
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footerHeading}>Need assistance?</Text>

          <Text style={footer}>
            <Link href="mailto:info@transvistaafrica.com" style={link}>
              info@transvistaafrica.com
            </Link>
          </Text>

          <Text style={footer}>
            <Link href="https://transvistaafrica.com" style={link}>
              www.transvistaafrica.com
            </Link>
          </Text>

          <Text style={footer}>Made with ❤️ in Accra, Ghana</Text>
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

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logo = {
  margin: "0 auto",
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
};

const heading = {
  color: "#0f172a",
  fontSize: "24px",
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

const listItem = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 8px",
  paddingLeft: "4px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0 24px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 28px",
  textDecoration: "none",
};

const footerHeading = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const footer = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

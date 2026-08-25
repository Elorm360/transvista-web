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

interface TeamInviteEmailProps {
  fullName: string;
  roleLabel: string;
  inviteUrl: string;
}

/**
 * TeamInviteEmail
 *
 * Sent when the TransVista owner invites a new admin team member.
 */
export default function TeamInviteEmail({
  fullName,
  roleLabel,
  inviteUrl,
}: TeamInviteEmailProps) {
  const previewText = `You've been invited to the TransVista admin team as ${roleLabel}.`;

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
            You&apos;re invited to TransVista Admin
          </Heading>

          <Text style={paragraph}>Hello {fullName},</Text>

          <Text style={paragraph}>
            You&apos;ve been invited to join the TransVista administration
            team as <strong>{roleLabel}</strong>.
          </Text>

          <Text style={paragraph}>
            Click the button below to create your password and sign in.
            This link is unique to you and should not be shared.
          </Text>

          <Section style={buttonSection}>
            <Button href={inviteUrl} style={button}>
              Accept invitation
            </Button>
          </Section>

          <Text style={paragraph}>
            If the button does not work, copy and paste this link into your
            browser:
          </Text>

          <Text style={footer}>
            <Link href={inviteUrl} style={link}>
              {inviteUrl}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={footerHeading}>Need assistance?</Text>

          <Text style={footer}>
            <Link href="mailto:info@transvistaafrica.com" style={link}>
              info@transvistaafrica.com
            </Link>
          </Text>

          <Text style={footer}>Made with ❤️ in Accra, Ghana</Text>
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
  wordBreak: "break-all" as const,
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

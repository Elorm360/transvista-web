import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface TeamInvitationEmailProps {
  recipientName: string;
  role: string;
  inviteUrl: string;
}

function formatRoleLabel(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * TeamInvitationEmail
 *
 * Branded invitation sent when the TransVista owner adds a team member.
 * Rendered on the server by `sendTeamInvitation` — never in the browser.
 */
export default function TeamInvitationEmail({
  recipientName,
  role,
  inviteUrl,
}: TeamInvitationEmailProps) {
  const roleLabel = formatRoleLabel(role);
  const previewText = `You've been invited to join the TransVista team as ${roleLabel}.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          margin: 0,
          padding: "32px 16px",
          backgroundColor: "#f1f5f9",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            maxWidth: "560px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Section
            style={{
              padding: "28px 32px",
              backgroundColor: "#081235",
            }}
          >
            <Img
              src="https://transvistaafrica.com/images/hero/transvista-logo.png"
              alt="TransVista Africa"
              width="160"
              height="54"
              style={{ display: "block" }}
            />
          </Section>

          {/* Body */}
          <Section style={{ padding: "32px" }}>
            <Heading
              style={{
                margin: "0 0 16px",
                fontSize: "24px",
                lineHeight: "1.3",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              You&apos;re invited to the TransVista team
            </Heading>

            <Text
              style={{
                margin: "0 0 16px",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#334155",
              }}
            >
              Hello {recipientName},
            </Text>

            <Text
              style={{
                margin: "0 0 16px",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#334155",
              }}
            >
              You&apos;ve been invited to join TransVista Africa as{" "}
              <strong>{roleLabel}</strong>. Accept the invitation to set up
              your account and start collaborating with the team.
            </Text>

            <Section style={{ margin: "28px 0 0" }}>
              <Button
                href={inviteUrl}
                style={{
                  backgroundColor: "#f47b20",
                  color: "#ffffff",
                  display: "inline-block",
                  padding: "14px 28px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                Join the TransVista Team
              </Button>
            </Section>

            <Text
              style={{
                margin: "28px 0 0",
                fontSize: "13px",
                lineHeight: "1.6",
                color: "#64748b",
              }}
            >
              Clicking the button will take you to TransVista
              where you can securely set up your account password.
            </Text>

            <Hr
              style={{
                margin: "32px 0",
                borderColor: "#e2e8f0",
              }}
            />

            <Text
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "1.6",
                color: "#94a3b8",
              }}
            >
              If you were not expecting this invitation, you can
              safely ignore this email.
            </Text>
          </Section>

          {/* Footer */}
          <Section
            style={{
              padding: "24px 32px",
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "1.6",
                color: "#64748b",
              }}
            >
              TransVista Africa
              <br />
              Accra, Ghana
              <br />
              info@transvistaafrica.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

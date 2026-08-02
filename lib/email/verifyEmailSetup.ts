import { resend } from "./resend";

/**
 * verifyEmailSetup
 *
 * Diagnostic utility for checking the Resend email configuration.
 * Run via `node -e "..."` or a script to confirm:
 *   1. The API key is valid and can reach the Resend API.
 *   2. The sender domain is registered and verified.
 *   3. Recent emails are actually being sent (optional).
 *
 * This is NOT called in the app runtime — it's a developer tool.
 *
 * @example
 * ```ts
 * import { verifyEmailSetup } from "@/lib/email/verifyEmailSetup";
 * await verifyEmailSetup();
 * ```
 */
export async function verifyEmailSetup(): Promise<void> {
  console.log("🔍 Verifying Resend email setup...");

  // 1. Check domains
  const domains = await resend.domains.list();
  if (domains.error) {
    console.error("❌ Failed to list domains:", domains.error);
    return;
  }

  const domainName = "transvistaafrica.com";
  const domain = domains.data?.data?.find(
    (d) => d.name.toLowerCase() === domainName,
  );

  if (!domain) {
    console.warn(
      `⚠️  Domain "${domainName}" is not registered in this Resend account.`,
    );
    console.warn(
      "   Add it in the Resend dashboard: https://resend.com/domains",
    );
  } else {
    console.log(`✅ Domain "${domainName}" found.`);
    console.log(`   Status: ${domain.status}`);
    console.log(`   Region: ${domain.region}`);

    const cap = domain.capabilities;
    if (cap) {
      console.log(`   Sending:   ${cap.sending}`);
      console.log(`   Receiving: ${cap.receiving}`);
    }

    if (domain.status !== "verified") {
      console.warn(
        "⚠️  Domain is NOT verified. Emails sent from this domain may fail or be rejected.",
      );
      console.warn(
        "   Complete DNS verification in the Resend dashboard.",
      );
    }
  }

  // 2. Check recent emails (if any have been sent)
  const emails = await resend.emails.list();
  if (emails.error) {
    console.error("❌ Failed to list emails:", emails.error);
  } else if (emails.data?.data?.length) {
    const recent = emails.data.data;
    console.log(`📬 ${recent.length} recent email(s) found:`);
    for (const email of recent.slice(0, 5)) {
      console.log(
        `   • ${email.subject ?? "(no subject)"} → ${Array.isArray(email.to) ? email.to.join(", ") : email.to}`,
      );
    }
  } else {
    console.log(
      "📭 No emails found. If the form was submitted, emails may not be reaching Resend.",
    );
  }

  console.log("✅ Verification complete.");
}


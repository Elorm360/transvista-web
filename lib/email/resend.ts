import { Resend } from "resend";

/**
 * Resend client
 *
 * A single shared Resend client for all transactional emails.
 * Uses the RESEND_API_KEY environment variable.
 *
 * Every email in the application should use this client.
 *
 * @example
 * ```ts
 * import { resend } from "@/lib/email/resend";
 *
 * await resend.emails.send({
 *   from: "TransVista <hello@transvistaafrica.com>",
 *   to: user.email,
 *   subject: "Welcome to TransVista",
 *   react: <WelcomeEmail />,
 * });
 * ```
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

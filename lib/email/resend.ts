import { Resend } from "resend";

/**
 * Resend client
 *
 * A single shared Resend client for all transactional emails.
 * Uses the RESEND_API_KEY environment variable.
 *
 * Instantiated lazily so a missing key produces a clear server error
 * instead of crashing at import time.
 */
let client: Resend | null = null;

export function getResend(): Resend {
  if (client) return client;

  const apiKey = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "");

  if (!apiKey || apiKey === "re_123" || apiKey.length < 20) {
    throw new Error(
      "RESEND_API_KEY is missing or invalid. Copy the full key from https://resend.com/api-keys into .env.local (it starts with re_ and is much longer than re_123), then restart the server.",
    );
  }

  client = new Resend(apiKey);
  return client;
}

/**
 * Shared Resend client. Prefer getResend() in new code.
 */
export const resend = {
  get emails() {
    return getResend().emails;
  },
  get domains() {
    return getResend().domains;
  },
};

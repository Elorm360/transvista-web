import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Durable rate limiting for public forms.
 *
 * Counters live in Supabase (`private.rate_limit_hits`, via the
 * service-role-only `consume_rate_limit` function), so limits hold across
 * every serverless instance. IPs and emails are HMAC-hashed before they
 * leave this server; nothing readable is stored.
 *
 * Fails open: if the check itself errors (e.g. the service-role key is
 * missing locally), the submission is allowed and the error is logged.
 * A broken limiter must never block real customers.
 */

type Rule = { limit: number; windowSeconds: number };

type FormRules = {
  /** Per visitor (IP address). */
  ip: Rule;
  /** Per email address entered — for forms that send email to it. */
  email?: Rule;
};

const TEN_MINUTES = 10 * 60;
const ONE_HOUR = 60 * 60;

export const FORM_RATE_LIMITS = {
  waitlist: {
    ip: { limit: 5, windowSeconds: TEN_MINUTES },
    email: { limit: 3, windowSeconds: ONE_HOUR },
  },
  trip_request: {
    ip: { limit: 5, windowSeconds: TEN_MINUTES },
    email: { limit: 3, windowSeconds: ONE_HOUR },
  },
  package_reservation: {
    ip: { limit: 5, windowSeconds: TEN_MINUTES },
    email: { limit: 3, windowSeconds: ONE_HOUR },
  },
  event_feedback: {
    ip: { limit: 10, windowSeconds: TEN_MINUTES },
  },
  review: {
    ip: { limit: 5, windowSeconds: TEN_MINUTES },
  },
  password_reset: {
    ip: { limit: 5, windowSeconds: TEN_MINUTES },
    email: { limit: 3, windowSeconds: ONE_HOUR },
  },
} satisfies Record<string, FormRules>;

export type RateLimitedForm = keyof typeof FORM_RATE_LIMITS;

/** Friendly message to show when a submission is throttled. */
export const RATE_LIMIT_MESSAGE =
  "You've sent several requests in a short time. Please wait a few minutes and try again, or message us on WhatsApp.";

function clientIp(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

function hashKey(secret: string, form: string, kind: string, value: string) {
  const digest = createHmac("sha256", secret)
    .update(`${form}:${kind}:${value}`)
    .digest("hex")
    .slice(0, 40);
  return `${form}:${kind}:${digest}`;
}

/**
 * Record a submission attempt and report whether it may proceed.
 *
 * @returns true when allowed, false when the caller should be throttled.
 */
export async function allowFormSubmission(
  form: RateLimitedForm,
  options: { email?: string } = {},
): Promise<boolean> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    console.warn("[rateLimit] SUPABASE_SERVICE_ROLE_KEY missing; skipping rate limit.");
    return true;
  }

  const rules: FormRules = FORM_RATE_LIMITS[form];
  const checks: Array<{ key: string; rule: Rule }> = [
    { key: hashKey(secret, form, "ip", clientIp(await headers())), rule: rules.ip },
  ];

  const email = options.email?.trim().toLowerCase();
  if (rules.email && email) {
    checks.push({ key: hashKey(secret, form, "email", email), rule: rules.email });
  }

  try {
    const supabase = createAdminClient();

    // Check in order and stop at the first limit hit, so a blocked visitor
    // does not also use up the email allowance.
    for (const { key, rule } of checks) {
      const { data, error } = await supabase.rpc("consume_rate_limit", {
        p_key: key,
        p_limit: rule.limit,
        p_window_seconds: rule.windowSeconds,
      });

      if (error) throw error;
      if (data === false) {
        console.warn(`[rateLimit] Throttled ${form} (${key.split(":")[1]})`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("[rateLimit] Check failed; allowing submission:", error);
    return true;
  }
}

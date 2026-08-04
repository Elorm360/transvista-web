"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import { sendAdminNotification } from "@/lib/email/sendAdminNotification";

/**
 * joinWaitlist
 *
 * Server Action that validates and inserts a waitlist lead into Supabase,
 * then sends the welcome email and an internal admin notification.
 *
 * Architecture:
 *   Browser → Client Validation → Server Action → Supabase → Welcome Email
 *            → Admin Notification → Success
 *
 * Order of operations:
 *   1. Save lead to database — this is the most important action.
 *   2. Send welcome email — if this fails, we still return success.
 *      The lead is never lost, and we can retry the email later.
 *   2.5 Send admin notification — independently wrapped in its own
 *       try/catch so a failure here never blocks the welcome email or
 *       the success response.
 *   3. Return success to the user.
 *
 * Centralizing all database writes in a single action makes it easy to
 * extend with email automation, Slack notifications, analytics, and
 * rate limiting later — without changing any component code.
 */
export async function joinWaitlist(data: {
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  interest: string;
}) {
  const fullName = data.fullName.trim();
  const normalizedEmail = data.email.trim().toLowerCase();
  const phone = data.phone?.trim() || null;
  const country = data.country.trim();
  const interest = data.interest.trim();

  /* ── Server-side validation (never trust client input) ── */
  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!country) {
    throw new Error("Country is required.");
  }

  if (!interest) {
    throw new Error("Interest is required.");
  }

  /* ── Step 1: Check for duplicates before insert ── */
  const supabase = await createClient();

  const { data: existingLead, error: lookupError } = await supabase
    .from("leads")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (existingLead) {
    const duplicateError = new Error("duplicate");
    duplicateError.name = "DuplicateWaitlistEntry";
    throw duplicateError;
  }

  /* ── Step 2: Insert into Supabase ── */
  const { error } = await supabase.from("leads").insert({
    full_name: fullName,
    email: normalizedEmail,
    phone,
    country,
    interest,
  });

  if (error) {
    throw new Error(error.message);
  }

  /* ── Step 2: Send welcome email (graceful failure) ── */
  let emailSent = false;
  try {
    await sendWelcomeEmail(fullName, normalizedEmail);
    emailSent = true;
  } catch (emailError) {
    console.error("[joinWaitlist] Failed to send welcome email:", {
      error:
        emailError instanceof Error
          ? {
              name: emailError.name,
              message: emailError.message,
              stack: emailError.stack,
            }
          : emailError,
      lead: {
        email: normalizedEmail,
        fullName,
      },
    });
  }

  /* ── Step 2.5: Send admin notification (graceful failure) ── */
  let adminNotified = false;
  try {
    await sendAdminNotification({
      fullName,
      email: normalizedEmail,
      phone: phone ?? undefined,
      country,
      interest,
    });
    adminNotified = true;
  } catch (notificationError) {
    console.error("[joinWaitlist] Failed to send admin notification:", {
      error:
        notificationError instanceof Error
          ? {
              name: notificationError.name,
              message: notificationError.message,
              stack: notificationError.stack,
            }
          : notificationError,
      lead: {
        email: normalizedEmail,
        fullName,
      },
    });
  }

  /* ── Step 3: Return success ── */
  return { success: true, emailSent, adminNotified };
}

"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type EventFeedbackResult = { success: boolean; message?: string; invitePublicStory?: boolean };

const EVENT_SLUG = "central-region-heritage-adventure-2026";

const EVENT_TITLE = "Central Region Heritage & Adventure Day Trip";

// Only travellers who paid (and so could have travelled) may leave feedback.
const ALLOWED_BOOKING_STATUSES = [
  "deposit-paid",
  "paid",
  "in-progress",
  "completed",
];

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

/**
 * Compare Ghanaian phone numbers regardless of how they were typed:
 * "024 123 4567", "0241234567", "+233 24 123 4567" and "00233241234567" all match.
 * Uses the last 9 digits (the subscriber number without the leading 0 or 233).
 */
function phoneKey(value: unknown): string | null {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("233")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.length >= 9 ? digits.slice(-9) : null;
}

function rating(value: unknown, min: number, max: number) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

export async function submitEventFeedback(form: FormData): Promise<EventFeedbackResult> {
  if (clean(form.get("website"), 200)) return { success: true };
  const contact = clean(form.get("contact"), 254);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^[+\d][\d\s()-]{6,24}$/.test(contact);
  const overallRating = rating(form.get("overallRating"), 1, 5);
  const transportRating = rating(form.get("transportRating"), 1, 5);
  const organisationRating = rating(form.get("organisationRating"), 1, 5);
  const itineraryRating = rating(form.get("itineraryRating"), 1, 5);
  const guideRating = rating(form.get("guideRating"), 1, 5);
  const valueRating = rating(form.get("valueRating"), 1, 5);
  const recommendationScore = rating(form.get("recommendationScore"), 0, 10);
  const wouldTravelAgain = clean(form.get("wouldTravelAgain"), 10);
  const favouritePart = clean(form.get("favouritePart"), 1200);
  const improvementSuggestion = clean(form.get("improvementSuggestion"), 1200);
  const nextDestinationInterest = clean(form.get("nextDestinationInterest"), 240);

  if (!isEmail && !isPhone) {
    return { success: false, message: "Enter the email address or phone number you used when registering." };
  }
  if ([overallRating, transportRating, organisationRating, itineraryRating, guideRating, valueRating, recommendationScore].some((value) => value === null)) {
    return { success: false, message: "Please complete all ratings and the recommendation score." };
  }
  if (!["yes", "maybe", "no"].includes(wouldTravelAgain)) {
    return { success: false, message: "Please tell us whether you would travel with TransVista again." };
  }

  const admin = createAdminClient();
  const { data: candidates, error: bookingError } = await admin
    .from("package_reservations")
    .select("reference, full_name, email, phone, package_title")
    .eq("package_slug", EVENT_SLUG)
    .in("status", ALLOWED_BOOKING_STATUSES)
    .is("archived_at", null)
    .limit(1000);

  const wantedPhone = isEmail ? null : phoneKey(contact);
  const matches = (candidates ?? []).filter((row) =>
    isEmail
      ? String(row.email ?? "").trim().toLowerCase() === contact.toLowerCase()
      : wantedPhone !== null && phoneKey(row.phone) === wantedPhone,
  );

  if (bookingError || matches.length !== 1) {
    if (bookingError) console.error("[submitEventFeedback] lookup failed:", bookingError);
    return { success: false, message: "We could not match those details to a single paid registration. Check the contact detail you entered when registering, or contact the TransVista team for help." };
  }

  const booking = matches[0];
  const { error } = await admin.from("event_feedback").insert({
    event_slug: EVENT_SLUG,
    event_title: EVENT_TITLE,
    booking_reference: booking.reference,
    full_name: booking.full_name,
    email: booking.email,
    overall_rating: overallRating,
    transport_rating: transportRating,
    organisation_rating: organisationRating,
    itinerary_rating: itineraryRating,
    guide_rating: guideRating,
    value_rating: valueRating,
    recommendation_score: recommendationScore,
    favourite_part: favouritePart || null,
    improvement_suggestion: improvementSuggestion || null,
    would_travel_again: wouldTravelAgain,
    next_destination_interest: nextDestinationInterest || null,
  });

  if (error?.code === "23505") {
    return { success: false, message: "Feedback has already been submitted for this registration. Thank you for taking the time to help us improve." };
  }
  if (error) {
    console.error("[submitEventFeedback]", error);
    return { success: false, message: "We could not save your feedback just now. Please try again shortly." };
  }

  // Delighted travellers are invited to share a public story as well.
  const invitePublicStory = (recommendationScore ?? 0) >= 9 && (overallRating ?? 0) >= 4;
  return { success: true, invitePublicStory };
}

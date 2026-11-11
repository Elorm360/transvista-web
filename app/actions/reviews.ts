"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleFor } from "@/lib/auth/isAdmin";
import { canAccess } from "@/lib/auth/permissions";

export type ReviewInput = {
  fullName: string;
  location: string;
  tripName: string;
  rating: number;
  review: string;
  email: string;
  bookingReference: string;
  consent: boolean;
  website?: string; // honeypot — must stay empty
};

export type ReviewResult = {
  success: boolean;
  published?: boolean;
  message?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const linkPattern = /(https?:\/\/|www\.|\.(com|net|org|xyz|ru|info)\b)/i;

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

/** Bookings that count as "travelled with TransVista". */
const PACKAGE_DONE = ["deposit-paid", "paid", "in-progress", "completed"];
const CUSTOM_DONE = ["confirmed", "in-progress", "completed"];

/**
 * Find a real booking matching this reference + email.
 * Returns the trip name when verified, otherwise null.
 */
async function verifyBooking(reference: string, email: string): Promise<string | null> {
  if (!reference || !email) return null;
  const admin = createAdminClient();

  const { data: pkg } = await admin
    .from("package_reservations")
    .select("package_title")
    .eq("reference", reference)
    .eq("email", email)
    .in("status", PACKAGE_DONE)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();
  if (pkg) return pkg.package_title as string;

  const { data: custom } = await admin
    .from("trip_requests")
    .select("destinations")
    .eq("reference", reference)
    .eq("email", email)
    .in("status", CUSTOM_DONE)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();
  if (custom) {
    const places = (custom.destinations as string[] | null)?.slice(0, 2).join(" & ");
    return places ? `Custom trip: ${places}` : "Custom Ghana trip";
  }
  return null;
}

export async function submitReview(input: ReviewInput): Promise<ReviewResult> {
  // Bots fill hidden fields; pretend success and store nothing.
  if (input.website) return { success: true, published: false };

  const fullName = clean(input.fullName, 80);
  const location = clean(input.location, 80);
  let tripName = clean(input.tripName, 120);
  const review = String(input.review ?? "").trim().replace(/[ \t]+/g, " ").slice(0, 1200);
  const email = clean(input.email, 254).toLowerCase();
  const bookingReference = clean(input.bookingReference, 40).toUpperCase();
  const rating = Math.round(Number(input.rating));

  if (fullName.length < 2) return { success: false, message: "Please enter your name." };
  if (tripName.length < 2 && !bookingReference) {
    return { success: false, message: "Please tell us which trip you joined." };
  }
  if (!(rating >= 1 && rating <= 5)) return { success: false, message: "Please choose a star rating." };
  if (review.length < 20) {
    return { success: false, message: "Please write at least a couple of sentences (20+ characters)." };
  }
  if (linkPattern.test(review) || linkPattern.test(fullName)) {
    return { success: false, message: "Please remove any links from your review." };
  }
  if (email && !emailPattern.test(email)) {
    return { success: false, message: "Please check your email address." };
  }
  if (bookingReference && !email) {
    return { success: false, message: "Add the email you booked with so we can verify your trip." };
  }
  if (!input.consent) {
    return { success: false, message: "Please allow us to show your review on our website." };
  }

  let verifiedTrip: string | null = null;
  try {
    verifiedTrip = await verifyBooking(bookingReference, email);
  } catch (error) {
    console.error("[submitReview] verification failed:", error);
  }
  const verified = Boolean(verifiedTrip);
  if (verified && tripName.length < 2) tripName = verifiedTrip!;
  if (tripName.length < 2) tripName = "TransVista trip";

  const now = new Date().toISOString();
  const admin = createAdminClient();
  const { error } = await admin.from("traveller_reviews").insert({
    full_name: fullName,
    location: location || null,
    trip_name: tripName,
    rating,
    review,
    email: email || null,
    booking_reference: bookingReference || null,
    verified,
    status: verified ? "approved" : "pending",
    published_at: verified ? now : null,
    consent_to_publish: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "A review has already been shared for this booking reference. Thank you!" };
    }
    console.error("[submitReview] insert failed:", error);
    return { success: false, message: "We could not save your review. Please try again." };
  }

  if (verified) {
    revalidatePath("/stories");
    revalidatePath("/");
  }
  return { success: true, published: verified };
}

/** Staff: approve, hide, or put a review back in the queue. */
export async function moderateReview(
  reviewId: string,
  status: "approved" | "hidden" | "pending",
): Promise<ReviewResult> {
  if (!reviewId || !["approved", "hidden", "pending"].includes(status)) {
    return { success: false, message: "Invalid request." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = await roleFor(user);
  if (!user || !canAccess(role, "community")) {
    return { success: false, message: "You are not allowed to moderate reviews." };
  }

  const { data: member } = await supabase
    .from("admin_team_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("traveller_reviews")
    .update({
      status,
      reviewed_by: member?.id ?? null,
      reviewed_at: now,
      published_at: status === "approved" ? now : null,
    })
    .eq("id", reviewId);

  if (error) {
    console.error("[moderateReview]", error);
    return { success: false, message: "Could not update the review." };
  }

  revalidatePath("/stories");
  revalidatePath("/");
  revalidatePath("/admin/reviews");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleFor } from "@/lib/auth/isAdmin";
import { canAccess } from "@/lib/auth/permissions";
import { isAdinkraId } from "@/components/reviews/AdinkraAvatars";

export type ReviewResult = {
  success: boolean;
  published?: boolean;
  photoPending?: boolean;
  message?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const linkPattern = /(https?:\/\/|www\.|\.(com|net|org|xyz|ru|info)\b)/i;
const MAX_PHOTO_BYTES = 900 * 1024; // the browser shrinks photos before sending
const PENDING_BUCKET = "review-photos-pending";
const PUBLIC_BUCKET = "review-photos";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

/** Bookings that count as "travelled with TransVista". */
const PACKAGE_DONE = ["deposit-paid", "paid", "in-progress", "completed"];
const CUSTOM_DONE = ["confirmed", "in-progress", "completed"];

/** Find a real booking matching this exact reference + email. Returns the trip name when verified. */
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

/**
 * Re-encode an uploaded photo on the server:
 * confirms it is a real image, fixes rotation, crops to a 400×400 square,
 * and removes ALL hidden metadata (including GPS location).
 * Returns null if the file is not a usable image or processing is unavailable.
 */
async function processPhoto(file: File): Promise<Buffer | null> {
  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) return null;
  try {
    const { default: sharp } = await import("sharp");
    const input = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
    if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) return null;
    return await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate() // apply phone orientation, then drop it
      .resize(400, 400, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true }) // sharp strips EXIF/GPS by default
      .toBuffer();
  } catch (error) {
    console.error("[processPhoto]", error);
    return null;
  }
}

export async function submitReview(form: FormData): Promise<ReviewResult> {
  // Bots fill hidden fields; pretend success and store nothing.
  if (clean(form.get("website"), 200)) return { success: true, published: false };

  const fullName = clean(form.get("fullName"), 80);
  const location = clean(form.get("location"), 80);
  let tripName = clean(form.get("tripName"), 120);
  const review = String(form.get("review") ?? "").trim().replace(/[ \t]+/g, " ").slice(0, 1200);
  const email = clean(form.get("email"), 254).toLowerCase();
  const bookingReference = clean(form.get("bookingReference"), 40).toUpperCase();
  const rating = Math.round(Number(form.get("rating")));
  const consent = form.get("consent") === "on";
  const avatarRaw = clean(form.get("avatar"), 30);
  const avatar = isAdinkraId(avatarRaw) ? avatarRaw : null;
  const photo = form.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  const photoConsent = form.get("photoConsent") === "on";

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
  if (!consent) {
    return { success: false, message: "Please allow us to show your review on our website." };
  }
  if (hasPhoto && !photoConsent) {
    return { success: false, message: "Please confirm the photo is of you and can be shown on our website." };
  }

  const admin = createAdminClient();
  const reviewId = crypto.randomUUID();

  // 1. Process and store the photo privately (it is only shown after staff approval).
  let photoPath: string | null = null;
  if (hasPhoto) {
    const processed = await processPhoto(photo as File);
    if (!processed) {
      return { success: false, message: "We couldn't use that photo. Please try a JPG or PNG under 5 MB, or choose an avatar instead." };
    }
    photoPath = `${reviewId}.jpg`;
    const { error: uploadError } = await admin.storage
      .from(PENDING_BUCKET)
      .upload(photoPath, processed, { contentType: "image/jpeg", upsert: false });
    if (uploadError) {
      console.error("[submitReview] photo upload failed:", uploadError);
      return { success: false, message: "We couldn't upload your photo. Please try again." };
    }
  }

  // 2. Verify the booking (verified reviews go live immediately).
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
  const { error } = await admin.from("traveller_reviews").insert({
    id: reviewId,
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
    avatar_choice: avatar,
    photo_status: photoPath ? "pending" : "none",
    photo_path: photoPath,
    photo_consent: Boolean(photoPath && photoConsent),
  });

  if (error) {
    if (photoPath) await admin.storage.from(PENDING_BUCKET).remove([photoPath]);
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
  return { success: true, published: verified, photoPending: Boolean(photoPath) };
}

/** Make sure the signed-in user is allowed to moderate; returns their team-member id. */
async function requireModerator(): Promise<{ ok: true; memberId: string | null } | { ok: false }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = await roleFor(user);
  if (!user || !canAccess(role, "community")) return { ok: false };
  const { data: member } = await supabase
    .from("admin_team_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { ok: true, memberId: member?.id ?? null };
}

/** Staff: approve, hide, or put a review back in the queue. */
export async function moderateReview(
  reviewId: string,
  status: "approved" | "hidden" | "pending",
): Promise<ReviewResult> {
  if (!reviewId || !["approved", "hidden", "pending"].includes(status)) {
    return { success: false, message: "Invalid request." };
  }
  const auth = await requireModerator();
  if (!auth.ok) return { success: false, message: "You are not allowed to moderate reviews." };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("traveller_reviews")
    .update({
      status,
      reviewed_by: auth.memberId,
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

/** Staff: approve a pending photo (moves it to public storage) or remove it entirely. */
export async function moderatePhoto(
  reviewId: string,
  action: "approve" | "remove",
): Promise<ReviewResult & { photoUrl?: string | null }> {
  if (!reviewId || !["approve", "remove"].includes(action)) {
    return { success: false, message: "Invalid request." };
  }
  const auth = await requireModerator();
  if (!auth.ok) return { success: false, message: "You are not allowed to moderate photos." };

  const admin = createAdminClient();
  const { data: row, error: readError } = await admin
    .from("traveller_reviews")
    .select("photo_path, photo_status")
    .eq("id", reviewId)
    .maybeSingle();
  if (readError || !row?.photo_path) return { success: false, message: "No photo found for this review." };

  const path = row.photo_path as string;

  if (action === "remove") {
    await admin.storage.from(PENDING_BUCKET).remove([path]);
    await admin.storage.from(PUBLIC_BUCKET).remove([path]);
    const { error } = await admin
      .from("traveller_reviews")
      .update({ photo_status: "removed", photo_url: null, photo_path: null, reviewed_by: auth.memberId, reviewed_at: new Date().toISOString() })
      .eq("id", reviewId);
    if (error) return { success: false, message: "Could not remove the photo." };
  } else {
    const { data: file, error: dlError } = await admin.storage.from(PENDING_BUCKET).download(path);
    if (dlError || !file) return { success: false, message: "Could not read the pending photo." };
    const { error: upError } = await admin.storage
      .from(PUBLIC_BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: "image/jpeg", upsert: true });
    if (upError) return { success: false, message: "Could not publish the photo." };
    const { data: pub } = admin.storage.from(PUBLIC_BUCKET).getPublicUrl(path);
    const { error } = await admin
      .from("traveller_reviews")
      .update({ photo_status: "approved", photo_url: pub.publicUrl, reviewed_by: auth.memberId, reviewed_at: new Date().toISOString() })
      .eq("id", reviewId);
    if (error) return { success: false, message: "Could not save the photo approval." };
    await admin.storage.from(PENDING_BUCKET).remove([path]);
  }

  revalidatePath("/stories");
  revalidatePath("/");
  revalidatePath("/admin/reviews");
  return { success: true };
}

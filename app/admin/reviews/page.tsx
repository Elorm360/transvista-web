import { Star } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import ReviewModeration, { type AdminReview } from "@/components/admin/ReviewModeration";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  // Only owners, admins and community managers reach this point.
  await requireAdminArea("community");

  // Full rows (including private email/reference) are read server-side only,
  // after the role check above, and never sent to public pages.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("traveller_reviews")
    .select("id, full_name, location, trip_name, rating, review, email, booking_reference, verified, status, created_at, avatar_choice, photo_status, photo_path, photo_url")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) console.error("[AdminReviewsPage]", error);

  // Pending photos live in private storage: create short-lived (1 hour) viewing links for staff.
  const reviews = (data ?? []) as AdminReview[];
  const pendingPaths = reviews.filter((r) => r.photo_status === "pending" && r.photo_path).map((r) => r.photo_path as string);
  if (pendingPaths.length) {
    const { data: signed } = await admin.storage.from("review-photos-pending").createSignedUrls(pendingPaths, 3600);
    const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    for (const r of reviews) {
      if (r.photo_status === "pending" && r.photo_path) r.photo_preview = byPath.get(r.photo_path) ?? null;
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Star}
        title="Traveller reviews"
        description="Verified reviews go live automatically. Approve or hide the rest. You can hide any review at any time."
      />
      <ReviewModeration reviews={reviews} />
    </div>
  );
}

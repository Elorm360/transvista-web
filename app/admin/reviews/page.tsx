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
    .select("id, full_name, location, trip_name, rating, review, email, booking_reference, verified, status, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) console.error("[AdminReviewsPage]", error);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Star}
        title="Traveller reviews"
        description="Verified reviews go live automatically. Approve or hide the rest. You can hide any review at any time."
      />
      <ReviewModeration reviews={(data ?? []) as AdminReview[]} />
    </div>
  );
}

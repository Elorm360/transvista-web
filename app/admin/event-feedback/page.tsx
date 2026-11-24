import { MessageSquareText } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import FeedbackDashboard, { type EventOption } from "@/components/admin/FeedbackDashboard";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedbackRow } from "@/lib/dashboard/feedbackStats";

export const dynamic = "force-dynamic";

// Registrations that count as "attended / eligible to give feedback".
const PAID_STATUSES = ["deposit-paid", "paid", "in-progress", "completed"];

export default async function AdminEventFeedbackPage() {
  // Owners, admins and community managers only. Data is read on the server after this check.
  await requireAdminArea("community");
  const admin = createAdminClient();

  const [{ data: feedback, error }, { data: events }] = await Promise.all([
    admin
      .from("event_feedback")
      .select("id, event_slug, event_title, booking_reference, full_name, email, overall_rating, transport_rating, organisation_rating, itinerary_rating, guide_rating, value_rating, recommendation_score, favourite_part, improvement_suggestion, would_travel_again, next_destination_interest, created_at")
      .order("created_at", { ascending: false })
      .limit(2000),
    admin.from("travel_events").select("slug, title, start_date").order("start_date", { ascending: false }).limit(200),
  ]);
  if (error) console.error("[AdminEventFeedbackPage]", error);
  const rows = (feedback ?? []) as FeedbackRow[];

  // Every event that has feedback or exists in the event catalogue.
  const bySlug = new Map<string, EventOption>();
  for (const e of events ?? []) bySlug.set(e.slug, { slug: e.slug, title: e.title, date: e.start_date, eligible: null });
  for (const r of rows) if (!bySlug.has(r.event_slug)) bySlug.set(r.event_slug, { slug: r.event_slug, title: r.event_title, date: null, eligible: null });
  const options = [...bySlug.values()].filter((o) => rows.some((r) => r.event_slug === o.slug));

  // Paid registrations per event, for the response rate.
  await Promise.all(
    options.map(async (o) => {
      const { count } = await admin
        .from("package_reservations")
        .select("id", { count: "exact", head: true })
        .eq("package_slug", o.slug)
        .in("status", PAID_STATUSES)
        .is("archived_at", null);
      o.eligible = count ?? null;
    }),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={MessageSquareText}
        title="Feedback"
        description="Private feedback from verified, paid travellers. Use it to see what to improve and where to go next. Never published as testimonials."
      />
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Feedback could not be loaded. Refresh or contact the administrator.
        </p>
      ) : (
        <FeedbackDashboard rows={rows} events={options} />
      )}
    </div>
  );
}
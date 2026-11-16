import { MessageSquareText } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

function average(rows: Array<Record<string, unknown>>, key: string) {
  if (!rows.length) return "—";
  const values = rows.map((row) => Number(row[key])).filter(Number.isFinite);
  if (!values.length) return "—";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

export default async function AdminEventFeedbackPage() {
  await requireAdminArea("community");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("event_feedback")
    .select("id, event_title, booking_reference, full_name, email, overall_rating, transport_rating, organisation_rating, itinerary_rating, guide_rating, value_rating, recommendation_score, favourite_part, improvement_suggestion, would_travel_again, next_destination_interest, created_at")
    .eq("event_slug", "central-region-heritage-adventure-2026")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) console.error("[AdminEventFeedbackPage]", error);
  const rows = (data ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={MessageSquareText}
        title="Event feedback"
        description="Private feedback submitted by verified attendees. These responses are for internal service improvement and are not published as testimonials."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Responses", String(rows.length)],
          ["Overall rating", average(rows, "overall_rating") + (rows.length ? " / 5" : "")],
          ["Recommendation", average(rows, "recommendation_score") + (rows.length ? " / 10" : "")],
          ["Would travel again", String(rows.filter((row) => row.would_travel_again === "yes").length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Feedback could not be loaded. Refresh or contact the administrator.</p>}
      {!rows.length ? (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No feedback submissions have been received yet.
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {rows.map((row) => (
            <article key={String(row.id)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{String(row.full_name)}</h2>
                  <p className="mt-1 text-xs text-slate-500">{String(row.email)} · Ref {String(row.booking_reference)} · {dateFormat.format(new Date(String(row.created_at)))}</p>
                </div>
                <span className="rounded-full bg-brand-orange-50 px-3 py-1.5 text-sm font-semibold text-brand-orange-800">{String(row.overall_rating)} / 5 overall</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  ["Transport", row.transport_rating],
                  ["Organisation", row.organisation_rating],
                  ["Itinerary", row.itinerary_rating],
                  ["Guides", row.guide_rating],
                  ["Value", row.value_rating],
                  ["Recommend", row.recommendation_score],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">{String(label)}</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{String(value)}{label === "Recommend" ? " / 10" : " / 5"}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Favourite part</h3><p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{String(row.favourite_part || "Not provided")}</p></div>
                <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested improvements</h3><p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{String(row.improvement_suggestion || "Not provided")}</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <span>Travel again: <strong className="text-slate-900">{String(row.would_travel_again)}</strong></span>
                {row.next_destination_interest ? <span>Next experience: <strong className="text-slate-900">{String(row.next_destination_interest)}</strong></span> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

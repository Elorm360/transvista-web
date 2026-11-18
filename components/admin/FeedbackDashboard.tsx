"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Download, MapPin, Repeat, Search, Smile, Star, Target, Users } from "lucide-react";
import {
  categoryAverages,
  destinationDemand,
  needsAttention,
  nps,
  npsLabel,
  toCsv,
  travelAgain,
  weakestCategory,
  average,
  type FeedbackRow,
} from "@/lib/dashboard/feedbackStats";

export type EventOption = { slug: string; title: string; date: string | null; eligible: number | null };

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" });

function scoreColour(avg: number | null) {
  if (avg === null) return "bg-slate-300";
  if (avg >= 4.5) return "bg-emerald-500";
  if (avg >= 3.5) return "bg-[#1A3A9C]";
  if (avg >= 2.5) return "bg-amber-500";
  return "bg-red-500";
}

function Kpi({ icon: Icon, label, value, sub, tone = "blue" }: { icon: typeof Users; label: string; value: string; sub?: string; tone?: "blue" | "orange" | "green" }) {
  const toneClass = tone === "orange" ? "bg-orange-50 text-[#c85f16]" : tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-[#1A3A9C]";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}><Icon className="h-[18px] w-[18px]" /></span>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function FeedbackDashboard({ rows, events }: { rows: FeedbackRow[]; events: EventOption[] }) {
  const [eventSlug, setEventSlug] = useState<string>(events.length === 1 ? events[0].slug : "all");
  const [filter, setFilter] = useState<"all" | "attention" | "promoters">("all");
  const [query, setQuery] = useState("");

  const scoped = useMemo(() => (eventSlug === "all" ? rows : rows.filter((r) => r.event_slug === eventSlug)), [rows, eventSlug]);
  const eligible = eventSlug === "all"
    ? events.reduce((sum, e) => sum + (e.eligible ?? 0), 0)
    : events.find((e) => e.slug === eventSlug)?.eligible ?? 0;

  const stats = useMemo(() => ({
    overall: average(scoped, "overall_rating"),
    nps: nps(scoped),
    again: travelAgain(scoped),
    categories: categoryAverages(scoped),
    weakest: weakestCategory(scoped),
    demand: destinationDemand(scoped),
  }), [scoped]);

  const responseRate = eligible ? Math.round((scoped.length / eligible) * 100) : null;
  const attentionCount = scoped.filter(needsAttention).length;

  const visible = scoped
    .filter((r) => (filter === "attention" ? needsAttention(r) : filter === "promoters" ? r.recommendation_score >= 9 : true))
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [r.full_name, r.email, r.booking_reference, r.favourite_part, r.improvement_suggestion, r.next_destination_interest]
        .some((v) => String(v ?? "").toLowerCase().includes(q));
    });

  function exportCsv() {
    const blob = new Blob(["\ufeff" + toCsv(scoped)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transvista-feedback-${eventSlug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No feedback has been received yet. Share the feedback link with travellers after each trip.
      </div>
    );
  }

  const n = stats.nps;
  const pct = (x: number) => (n.total ? (x / n.total) * 100 : 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          Event
          <select
            value={eventSlug}
            onChange={(e) => setEventSlug(e.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900"
          >
            {events.length > 1 && <option value="all">All events</option>}
            {events.map((e) => <option key={e.slug} value={e.slug}>{e.title}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" /> Export to Excel (CSV)
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Users} label="Responses" value={String(scoped.length)}
          sub={responseRate !== null ? `${responseRate}% of ${eligible} paid travellers responded` : "Paid traveller count unavailable"} />
        <Kpi icon={Star} label="Overall rating" tone="orange" value={stats.overall !== null ? `${stats.overall} / 5` : "—"}
          sub="Average across all responses" />
        <Kpi icon={Smile} label="Net Promoter Score" tone="green" value={n.score !== null ? (n.score > 0 ? `+${n.score}` : String(n.score)) : "—"}
          sub={`${npsLabel(n.score)} · scale −100 to +100`} />
        <Kpi icon={Repeat} label="Would travel again" value={stats.again.yesPercent !== null ? `${stats.again.yesPercent}%` : "—"}
          sub={`${stats.again.yes} yes · ${stats.again.maybe} maybe · ${stats.again.no} no`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Category scores */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">How each part of the trip scored</h2>
          <p className="mt-1 text-xs text-slate-500">Average out of 5</p>
          <ul className="mt-5 space-y-4">
            {stats.categories.map((c) => (
              <li key={c.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.label}</span>
                  <span className="font-semibold text-slate-900">{c.average ?? "—"}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${scoreColour(c.average)}`} style={{ width: `${((c.average ?? 0) / 5) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {stats.weakest && (
            <div className="mt-6 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-[#c85f16]" />
              <p className="text-sm text-orange-900">
                <strong>Focus next:</strong> {stats.weakest.label} is the lowest-scoring area ({stats.weakest.average} / 5).
                Improving it will lift the overall experience the most.
              </p>
            </div>
          )}
        </section>

        {/* NPS breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Would they recommend TransVista?</h2>
          <p className="mt-1 text-xs text-slate-500">Based on the 0–10 &ldquo;recommend to a friend&rdquo; score</p>
          <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${pct(n.promoters)}%` }} />
            <div className="bg-slate-300" style={{ width: `${pct(n.passives)}%` }} />
            <div className="bg-red-400" style={{ width: `${pct(n.detractors)}%` }} />
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            {[
              ["bg-emerald-500", "Promoters (9–10)", n.promoters, "Likely to recommend you"],
              ["bg-slate-300", "Passives (7–8)", n.passives, "Satisfied but not enthusiastic"],
              ["bg-red-400", "Detractors (0–6)", n.detractors, "Unhappy: follow up personally"],
            ].map(([dot, label, count, hint]) => (
              <div key={String(label)} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                  <div><dt className="font-medium text-slate-800">{label}</dt><dd className="text-xs text-slate-500">{hint}</dd></div>
                </div>
                <span className="font-semibold text-slate-900">{String(count)}</span>
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            Net Promoter Score = % promoters − % detractors. Above +50 is excellent for travel and hospitality.
          </p>
        </section>
      </div>

      {/* Destination demand */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#c85f16]" />
          <h2 className="text-base font-bold text-slate-900">Where travellers want to go next</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">From the &ldquo;What destination would you like next?&rdquo; answers. Use this to plan upcoming trips.</p>
        {stats.demand.ranked.length === 0 && stats.demand.other.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No destination suggestions yet.</p>
        ) : (
          <>
            <ul className="mt-5 space-y-3">
              {stats.demand.ranked.map((d) => (
                <li key={d.name} className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[260px_1fr_auto]">
                  <span className="text-sm font-medium text-slate-700">{d.name}</span>
                  <div className="hidden h-2.5 overflow-hidden rounded-full bg-slate-100 sm:block">
                    <div className="h-full rounded-full bg-[#F47B20]" style={{ width: `${(d.count / stats.demand.ranked[0].count) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{d.count}</span>
                </li>
              ))}
            </ul>
            {stats.demand.other.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Other suggestions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stats.demand.other.map((o, i) => (
                    <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{o}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Individual responses */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {([
              ["all", `All (${scoped.length})`],
              ["attention", `Needs attention (${attentionCount})`],
              ["promoters", `Promoters (${n.promoters})`],
            ] as const).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === key ? "bg-[#111c36] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                {label}
              </button>
            ))}
          </div>
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or comment"
              className="h-10 w-64 rounded-full border border-slate-300 bg-white pl-9 pr-4 text-sm" />
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No responses match.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {visible.map((r) => (
              <li key={r.id} className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${needsAttention(r) ? "border-red-200" : "border-slate-200"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      {r.full_name}
                      {needsAttention(r) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                          <AlertTriangle className="h-3 w-3" /> Follow up
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{r.email} · Ref {r.booking_reference} · {dateFormat.format(new Date(r.created_at))}</p>
                    {eventSlug === "all" && <p className="text-xs text-slate-500">{r.event_title}</p>}
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-[#c85f16]">{r.overall_rating} / 5</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{r.recommendation_score} / 10</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Favourite part</h3><p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{r.favourite_part || "Not provided"}</p></div>
                  <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested improvements</h3><p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{r.improvement_suggestion || "Not provided"}</p></div>
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  Transport {r.transport_rating} · Organisation {r.organisation_rating} · Itinerary {r.itinerary_rating} · Guides {r.guide_rating} · Value {r.value_rating}
                  {" · "}Travel again: <strong className="text-slate-700">{r.would_travel_again}</strong>
                  {r.next_destination_interest ? <> · Next: <strong className="text-slate-700">{r.next_destination_interest}</strong></> : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
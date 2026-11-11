"use client";

import { useMemo, useState, useTransition } from "react";
import { BadgeCheck, Eye, EyeOff, Star } from "lucide-react";
import { moderateReview } from "@/app/actions/reviews";

export type AdminReview = {
  id: string;
  full_name: string;
  location: string | null;
  trip_name: string;
  rating: number;
  review: string;
  email: string | null;
  booking_reference: string | null;
  verified: boolean;
  status: "pending" | "approved" | "hidden";
  created_at: string;
};

const tabs = [
  { key: "pending", label: "Waiting for approval" },
  { key: "approved", label: "Live on website" },
  { key: "hidden", label: "Hidden" },
] as const;

const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" });

export default function ReviewModeration({ reviews }: { reviews: AdminReview[] }) {
  const [items, setItems] = useState(reviews);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("pending");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const counts = useMemo(
    () => Object.fromEntries(tabs.map((t) => [t.key, items.filter((r) => r.status === t.key).length])),
    [items],
  );
  const visible = items.filter((r) => r.status === tab);

  function change(id: string, status: AdminReview["status"]) {
    setMessage("");
    startTransition(async () => {
      const result = await moderateReview(id, status);
      if (result.success) {
        setItems((all) => all.map((r) => (r.id === id ? { ...r, status } : r)));
        setMessage(status === "approved" ? "Review is now live." : status === "hidden" ? "Review hidden from the website." : "Review moved back to the queue.");
      } else {
        setMessage(result.message || "Something went wrong.");
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.key ? "bg-[#111c36] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {t.label} <span className="ml-1 opacity-70">({counts[t.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No reviews here yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((r) => (
            <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                    {r.full_name}
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[r.location, r.trip_name, when.format(new Date(r.created_at))].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {r.email ? `Private: ${r.email}` : "No email given"}
                    {r.booking_reference ? ` · Ref ${r.booking_reference}` : ""}
                  </p>
                </div>
                <div className="flex gap-0.5" aria-label={`Rated ${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-[#f47b20] text-[#f47b20]" : "text-slate-300"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-700">{r.review}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <button type="button" disabled={pending} onClick={() => change(r.id, "approved")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f47b20] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9661a] disabled:opacity-50">
                    <Eye className="h-4 w-4" /> Approve & publish
                  </button>
                )}
                {r.status !== "hidden" && (
                  <button type="button" disabled={pending} onClick={() => change(r.id, "hidden")}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <EyeOff className="h-4 w-4" /> Hide
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

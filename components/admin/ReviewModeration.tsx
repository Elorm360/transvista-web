"use client";

import { useMemo, useState, useTransition } from "react";
import { BadgeCheck, Check, Eye, EyeOff, ImageOff, Star } from "lucide-react";
import { moderatePhoto, moderateReview } from "@/app/actions/reviews";
import { AdinkraAvatar, isAdinkraId } from "@/components/reviews/AdinkraAvatars";

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
  avatar_choice: string | null;
  photo_status: "none" | "pending" | "approved" | "removed";
  photo_path: string | null;
  photo_url: string | null;
  /** Short-lived link for staff to view a pending photo. */
  photo_preview?: string | null;
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

  function photo(id: string, action: "approve" | "remove") {
    setMessage("");
    startTransition(async () => {
      const result = await moderatePhoto(id, action);
      if (result.success) {
        setItems((all) => all.map((r) => (r.id === id
          ? { ...r, photo_status: action === "approve" ? "approved" : "removed", photo_url: action === "approve" ? (r.photo_preview ?? r.photo_url) : null, photo_path: action === "approve" ? r.photo_path : null }
          : r)));
        setMessage(action === "approve" ? "Photo approved. It now shows with the review." : "Photo removed and deleted.");
      } else {
        setMessage(result.message || "Something went wrong.");
      }
    });
  }

  const pendingPhotos = items.filter((r) => r.photo_status === "pending").length;

  return (
    <div>
      {pendingPhotos > 0 && (
        <p className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          {pendingPhotos} photo{pendingPhotos > 1 ? "s are" : " is"} waiting for your approval.
        </p>
      )}
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
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-orange-200">
                    {r.photo_status === "approved" && r.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- staff view of an approved photo
                      <img src={r.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : isAdinkraId(r.avatar_choice) ? (
                      <AdinkraAvatar id={r.avatar_choice} size={48} />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500">
                        {r.full_name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
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
                </div>
                <div className="flex gap-0.5" aria-label={`Rated ${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-[#f47b20] text-[#f47b20]" : "text-slate-300"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-700">{r.review}</p>
              {r.photo_status === "pending" && (
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-orange-200 bg-orange-50/60 p-3">
                  {r.photo_preview ? (
                    // eslint-disable-next-line @next/next/no-img-element -- private, short-lived staff preview
                    <img src={r.photo_preview} alt={`Photo uploaded by ${r.full_name}`} className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <span className="text-sm text-slate-500">Photo preview unavailable</span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Photo waiting for approval</p>
                    <p className="text-xs text-slate-500">Approve only if it is a clear, appropriate photo of a person.</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" disabled={pending} onClick={() => photo(r.id, "approve")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                        <Check className="h-3.5 w-3.5" /> Approve photo
                      </button>
                      <button type="button" disabled={pending} onClick={() => photo(r.id, "remove")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        <ImageOff className="h-3.5 w-3.5" /> Remove photo
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {r.photo_status === "approved" && (
                <button type="button" disabled={pending} onClick={() => photo(r.id, "remove")}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50">
                  <ImageOff className="h-3.5 w-3.5" /> Remove published photo
                </button>
              )}
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

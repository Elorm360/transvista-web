"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200";
const labelClass = "block text-sm font-semibold text-slate-800";

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { published: boolean }>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitReview({
        fullName: String(form.get("fullName") || ""),
        location: String(form.get("location") || ""),
        tripName: String(form.get("tripName") || ""),
        rating,
        review: String(form.get("review") || ""),
        email: String(form.get("email") || ""),
        bookingReference: String(form.get("bookingReference") || ""),
        consent: form.get("consent") === "on",
        website: String(form.get("website") || ""),
      });
      if (result.success) setDone({ published: Boolean(result.published) });
      else setError(result.message || "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="font-display mt-4 text-2xl font-semibold text-slate-900">Thank you for sharing!</h3>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          {done.published
            ? "Your trip was verified and your review is now live on our website. Medaase!"
            : "Your review has been received. Our team will check it shortly before it appears on the website."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot for bots — hidden from people */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset>
        <legend className={labelClass}>Your rating *</legend>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
            >
              <Star
                aria-hidden="true"
                className={`h-8 w-8 transition ${n <= (hover || rating) ? "fill-brand-orange-500 text-brand-orange-500" : "text-slate-300"}`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Your name *
          <input name="fullName" required maxLength={80} autoComplete="name" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Where are you from?
          <input name="location" maxLength={80} placeholder="e.g. Accra, Ghana" className={fieldClass} />
        </label>
      </div>

      <label className={labelClass}>
        Which trip did you join? *
        <input name="tripName" maxLength={120} placeholder="e.g. Central Region Day Trip" className={fieldClass} />
      </label>

      <label className={labelClass}>
        Your review *
        <textarea
          name="review"
          required
          minLength={20}
          maxLength={1200}
          rows={5}
          placeholder="What did you enjoy most? What stood out about travelling with TransVista?"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200"
        />
      </label>

      <div className="rounded-2xl border border-brand-blue-100 bg-brand-blue-50/60 p-5">
        <p className="text-sm font-semibold text-slate-900">Get a ✓ Verified traveller badge (optional)</p>
        <p className="mt-1 text-sm text-slate-600">
          Add your booking reference and the email you booked with. Verified reviews appear on the website straight away.
          Your email and reference are never shown publicly.
        </p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Booking reference
            <input name="bookingReference" maxLength={40} placeholder="e.g. TVP-2026-XXXXXXXX" className={`${fieldClass} uppercase placeholder:normal-case`} />
          </label>
          <label className={labelClass}>
            Email you booked with
            <input name="email" type="email" maxLength={254} autoComplete="email" className={fieldClass} />
          </label>
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#F47B20]" />
        <span>I agree that TransVista Africa may show my name, rating and review on its website.</span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-8 text-base font-semibold text-white shadow-lg transition hover:bg-brand-orange-700 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Share my review"}
      </button>
    </form>
  );
}

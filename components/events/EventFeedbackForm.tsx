"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { submitEventFeedback } from "@/app/actions/event-feedback";

const ratingFields = [
  ["overallRating", "Overall experience"],
  ["transportRating", "Transport and comfort"],
  ["organisationRating", "Organisation and communication"],
  ["itineraryRating", "Itinerary and destinations"],
  ["guideRating", "Guides and hospitality"],
  ["valueRating", "Value for money"],
] as const;

const fieldClass = "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200";
const labelClass = "block text-sm font-semibold text-slate-800";

export function EventFeedbackForm() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(formData: FormData) {
    setError("");
    for (const [name] of ratingFields) {
      if (!ratings[name]) {
        setError("Please rate each part of the experience.");
        return;
      }
      formData.set(name, String(ratings[name]));
    }
    startTransition(async () => {
      const result = await submitEventFeedback(formData);
      if (result.success) setDone(true);
      else setError(result.message || "We could not submit your feedback. Please try again.");
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h2 className="font-display mt-4 text-2xl font-semibold text-slate-900">Thank you for your feedback.</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-600">Your response has been received privately. Our team will use it to improve future TransVista experiences.</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-7">
      <div className="hidden" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold text-slate-900">Find your registration</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Enter the email address or phone number you used when registering. We will securely match it to your booking—no booking reference needed.</p>
        <div className="mt-5">
          <label className={labelClass}>Registration email or phone number *
            <input name="contact" required maxLength={254} autoComplete="email tel" className={fieldClass} placeholder="Email address or phone number" />
          </label>
          <p className="mt-2 text-xs leading-5 text-slate-500">Use the same contact detail you provided on your registration form. Your contact details are kept private.</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-slate-900">Rate your experience</h2>
        <p className="mt-2 text-sm text-slate-600">1 = Needs improvement · 5 = Excellent</p>
        <div className="mt-5 space-y-5">
          {ratingFields.map(([name, label]) => (
            <fieldset key={name}>
              <legend className="text-sm font-semibold text-slate-800">{label} *</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className={`flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-xl border px-3 text-sm font-semibold transition ${ratings[name] === value ? "border-brand-orange-600 bg-brand-orange-50 text-brand-orange-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                    <input className="sr-only" type="radio" name={name} value={value} checked={ratings[name] === value} onChange={() => setRatings((current) => ({ ...current, [name]: value }))} />
                    {value}
                    {value === 5 && <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section>
        <label className={labelClass}>How likely are you to recommend TransVista to a friend? *
          <select name="recommendationScore" required defaultValue="" className={fieldClass}>
            <option value="" disabled>Choose a score from 0 to 10</option>
            {Array.from({ length: 11 }, (_, value) => <option key={value} value={value}>{value} {value === 0 ? "— Not at all likely" : value === 10 ? "— Extremely likely" : ""}</option>)}
          </select>
        </label>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>Would you travel with TransVista again? *
            <select name="wouldTravelAgain" required defaultValue="" className={fieldClass}>
              <option value="" disabled>Choose one</option>
              <option value="yes">Yes</option>
              <option value="maybe">Maybe</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className={labelClass}>What destination or experience would you like us to consider next?
            <input name="nextDestinationInterest" maxLength={240} className={fieldClass} placeholder="Optional" />
          </label>
        </div>
        <div className="mt-5 grid gap-5">
          <label className={labelClass}>What was your favourite part of the trip?
            <textarea name="favouritePart" maxLength={1200} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-4 text-base text-slate-900 outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200" />
          </label>
          <label className={labelClass}>What could we improve for future trips?
            <textarea name="improvementSuggestion" maxLength={1200} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-4 text-base text-slate-900 outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200" />
          </label>
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="border-t border-slate-200 pt-6">
        <p className="text-xs leading-6 text-slate-500">Your answers are private and used for service improvement. They will not be published as a testimonial. If you would like to share a public story separately, you can do so through Traveller Stories.</p>
        <button type="submit" disabled={pending} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-orange-600 px-7 text-sm font-semibold text-white transition hover:bg-brand-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          {pending ? "Submitting feedback…" : "Submit private feedback"}
        </button>
      </div>
    </form>
  );
}

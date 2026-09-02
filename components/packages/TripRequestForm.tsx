"use client";

import { useActionState } from "react";
import { CheckCircle2, Clock3, LoaderCircle } from "lucide-react";
import { submitTripRequest, initialTripRequestState } from "@/app/actions/trip-requests";
import { countries } from "@/constants/data/countries";
import { tripRequestContent } from "@/content/trip-request";
import { Button } from "@/components/ui/button";

const fieldClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100";

const budgets = [
  "$100–$149 per traveler",
  "$150–$249 per traveler",
  "$250+ per traveler",
  "I need guidance",
] as const;

type TripRequestFormProps = {
  packageSlug: string;
};

export function TripRequestForm({ packageSlug }: TripRequestFormProps) {
  const [state, action, pending] = useActionState(
    submitTripRequest,
    initialTripRequestState,
  );

  if (state.status === "success") {
    return (
      <div
        className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-7 sm:p-9"
        role="status"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
        <h3 className="font-display mt-5 text-2xl font-semibold text-slate-900">
          {tripRequestContent.successTitle}
        </h3>
        <p className="mt-3 text-base leading-7 text-slate-600">
          {tripRequestContent.successBody}
        </p>
        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          {tripRequestContent.responseTime}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="packageSlug" value={packageSlug} />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="trip-website">Website</label>
        <input id="trip-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={state.errors?.fullName}>
          <input
            id="trip-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            className={fieldClassName}
            disabled={pending}
            required
          />
        </Field>
        <Field label="Email address" error={state.errors?.email}>
          <input
            id="trip-email"
            name="email"
            type="email"
            autoComplete="email"
            className={fieldClassName}
            disabled={pending}
            required
          />
        </Field>
        <Field label="Phone or WhatsApp" error={state.errors?.phone}>
          <input
            id="trip-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+233 XX XXX XXXX"
            className={fieldClassName}
            disabled={pending}
            required
          />
        </Field>
        <Field label="Country of residence" error={state.errors?.country}>
          <select
            id="trip-country"
            name="country"
            className={fieldClassName}
            disabled={pending}
            defaultValue=""
            required
          >
            <option value="" disabled>Select country</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </Field>
        <Field label="Preferred start date" error={state.errors?.startDate}>
          <input
            id="trip-start-date"
            name="startDate"
            type="date"
            className={fieldClassName}
            disabled={pending}
            required
          />
        </Field>
        <Field label="Number of travelers" error={state.errors?.travelers}>
          <input
            id="trip-travelers"
            name="travelers"
            type="number"
            min="1"
            max="40"
            inputMode="numeric"
            defaultValue="2"
            className={fieldClassName}
            disabled={pending}
            required
          />
        </Field>
      </div>

      <Field label="Approximate budget" error={state.errors?.budget}>
        <select
          id="trip-budget"
          name="budget"
          className={fieldClassName}
          disabled={pending}
          defaultValue=""
          required
        >
          <option value="" disabled>Select budget per traveler</option>
          {budgets.map((budget) => (
            <option key={budget} value={budget}>{budget}</option>
          ))}
        </select>
      </Field>

      <div>
        <label htmlFor="trip-notes" className="text-sm font-semibold text-slate-800">
          What would make this trip right for you? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="trip-notes"
          name="notes"
          rows={4}
          maxLength={2000}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
          placeholder="Tell us about your preferred pace, room setup, dietary needs, or special occasion."
          disabled={pending}
        />
      </div>

      <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            Sending request…
          </>
        ) : (
          "Check availability"
        )}
      </Button>

      <p className="text-center text-xs leading-5 text-slate-500">
        No payment is taken now. We will confirm availability and pricing before you commit.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-800">
        {label} <span className="text-brand-orange-600" aria-hidden="true">*</span>
        {children}
      </label>
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}

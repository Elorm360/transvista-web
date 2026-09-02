"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitTripRequest } from "@/app/actions/travel";
import type { TripRequestInput } from "@/lib/travel/types";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200";
const areaClass =
  "mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200";
const destinations = [
  ["accra", "Accra"],
  ["cape-coast", "Cape Coast & Elmina"],
  ["volta-region", "Volta Region"],
  ["not-sure", "I need recommendations"],
] as const;
const services = [
  ["experiences-and-tours", "Experiences & tours"],
  ["transport-and-transfers", "Transport & transfers"],
  ["accommodation", "Accommodation"],
  ["complete-trip-planning", "Complete trip planning"],
] as const;
const interests = [
  ["culture-and-heritage", "Culture & heritage"],
  ["nature-and-adventure", "Nature & adventure"],
  ["food-and-nightlife", "Food & nightlife"],
  ["beaches-and-relaxation", "Beaches & relaxation"],
  ["photography-and-video", "Photography & video"],
  ["family-travel", "Family travel"],
] as const;

type TripRequestFormProps = {
  initialDestination?: string;
};

export function TripRequestForm({
  initialDestination = "",
}: TripRequestFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    reference?: string;
    emailSent?: boolean;
    message?: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    const form = new FormData(event.currentTarget);
    const input: TripRequestInput = {
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      country: String(form.get("country") || ""),
      destinations: form.getAll("destinations").map(String),
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
      dateFlexibility: String(form.get("dateFlexibility") || ""),
      adults: Number(form.get("adults") || 1),
      children: Number(form.get("children") || 0),
      serviceTypes: form.getAll("serviceTypes").map(String),
      interests: form.getAll("interests").map(String),
      budgetBasis: String(form.get("budgetBasis") || ""),
      budgetRange: String(form.get("budgetRange") || ""),
      budgetCurrency: String(form.get("budgetCurrency") || ""),
      accommodationStyle: String(form.get("accommodationStyle") || ""),
      transportDetails: String(form.get("transportDetails") || ""),
      notes: String(form.get("notes") || ""),
      acceptedPolicy: form.get("acceptedPolicy") === "on",
      website: String(form.get("website") || ""),
    };

    if (!input.destinations.length || !input.serviceTypes.length) {
      setResult({
        success: false,
        message: "Choose at least one destination and one planning service.",
      });
      return;
    }

    setSubmitting(true);
    try {
      setResult(await submitTripRequest(input));
    } catch {
      setResult({
        success: false,
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.success && result.reference) {
    return (
      <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="font-display mt-4 text-2xl font-semibold text-slate-900">
          Your request is with TransVista
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Reference <strong>{result.reference}</strong>. We will review your
          trip and respond within 48 hours.
        </p>
        {!result.emailSent && (
          <p className="mt-3 text-sm text-slate-500">
            Your request was saved, but the confirmation email may be delayed.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <FormSection number="1" title="Where and when">
        <fieldset>
          <legend className="text-base font-semibold text-slate-900">
            Where would you like to go?
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {destinations.map(([value, label]) => (
              <CheckboxCard
                key={value}
                name="destinations"
                value={value}
                label={label}
                defaultChecked={initialDestination === value}
              />
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preferred start date">
            <input name="startDate" type="date" className={fieldClass} />
          </Field>
          <Field label="Preferred end date">
            <input name="endDate" type="date" className={fieldClass} />
          </Field>
        </div>
        <Field label="If your dates are flexible">
          <input
            name="dateFlexibility"
            className={fieldClass}
            placeholder="For example: any weekend in December"
          />
        </Field>
      </FormSection>

      <FormSection number="2" title="Who is travelling">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Adults">
            <input
              name="adults"
              type="number"
              min="1"
              max="50"
              defaultValue="1"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Children">
            <input
              name="children"
              type="number"
              min="0"
              max="50"
              defaultValue="0"
              className={fieldClass}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection number="3" title="What should we plan?">
        <fieldset>
          <legend className="text-base font-semibold text-slate-900">
            Choose the support you need
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {services.map(([value, label]) => (
              <CheckboxCard
                key={value}
                name="serviceTypes"
                value={value}
                label={label}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-base font-semibold text-slate-900">
            What are you interested in?
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {interests.map(([value, label]) => (
              <CheckboxCard
                key={value}
                name="interests"
                value={value}
                label={label}
              />
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Accommodation style">
            <select name="accommodationStyle" className={fieldClass}>
              <option value="">No preference / not needed</option>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </Field>
          <Field label="Transport needs">
            <input
              name="transportDetails"
              className={fieldClass}
              placeholder="Airport pickup, intercity travel…"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection number="4" title="Your comfortable budget">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Currency">
            <select name="budgetCurrency" required className={fieldClass}>
              <option value="GHS">GH₵</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </Field>
          <Field label="Budget applies to">
            <select name="budgetBasis" required className={fieldClass}>
              <option value="total-trip">The total trip</option>
              <option value="per-person">Each traveller</option>
            </select>
          </Field>
          <Field label="Budget range">
            <select name="budgetRange" required className={fieldClass}>
              <option value="">Select a range</option>
              <option value="under-1000">Under 1,000</option>
              <option value="1000-2500">1,000–2,500</option>
              <option value="2500-5000">2,500–5,000</option>
              <option value="5000-10000">5,000–10,000</option>
              <option value="over-10000">Over 10,000</option>
              <option value="need-guidance">I need guidance</option>
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection number="5" title="How should we reach you?">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input
              name="fullName"
              autoComplete="name"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Email address">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="WhatsApp or phone number">
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Country of residence">
            <input
              name="country"
              autoComplete="country-name"
              required
              className={fieldClass}
            />
          </Field>
        </div>
        <Field label="Anything else we should know?">
          <textarea
            name="notes"
            className={areaClass}
            placeholder="Celebrations, accessibility needs, dietary needs, must-see places…"
          />
        </Field>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <input
            name="acceptedPolicy"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-brand-orange-600"
          />
          <span>
            I have read and accept the{" "}
            <Link
              href="/policies/payment-booking-refunds"
              target="_blank"
              className="font-semibold text-brand-blue-800 underline"
            >
              Payment, Booking & Refund Policy
            </Link>
            . I understand that this is a request, not a confirmed booking.
          </span>
        </label>
      </FormSection>

      {result && !result.success && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {result.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full rounded-full sm:w-auto"
      >
        {submitting ? "Sending request…" : "Send my trip request"}
      </Button>
    </form>
  );
}

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-800 text-sm font-bold text-white">
          {number}
        </span>
        <h2 className="font-display text-xl font-semibold text-slate-900">
          {title}
        </h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      {children}
    </label>
  );
}

function CheckboxCard({
  name,
  value,
  label,
  defaultChecked = false,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-orange-300">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-brand-orange-600"
      />
      {label}
    </label>
  );
}

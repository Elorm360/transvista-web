"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubmissionSuccess } from "@/components/forms/SubmissionSuccess";
import { submitTripRequest } from "@/app/actions/travel";
import { track } from "@/lib/analytics";
import type { TripRequestInput } from "@/lib/travel/types";
import {
  getGhanaTourismRegion,
  ghanaTourismRegions,
  regionSlugForInitialDestination,
} from "@/constants/data/ghana-tourism-regions";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-200";
const areaClass =
  "mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-200";
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
  const initialRegionSlug = regionSlugForInitialDestination(initialDestination);
  const [selectedRegionSlug, setSelectedRegionSlug] =
    useState(initialRegionSlug);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const today = todayIso();
  const currencyRef = useRef<HTMLSelectElement>(null);

  // Suggest the visitor's likely currency; they can still change it.
  useEffect(() => {
    if (currencyRef.current) {
      currencyRef.current.value = guessCurrency(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
    }
  }, []);
  const selectedRegion = getGhanaTourismRegion(selectedRegionSlug);
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
      destinations: form
        .getAll("destinations")
        .map(String)
        .map((destination) => destination.trim())
        .filter(Boolean),
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

    const nextErrors = validate(input, today);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      setResult({
        success: false,
        message: "Please check the highlighted fields and try again.",
      });
      document
        .getElementById(`field-${firstInvalid}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitTripRequest(input);
      if (response.success) {
        track("plan_submit", {
          services: input.serviceTypes.join(","),
          currency: input.budgetCurrency,
        });
      }
      setResult(response);
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
      <SubmissionSuccess
        title="Your request is with TransVista"
        reference={result.reference}
        intro="This is a request, not a booking. Nothing is charged until you approve a proposal."
        emailSent={result.emailSent}
        steps={[
          "Request received. Check your email for a copy.",
          "We check routes, stays, experiences and trusted providers for your trip.",
          "Within 48 hours you receive a proposal with availability and a clear price.",
          "Approve the proposal and pay the agreed deposit to confirm.",
        ]}
      />
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
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose a region to explore its tourist destinations.
          </p>
          <label
            id="field-destinations"
            className="mt-4 block text-sm font-semibold text-slate-800"
          >
            Region <span className="text-red-700" aria-hidden="true">*</span>
            <select
              aria-invalid={Boolean(errors.destinations)}
              aria-describedby="error-destinations"
              value={selectedRegionSlug}
              onChange={(event) => setSelectedRegionSlug(event.target.value)}
              className={fieldClass}
            >
              <option value="">Select a region</option>
              {ghanaTourismRegions.map((region) => (
                <option key={region.slug} value={region.slug}>
                  {region.name}
                </option>
              ))}
              <option value="not-sure">I need help choosing a region</option>
            </select>
          </label>

          {selectedRegion ? (
            <div className="mt-6" key={selectedRegion.slug}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    Places to explore in {selectedRegion.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Choose one or more. TransVista will confirm access,
                    availability, and the final itinerary after reviewing your
                    request.
                  </p>
                </div>
                <span className="mt-2 w-fit rounded-full bg-brand-blue-50 px-3 py-1 text-xs font-semibold text-brand-blue-800 sm:mt-0">
                  {selectedRegion.destinations.length} suggestions
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {selectedRegion.destinations.map((destination) => (
                  <CheckboxCard
                    key={destination}
                    name="destinations"
                    value={`${selectedRegion.name} — ${destination}`}
                    label={destination}
                  />
                ))}
                <CheckboxCard
                  name="destinations"
                  value={`${selectedRegion.name} — I need recommendations`}
                  label="I need recommendations in this region"
                  defaultChecked={
                    Boolean(initialDestination) &&
                    selectedRegion.slug === initialRegionSlug
                  }
                />
              </div>

              <label className="mt-5 block text-sm font-semibold text-slate-800">
                Another place or town in {selectedRegion.name} (optional)
                <input
                  name="destinations"
                  className={fieldClass}
                  placeholder="Enter a place that is not listed"
                />
              </label>
            </div>
          ) : selectedRegionSlug === "not-sure" ? (
            <div className="mt-5 rounded-2xl border border-brand-blue-200 bg-brand-blue-50 p-4 text-sm leading-6 text-slate-700">
              Tell us your interests later in the form and TransVista will
              recommend suitable regions and destinations.
              <input
                type="hidden"
                name="destinations"
                value="I need recommendations across Ghana"
              />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              Select a region to see destination suggestions.
            </div>
          )}
          <FieldError id="destinations" message={errors.destinations} />
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preferred start date" name="startDate" error={errors.startDate}>
            <input
              name="startDate"
              type="date"
              min={today}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Preferred end date" name="endDate" error={errors.endDate}>
            <input
              name="endDate"
              type="date"
              min={startDate || today}
              className={fieldClass}
            />
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
        <fieldset id="field-serviceTypes" aria-describedby="error-serviceTypes">
          <legend className="text-base font-semibold text-slate-900">
            Choose the support you need{" "}
            <span className="text-red-700" aria-hidden="true">*</span>
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
          <FieldError id="serviceTypes" message={errors.serviceTypes} />
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
            <select
              name="budgetCurrency"
              required
              ref={currencyRef}
              defaultValue="GHS"
              className={fieldClass}
            >
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
          <Field label="Budget range" name="budgetRange" error={errors.budgetRange} required>
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
          <Field label="Full name" name="fullName" error={errors.fullName} required>
            <input
              name="fullName"
              autoComplete="name"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Email address" name="email" error={errors.email} required>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="WhatsApp or phone number" name="phone" error={errors.phone} required>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Country of residence" name="country" error={errors.country} required>
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
        <label
          id="field-acceptedPolicy"
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
        >
          <input
            aria-invalid={Boolean(errors.acceptedPolicy)}
            aria-describedby="error-acceptedPolicy"
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
            See how we handle your data in our{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold text-brand-blue-800 underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="acceptedPolicy" message={errors.acceptedPolicy} />
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

type FieldName =
  | "destinations"
  | "startDate"
  | "endDate"
  | "serviceTypes"
  | "budgetRange"
  | "fullName"
  | "email"
  | "phone"
  | "country"
  | "acceptedPolicy";
type FieldErrors = Partial<Record<FieldName, string>>;

const euroZones = /^Europe\/(Berlin|Paris|Amsterdam|Brussels|Madrid|Rome|Vienna|Dublin|Lisbon|Helsinki|Athens|Luxembourg)/;

function guessCurrency(timeZone: string) {
  if (timeZone === "Europe/London") return "GBP";
  if (euroZones.test(timeZone)) return "EUR";
  if (timeZone.startsWith("America/")) return "USD";
  return "GHS";
}

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function validate(input: TripRequestInput, today: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.destinations.length)
    errors.destinations = "Choose a region, or “I need help choosing a region”.";
  if (input.startDate && input.startDate < today)
    errors.startDate = "Start date can’t be in the past.";
  if (input.startDate && input.endDate && input.endDate < input.startDate)
    errors.endDate = "End date must be on or after the start date.";
  if (!input.serviceTypes.length)
    errors.serviceTypes = "Choose at least one type of support.";
  if (!input.budgetRange) errors.budgetRange = "Select a budget range.";
  if (!input.fullName.trim()) errors.fullName = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (input.phone.replace(/\D/g, "").length < 9)
    errors.phone = "Please enter a phone or WhatsApp number we can reach.";
  if (!input.country.trim()) errors.country = "Please enter your country.";
  if (!input.acceptedPolicy)
    errors.acceptedPolicy = "Please accept the policy to send your request.";
  return errors;
}

function FieldError({ id, message }: { id: FieldName; message?: string }) {
  return (
    <p
      id={`error-${id}`}
      className={message ? "mt-2 text-sm font-medium text-red-700" : "sr-only"}
      aria-live="polite"
    >
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  error,
  required = false,
  children,
}: {
  label: string;
  name?: FieldName;
  error?: string;
  required?: boolean;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  const control = name
    ? cloneElement(children, {
        "aria-invalid": Boolean(error),
        "aria-describedby": `error-${name}`,
      })
    : children;

  return (
    <div id={name ? `field-${name}` : undefined}>
      <label className="block text-sm font-semibold text-slate-800">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {" "}*
          </span>
        )}
        {control}
      </label>
      {name && <FieldError id={name} message={error} />}
    </div>
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

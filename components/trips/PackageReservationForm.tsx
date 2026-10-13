"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitPackageReservation } from "@/app/actions/travel";
import type { PackageReservationInput } from "@/lib/travel/types";
import type { CentralRegionPackage } from "@/lib/travel/packages";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200";
const areaClass =
  "mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200";

export function PackageReservationForm({
  trip,
}: {
  trip: CentralRegionPackage;
}) {
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
    const input: PackageReservationInput = {
      packageSlug: trip.slug,
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      city: String(form.get("city") || ""),
      participants: Number(form.get("participants") || 1),
      emergencyContactName: String(form.get("emergencyContactName") || ""),
      emergencyContactPhone: String(form.get("emergencyContactPhone") || ""),
      dietaryNeeds: String(form.get("dietaryNeeds") || ""),
      notes: String(form.get("notes") || ""),
      mediaNoticeAcknowledged: form.get("mediaNoticeAcknowledged") === "on",
      promotionalMediaConsent: form.get("promotionalMediaConsent") === "on",
      acceptedPolicy: form.get("acceptedPolicy") === "on",
      website: String(form.get("website") || ""),
    };

    setSubmitting(true);
    try {
      setResult(await submitPackageReservation(input));
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
          Registration received
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Reference <strong>{result.reference}</strong>. Your place is not
          confirmed yet. TransVista will review the registration and send
          official deposit instructions after confirmation.
        </p>
        {!result.emailSent && (
          <p className="mt-3 text-sm text-slate-500">
            Your registration was saved, but the confirmation email may be delayed.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      id="register"
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8"
      noValidate
    >
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <h2 className="font-display text-2xl font-semibold text-slate-900">
        Register your interest
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        No payment is due now. After TransVista confirms your place, you will
        receive official instructions for the {trip.currencySymbol}
        {trip.depositPerPerson} deposit per traveller.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Full name">
          <input name="fullName" required autoComplete="name" className={fieldClass} />
        </Field>
        <Field label="Email address">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </Field>
        <Field label="WhatsApp or phone number">
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={fieldClass}
          />
        </Field>
        <Field label="City of residence">
          <input name="city" required autoComplete="address-level2" className={fieldClass} />
        </Field>
        <Field label="Number of travellers">
          <input
            name="participants"
            type="number"
            min="1"
            max="20"
            defaultValue="1"
            required
            className={fieldClass}
          />
        </Field>
      </div>

      <h3 className="mt-8 text-base font-semibold text-slate-900">
        Emergency contact
      </h3>
      <div className="mt-2 grid gap-5 sm:grid-cols-2">
        <Field label="Contact name">
          <input name="emergencyContactName" required className={fieldClass} />
        </Field>
        <Field label="Contact phone">
          <input name="emergencyContactPhone" type="tel" required className={fieldClass} />
        </Field>
      </div>

      <div className="mt-7 space-y-5">
        <Field label="Dietary needs">
          <textarea
            name="dietaryNeeds"
            className={areaClass}
            placeholder="Allergies, vegetarian meals, or other requirements"
          />
        </Field>
        <Field label="Additional notes">
          <textarea
            name="notes"
            className={areaClass}
            placeholder="Accessibility needs or anything the team should know"
          />
        </Field>
      </div>

      <div className="mt-7 space-y-3">
        <CheckField name="mediaNoticeAcknowledged" required>
          I understand that a guided photo-shoot and video experience is part
          of the trip and that photography may take place in shared group areas.
        </CheckField>
        <CheckField name="promotionalMediaConsent">
          I give TransVista permission to use identifiable photos or videos of
          me for promotional content. This is optional and does not affect my registration.
        </CheckField>
        <CheckField name="acceptedPolicy" required>
          I have read and accept the{" "}
          <Link
            href="/policies/payment-booking-refunds"
            target="_blank"
            className="font-semibold text-brand-blue-800 underline"
          >
            Payment, Booking & Refund Policy
          </Link>
          . I understand that this registration is not confirmed until payment
          requirements are completed. See our{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-semibold text-brand-blue-800 underline"
          >
            Privacy Policy
          </Link>
          .
        </CheckField>
      </div>

      {result && !result.success && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {result.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="mt-7 w-full rounded-full"
      >
        {submitting ? "Sending registration…" : "Reserve my spot (no payment now)"}
      </Button>
    </form>
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

function CheckField({
  name,
  required = false,
  children,
}: {
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
      <input
        name={name}
        type="checkbox"
        required={required}
        className="mt-1 h-4 w-4 accent-brand-orange-600"
      />
      <span>{children}</span>
    </label>
  );
}

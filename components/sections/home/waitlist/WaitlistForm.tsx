"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { countries } from "@/constants/data/countries";
import { partnerInterests } from "@/constants/data/interests";
import { waitlistContent } from "@/content/waitlist";
import { joinWaitlist } from "@/app/actions/waitlist";
import { WaitlistThankYou } from "./WaitlistThankYou";
import { cn } from "@/lib/utils";

type WaitlistFormProps = {
  variant?: "full" | "compact";
};

const fieldClassName =
  "h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-slate-300 focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue-600 disabled:cursor-not-allowed disabled:opacity-50";

export function WaitlistForm({ variant = "full" }: WaitlistFormProps) {
  const idPrefix = variant === "compact" ? "hero" : "waitlist";
  const compact = variant === "compact";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: compact ? "Ghana" : "",
    interest: "",
  });
  const [intent, setIntent] = useState<"traveler" | "partner" | "">("");

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    country: "",
    interest: "",
    intent: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [joinedInterest, setJoinedInterest] = useState("");
  const [emailSent, setEmailSent] = useState(true);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const resolvedInterest =
    intent === "traveler" ? "Traveler" : form.interest.trim();

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      country: "",
      interest: "",
      intent: "",
    };

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.country) {
      newErrors.country = "Please select your country.";
    }

    if (!intent) {
      newErrors.intent = "Please choose traveler or partner.";
    } else if (intent === "partner" && !form.interest) {
      newErrors.interest = "Please tell us what kind of partner you are.";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    setIsDuplicate(false);

    try {
      const result = await joinWaitlist({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        interest: resolvedInterest,
      });

      setJoinedInterest(resolvedInterest);

      if (result.duplicate) {
        setIsDuplicate(true);
        setSubmitSuccess(false);
        setSubmitError("");
        return;
      }

      setSubmitSuccess(true);
      setIsDuplicate(false);
      setSubmitError("");
      setEmailSent(result.emailSent);
    } catch (error) {
      console.error("[WaitlistForm] Submission error:", error);
      setSubmitError(waitlistContent.error.unknown);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <WaitlistThankYou
        variant="success"
        interest={joinedInterest}
        emailSent={emailSent}
      />
    );
  }

  if (isDuplicate) {
    return (
      <WaitlistThankYou variant="duplicate" interest={joinedInterest} />
    );
  }

  return (
    <>
      {submitError && (
        <div
          aria-live="polite"
          className="mb-5 w-full rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <form
        id={`${idPrefix}-form`}
        className={cn(
          "w-full space-y-4",
          !compact && "mx-auto max-w-md space-y-5",
        )}
        onSubmit={handleSubmit}
        noValidate
        autoComplete="on"
      >
        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-slate-200">
            {waitlistContent.form.intentLabel}
            <span className="ml-0.5 text-brand-orange-300" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(["traveler", "partner"] as const).map((value) => {
              const selected = intent === value;
              const label =
                value === "traveler"
                  ? waitlistContent.form.travelerIntent
                  : waitlistContent.form.partnerIntent;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setIntent(value);
                    setForm((prev) => ({
                      ...prev,
                      interest: value === "traveler" ? "Traveler" : "",
                    }));
                    setErrors((prev) => ({ ...prev, intent: "", interest: "" }));
                  }}
                  disabled={isSubmitting}
                  aria-pressed={selected}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    selected
                      ? "border-brand-orange-400 bg-brand-orange-500 text-white"
                      : "border-white/20 bg-white/10 text-slate-100 hover:border-white/40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.intent && (
            <p className="mt-1 text-sm text-red-300">{errors.intent}</p>
          )}
        </fieldset>

        {intent === "partner" && (
          <div className="text-left">
            <label
              htmlFor={`${idPrefix}-interest`}
              className="mb-1.5 block text-sm font-medium text-slate-200"
            >
              {waitlistContent.form.partnerInterestLabel}
              <span className="ml-0.5 text-brand-orange-300" aria-hidden="true">
                *
              </span>
            </label>
            <select
              id={`${idPrefix}-interest`}
              name="interest"
              value={form.interest}
              onChange={handleChange}
              disabled={isSubmitting}
              className={fieldClassName}
            >
              <option value="" disabled className="text-slate-400">
                {waitlistContent.form.interestPlaceholder}
              </option>
              {partnerInterests.map((interest) => (
                <option key={interest} value={interest} className="text-slate-900">
                  {interest}
                </option>
              ))}
            </select>
            {errors.interest && (
              <p className="mt-1 text-sm text-red-300">{errors.interest}</p>
            )}
          </div>
        )}

        <div className="text-left">
          <label
            htmlFor={`${idPrefix}-fullName`}
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.fullNameLabel}
            <span className="ml-0.5 text-brand-orange-300" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id={`${idPrefix}-fullName`}
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder={waitlistContent.form.fullNamePlaceholder}
            value={form.fullName}
            onChange={handleChange}
            disabled={isSubmitting}
            className={fieldClassName}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-300">{errors.fullName}</p>
          )}
        </div>

        <div className="text-left">
          <label
            htmlFor={`${idPrefix}-email`}
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.emailLabel}
            <span className="ml-0.5 text-brand-orange-300" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            placeholder={waitlistContent.form.emailPlaceholder}
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className={fieldClassName}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-300">{errors.email}</p>
          )}
        </div>

        {!compact && (
          <div className="text-left">
            <label
              htmlFor={`${idPrefix}-phone`}
              className="mb-1.5 block text-sm font-medium text-slate-200"
            >
              {waitlistContent.form.phoneLabel}
            </label>
            <input
              id={`${idPrefix}-phone`}
              name="phone"
              type="tel"
              placeholder={waitlistContent.form.phonePlaceholder}
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              className={fieldClassName}
            />
          </div>
        )}

        <div className="text-left">
          <label
            htmlFor={`${idPrefix}-country`}
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.countryLabel}
            <span className="ml-0.5 text-brand-orange-300" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id={`${idPrefix}-country`}
            name="country"
            value={form.country}
            onChange={handleChange}
            disabled={isSubmitting}
            className={fieldClassName}
          >
            <option value="" disabled className="text-slate-400">
              {waitlistContent.form.countryPlaceholder}
            </option>
            {countries.map((country) => (
              <option key={country} value={country} className="text-slate-900">
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-300">{errors.country}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-accent text-base hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? waitlistContent.form.submittingLabel
            : compact
              ? waitlistContent.form.compactSubmitLabel
              : waitlistContent.form.submitLabel}
        </Button>

        <p className="text-center text-xs leading-5 text-slate-400">
          {waitlistContent.form.privacyNote}{" "}
          <a href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </a>
        </p>
      </form>
    </>
  );
}

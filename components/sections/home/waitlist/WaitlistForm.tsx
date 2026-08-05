"use client";

import { useState } from "react";
import { CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { countries } from "@/constants/data/countries";
import { interests } from "@/constants/data/interests";
import { waitlistContent } from "@/content/waitlist";
import { joinWaitlist } from "@/app/actions/waitlist";

/**
 * WaitlistForm
 *
 * Collects full name, email, phone, country, and interest.
 * Validates client-side, then submits via Server Action to Supabase.
 * Displays a friendly duplicate notice when the email is already on
 * the waitlist, a success confirmation, or a friendly error message.
 */
export function WaitlistForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    interest: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    country: "",
    interest: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
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

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      country: "",
      interest: "",
    };

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.country) {
      newErrors.country = "Please select your country.";
    }

    if (!form.interest) {
      newErrors.interest = "Please select your interest.";
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
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        interest: form.interest.trim(),
      });

      setSubmitSuccess(true);
      setSubmitError("");
      setEmailSent(result.emailSent);

      setForm({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        interest: "",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "";

      if (message.toLowerCase().includes("duplicate")) {
        setIsDuplicate(true);
        setSubmitError("");
      } else {
        setSubmitError(waitlistContent.error.unknown);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success Message */}
      {submitSuccess && (
        <div
          aria-live="polite"
          className="mx-auto mt-8 w-full max-w-md rounded-xl border border-green-200 bg-green-50 p-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-green-900">
              {waitlistContent.success.heading}
            </h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-green-800">
              {waitlistContent.success.body}
            </p>

            {!emailSent && (
              <p className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm font-medium text-green-900">
                {waitlistContent.success.emailNote}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Already Joined Notice */}
      {isDuplicate && (
        <div
          aria-live="polite"
          className="mx-auto mt-8 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Heart
                className="h-7 w-7 text-amber-600"
                fill="currentColor"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-xl font-bold text-amber-900">
              {waitlistContent.duplicate.heading}
            </h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-amber-800">
              {waitlistContent.duplicate.body}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div
          aria-live="polite"
          className="mx-auto mt-8 w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="whitespace-pre-line text-sm text-red-800">
            {submitError}
          </p>
        </div>
      )}

      <form
        className="mx-auto mt-8 w-full max-w-md space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Full Name */}
        <div className="text-left">
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.fullNameLabel}
            <span className="ml-0.5 text-blue-300" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder={waitlistContent.form.fullNamePlaceholder}
            value={form.fullName}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-slate-300 focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-300">{errors.fullName}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="text-left">
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.emailLabel}
            <span className="ml-0.5 text-blue-300" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder={waitlistContent.form.emailPlaceholder}
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-slate-300 focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-300">{errors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="text-left">
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.phoneLabel}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder={waitlistContent.form.phonePlaceholder}
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-slate-300 focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Country */}
        <div className="text-left">
          <label
            htmlFor="country"
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.countryLabel}
            <span className="ml-0.5 text-blue-300" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id="country"
            name="country"
            value={form.country}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Interest */}
        <div className="text-left">
          <label
            htmlFor="interest"
            className="mb-1.5 block text-sm font-medium text-slate-200"
          >
            {waitlistContent.form.interestLabel}
            <span className="ml-0.5 text-blue-300" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id="interest"
            name="interest"
            value={form.interest}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled className="text-slate-400">
              {waitlistContent.form.interestPlaceholder}
            </option>
            {interests.map((interest) => (
              <option key={interest} value={interest} className="text-slate-900">
                {interest}
              </option>
            ))}
          </select>
          {errors.interest && (
            <p className="mt-1 text-sm text-red-300">{errors.interest}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-accent text-base hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? waitlistContent.form.submittingLabel
            : waitlistContent.form.submitLabel}
        </Button>
      </form>
    </>
  );
}

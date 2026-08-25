"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Heart } from "lucide-react";
import { waitlistContent } from "@/content/waitlist";
import { isPartnerInterest } from "@/lib/waitlist/intent";
import { waitlistShareUrl, waitlistWhatsAppHref } from "@/lib/waitlist/share";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WaitlistThankYouProps = {
  variant: "success" | "duplicate";
  interest?: string;
  emailSent?: boolean;
};

export function WaitlistThankYou({
  variant,
  interest = "",
  emailSent = true,
}: WaitlistThankYouProps) {
  const [copied, setCopied] = useState(false);
  const copy = variant === "success" ? waitlistContent.success : waitlistContent.duplicate;

  const body =
    variant === "success"
      ? isPartnerInterest(interest)
        ? waitlistContent.success.partnerBody
        : waitlistContent.success.travelerBody
      : waitlistContent.duplicate.body;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(waitlistShareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      aria-live="polite"
      className={cn(
        "w-full rounded-2xl border p-6 text-center",
        variant === "success"
          ? "border-emerald-200/40 bg-emerald-50"
          : "border-brand-orange-200 bg-brand-orange-50",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
          variant === "success" ? "bg-emerald-100" : "bg-brand-orange-100",
        )}
      >
        {variant === "success" ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        ) : (
          <Heart
            className="h-7 w-7 text-brand-orange-600"
            fill="currentColor"
            aria-hidden="true"
          />
        )}
      </div>

      <h3
        className={cn(
          "mt-4 font-display text-xl font-semibold tracking-tight",
          variant === "success" ? "text-emerald-950" : "text-brand-orange-950",
        )}
      >
        {copy.heading}
      </h3>

      <p
        className={cn(
          "mt-3 text-sm leading-relaxed",
          variant === "success" ? "text-emerald-900" : "text-brand-orange-900",
        )}
      >
        {body}
      </p>

      {variant === "success" && !emailSent && (
        <p className="mt-4 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-950">
          {waitlistContent.success.emailNote}
        </p>
      )}

      {variant === "success" && (
        <div className="mt-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            {waitlistContent.success.nextStepsTitle}
          </p>
          <ol className="mt-3 space-y-2">
            {waitlistContent.success.nextSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 text-sm leading-6 text-emerald-900"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[11px] font-semibold text-emerald-900">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-6 border-t border-black/5 pt-5">
        <p
          className={cn(
            "text-sm font-semibold",
            variant === "success" ? "text-emerald-950" : "text-brand-orange-950",
          )}
        >
          {copy.shareTitle}
        </p>
        <p
          className={cn(
            "mt-1 text-sm",
            variant === "success" ? "text-emerald-800" : "text-brand-orange-800",
          )}
        >
          {copy.shareBody}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={waitlistWhatsAppHref()}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full sm:w-auto")}
          >
            {copy.shareCta}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full sm:w-auto",
            )}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {copied ? copy.copiedCta : copy.copyLinkCta}
          </button>
        </div>
      </div>

      <Link
        href="/#explore-ghana"
        className={cn(
          "mt-5 inline-flex text-sm font-semibold underline-offset-4 hover:underline",
          variant === "success" ? "text-emerald-900" : "text-brand-orange-900",
        )}
      >
        {copy.exploreCta} →
      </Link>
    </div>
  );
}

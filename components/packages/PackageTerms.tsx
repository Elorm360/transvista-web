import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { sharedBookingPolicy } from "@/lib/travel/packages";

type PackageTermsProps = {
  terms: readonly string[];
  title?: string;
};

export function PackageTerms({
  terms,
  title = "Booking and payment terms",
}: PackageTermsProps) {
  return (
    <aside className="rounded-[24px] border border-brand-blue-100 bg-brand-blue-50/60 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-blue-700 shadow-sm">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-slate-900">
          {title}
        </h2>
      </div>
      <ul className="mt-5 space-y-3">
        {terms.map((term) => (
          <li key={term} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange-500" />
            {term}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        All bookings are governed by the{" "}
        <Link
          href={sharedBookingPolicy.policyHref}
          className="font-semibold text-brand-blue-800 underline decoration-brand-orange-300 underline-offset-4"
        >
          TransVista Payment, Booking & Refund Policy
        </Link>
        .
      </p>
    </aside>
  );
}

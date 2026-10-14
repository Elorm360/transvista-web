"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { centralRegionPackage as trip } from "@/lib/travel/packages";

const closesAt = Date.parse(`${trip.registrationDeadlineIso}T23:59:59Z`);
const noopSubscribe = () => () => {};

/** Compact "next departure" ticket; hides itself once registration closes. */
export function HeroTripCard() {
  const open = useSyncExternalStore(
    noopSubscribe,
    () => Date.now() <= closesAt,
    () => true,
  );

  if (!open) return null;

  const [weekday, ...rest] = trip.displayDate.split(", ");

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group block w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl transition hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange-300">
          Next group trip
        </p>
        <ArrowUpRight
          className="h-4 w-4 text-white/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          aria-hidden="true"
        />
      </div>
      <p className="font-display mt-3 text-xl font-semibold leading-snug">
        {trip.shortTitle}
      </p>
      <p className="mt-1 text-sm text-white/70">
        Kakum · Cape Coast · Elmina
      </p>
      <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4 text-sm">
        <div>
          <p className="text-white/60">{weekday}</p>
          <p className="font-medium">{rest.join(", ")}</p>
        </div>
        <p className="text-right">
          <span className="font-display text-2xl font-semibold">
            {trip.currencySymbol}
            {trip.pricePerPerson}
          </span>
          <span className="block text-xs text-white/60">per person</span>
        </p>
      </div>
    </Link>
  );
}

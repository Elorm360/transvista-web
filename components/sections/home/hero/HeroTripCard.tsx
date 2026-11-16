"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { pastEvents } from "@/lib/events/past-events";

/** Compact link to the latest completed group experience. */
export function HeroTripCard() {
  const latestEvent = pastEvents[0];

  if (!latestEvent) return null;

  return (
    <Link
      href={latestEvent.href}
      className="group block w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl transition hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange-300">
          Recent TransVista experience
        </p>
        <ArrowUpRight className="h-4 w-4 text-white/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
      </div>
      <p className="font-display mt-3 text-xl font-semibold leading-snug">{latestEvent.title}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        {latestEvent.dateLabel}
      </p>
      <span className="mt-5 inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-white/10">
        View past event
      </span>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock3, MapPin, X } from "lucide-react";
import { upcomingEvents, type UpcomingEvent } from "@/lib/events/upcoming-events";

const repeatWindowMs = 24 * 60 * 60 * 1000;
type DisplayState = "hidden" | "open" | "minimized";

function activeEvent(events: UpcomingEvent[]) {
  const now = Date.now();
  return events.find(
    (event) =>
      now <= Date.parse(`${event.registrationDeadlineIso}T23:59:59Z`),
  );
}

export function UpcomingEventSpotlight() {
  const pathname = usePathname();
  const [event, setEvent] = useState<UpcomingEvent | null>(null);
  const [display, setDisplay] = useState<DisplayState>("hidden");

  useEffect(() => {
    const nextEvent = activeEvent(upcomingEvents);
    if (!nextEvent || pathname === nextEvent.href) return;

    setEvent(nextEvent);
    const storageKey = `transvista:event-spotlight:${nextEvent.id}`;
    const lastDismissed = Number(window.localStorage.getItem(storageKey) || 0);

    if (lastDismissed && Date.now() - lastDismissed < repeatWindowMs) {
      setDisplay("minimized");
      return;
    }

    const timer = window.setTimeout(() => setDisplay("open"), 900);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (display !== "open") return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  function dismiss() {
    if (!event) return;
    window.localStorage.setItem(
      `transvista:event-spotlight:${event.id}`,
      String(Date.now()),
    );
    setDisplay("minimized");
  }

  if (!event || display === "hidden") return null;

  if (display === "minimized") {
    return (
      <div className="fixed bottom-5 left-4 z-40 max-w-[calc(100vw-2rem)] sm:left-6">
        <button
          type="button"
          onClick={() => setDisplay("open")}
          className="flex items-center gap-3 rounded-full border border-white/20 bg-brand-blue-950 px-4 py-3 text-left text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-brand-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2"
          aria-label="Open upcoming trip details"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange-500">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange-200">
              Upcoming trip
            </span>
            <span className="block max-w-52 truncate text-sm font-semibold">
              {event.title}
            </span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upcoming-event-title"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) dismiss();
      }}
    >
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[30px] bg-white shadow-2xl sm:max-w-3xl sm:rounded-[30px]">
        <button
          type="button"
          onClick={dismiss}
          autoFocus
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500"
          aria-label="Close upcoming trip announcement"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-52 overflow-hidden md:min-h-[430px] md:rounded-l-[30px]">
            <Image
              src={event.image}
              alt={event.imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-brand-blue-950 shadow">
              {event.priceLabel}
            </span>
          </div>

          <div className="p-6 sm:p-8 md:flex md:flex-col md:justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange-700">
              {event.eyebrow}
            </p>
            <h2
              id="upcoming-event-title"
              className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-950"
            >
              {event.title}
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <p className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange-600" />
                <span>{event.dateLabel}</span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange-600" />
                <span>Accra Mall pickup · Central Region</span>
              </p>
              <p className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange-600" />
                <span>Registration closes {event.registrationDeadline}</span>
              </p>
            </div>

            <p className="mt-5 text-base leading-7 text-slate-600">
              {event.summary}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`${event.href}#register`}
                onClick={dismiss}
                className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2"
              >
                Reserve my spot
              </Link>
              <Link
                href={event.href}
                onClick={dismiss}
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600"
              >
                View trip details
              </Link>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-4 text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
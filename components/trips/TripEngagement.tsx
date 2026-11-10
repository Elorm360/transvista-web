"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";

const SECOND_MS = 1000;
const DAY_SECONDS = 24 * 60 * 60;

function secondsUntil(isoDate: string) {
  const deadline = Date.parse(`${isoDate}T23:59:59Z`);
  return Math.max(0, Math.floor((deadline - Date.now()) / SECOND_MS));
}

/** Live registration countdown, using Ghana local time (UTC+0). */
export function RegistrationCountdown({ deadlineIso }: { deadlineIso: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRemaining(secondsUntil(deadlineIso));
    update();
    const timer = window.setInterval(update, SECOND_MS);
    return () => window.clearInterval(timer);
  }, [deadlineIso]);

  if (remaining === null) return null;

  const days = Math.floor(remaining / DAY_SECONDS);
  const hours = Math.floor((remaining % DAY_SECONDS) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const closed = remaining === 0;
  const units = [
    ["Days", days],
    ["Hours", hours],
    ["Mins", minutes],
    ["Secs", seconds],
  ] as const;

  return (
    <div
      className="inline-flex flex-col gap-2"
      role="timer"
      aria-label={closed ? "Registration has closed" : `Registration closes in ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
        {closed ? "Registration has closed" : "Registration closes in"}
      </span>
      {!closed ? (
        <span className="flex items-center gap-2" aria-hidden="true">
          {units.map(([label, value]) => (
            <span key={label} className="min-w-[3.5rem] rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-center backdrop-blur-sm">
              <span className="block font-display text-2xl font-semibold leading-none tabular-nums text-white">
                {String(value).padStart(2, "0")}
              </span>
              <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.12em] text-white/65">
                {label}
              </span>
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Mobile-only bar with price + reserve, shown once the hero CTA scrolls
 * away and hidden again while the registration form is on screen.
 */
export function StickyReserveBar({ priceLabel, registrationOpen }: { priceLabel: string; registrationOpen: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById("register");
    let formInView = false;
    const observer = form
      ? new IntersectionObserver(([entry]) => {
          formInView = entry.isIntersecting;
          onScroll();
        })
      : null;
    function onScroll() {
      setVisible(window.scrollY > 600 && !formInView);
    }
    if (form && observer) observer.observe(form);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!registrationOpen) return null;

  return (
    <div
      className={`fixed bottom-5 left-3 right-[5.25rem] z-40 rounded-2xl border border-slate-200/80 bg-white/90 py-2.5 pl-4 pr-2.5 shadow-[0_18px_40px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl transition duration-300 ease-out md:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-[calc(100%+1rem)] opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-slate-900">
            {priceLabel}
          </p>
          <p className="text-xs text-slate-500">No payment now</p>
        </div>
        <a
          href="#register"
          tabIndex={visible ? 0 : -1}
          className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-brand-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
        >
          Reserve my spot
        </a>
      </div>
    </div>
  );
}

/** Native share sheet where available, WhatsApp share otherwise. */
export function ShareTripButton({ title, text }: { title: string; text: string }) {
  async function share() {
    const url = window.location.href.split("#")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User dismissed the share sheet.
      }
      return;
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 underline-offset-4 transition hover:text-white hover:underline"
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      Share with a friend
    </button>
  );
}

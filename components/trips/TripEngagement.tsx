"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(isoDate: string) {
  // Registration closes at the end of the deadline day (Ghana, UTC+0).
  const deadline = Date.parse(`${isoDate}T23:59:59Z`);
  return Math.ceil((deadline - Date.now()) / DAY_MS);
}

/** "Registration closes in 12 days" — rendered client-side to stay accurate. */
export function RegistrationCountdown({ deadlineIso }: { deadlineIso: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setDays(daysUntil(deadlineIso));
    update();
    const timer = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [deadlineIso]);

  if (days === null) return null;

  const label =
    days < 0
      ? "Registration has closed"
      : days === 0
        ? "Registration closes today"
        : days === 1
          ? "Registration closes tomorrow"
          : `Registration closes in ${days} days`;

  const urgent = days >= 0 && days <= 3;

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {days >= 0 && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
              urgent ? "bg-red-400" : "bg-emerald-400"
            }`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            days < 0 ? "bg-slate-400" : urgent ? "bg-red-500" : "bg-emerald-400"
          }`}
        />
      </span>
      {label}
    </span>
  );
}

/**
 * Mobile-only bar with price + reserve, shown once the hero CTA scrolls
 * away and hidden again while the registration form is on screen.
 */
export function StickyReserveBar({ priceLabel }: { priceLabel: string }) {
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

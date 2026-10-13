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

  return (
    <span
      className={`inline-flex h-12 items-center rounded-full px-5 text-sm font-semibold ${
        days <= 3 ? "bg-red-600 text-white" : "bg-white/15 text-white"
      }`}
    >
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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 pr-24 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="whitespace-nowrap text-base font-bold text-slate-900">{priceLabel}</p>
          <p className="text-xs text-slate-600">No payment now</p>
        </div>
        <a
          href="#register"
          tabIndex={visible ? 0 : -1}
          className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-brand-orange-600 px-4 text-sm font-semibold text-white"
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
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      Share with a friend
    </button>
  );
}

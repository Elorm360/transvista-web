"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { X } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { destinations } from "@/constants/data/destinations";
import { experiences } from "@/constants/data/experiences";
import { centralRegionPackage } from "@/lib/travel/packages";

function pageMessage(pathname: string) {
  const [, section, slug] = pathname.split("/");

  if (section === "trips") {
    return `Hi TransVista Africa, I'm interested in the ${centralRegionPackage.title} (${centralRegionPackage.displayDate}).`;
  }
  if (section === "destinations") {
    const destination = destinations.find((item) => item.slug === slug);
    if (destination) {
      return `Hi TransVista Africa, I'd like help planning a trip to ${destination.name}.`;
    }
  }
  if (section === "experiences") {
    const experience = experiences.find((item) => item.slug === slug);
    if (experience) {
      return `Hi TransVista Africa, I'm interested in the ${experience.name} experience.`;
    }
  }
  return null;
}

const topics = [
  {
    id: "group-trip",
    label: "Upcoming group trip",
    message: `Hi TransVista Africa, I have a question about the ${centralRegionPackage.title} (${centralRegionPackage.displayDate}).`,
  },
  {
    id: "custom-trip",
    label: "Plan a custom trip",
    message: "Hi TransVista Africa, I would like help planning my trip to Ghana.",
  },
  {
    id: "airport-transport",
    label: "Airport pickup or transport",
    message: "Hi TransVista Africa, I need an airport pickup or transport in Ghana.",
  },
  {
    id: "booking-payment",
    label: "My booking or payment",
    message: "Hi TransVista Africa, I have a question about my booking. My reference is: ",
  },
  {
    id: "partner",
    label: "Partner with TransVista",
    message: "Hi TransVista Africa, I'd like to partner with you (guide / stay / transport / tourism business).",
  },
];

/**
 * WhatsAppButton
 *
 * Floating chat entry point with a small topic menu, so every chat starts
 * with context the team can act on. On destination, experience and trip
 * pages the first option matches the page.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const contextual = pageMessage(pathname);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const options = contextual
    ? [{ id: "this-page", label: "About this page", message: contextual }, ...topics]
    : topics;

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
      {open && (
        <div
          id="whatsapp-menu"
          className="absolute bottom-[calc(100%+0.75rem)] right-0 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3 bg-[#25D366] px-5 py-4 text-white">
            <div>
              <p className="text-base font-semibold">Chat with TransVista</p>
              <p className="text-sm text-white/90">What can we help with?</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close WhatsApp menu"
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {options.map((option) => (
              <li key={option.id}>
                <a
                  href={whatsappLink(option.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    track("whatsapp_click", { topic: option.id, page: pathname });
                    setOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  {option.label}
                  <FaWhatsapp className="h-4 w-4 shrink-0 text-[#25D366]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="whatsapp-menu"
        aria-label="Chat with TransVista Africa on WhatsApp"
        className="pulse-whatsapp group flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-4 text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.7)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] sm:px-5"
      >
        <FaWhatsapp className="h-7 w-7 shrink-0" aria-hidden="true" />
        <span className="hidden text-sm font-semibold sm:inline">
          WhatsApp support
        </span>
      </button>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import {
  ChevronRight,
  Handshake,
  Map,
  MessageCircle,
  Plane,
  Receipt,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
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

type Topic = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  message: string;
};

const topics: Topic[] = [
  {
    id: "group-trip",
    label: "Upcoming group trip",
    hint: centralRegionPackage.displayDate,
    icon: Users,
    message: `Hi TransVista Africa, I have a question about the ${centralRegionPackage.title} (${centralRegionPackage.displayDate}).`,
  },
  {
    id: "custom-trip",
    label: "Plan a custom trip",
    hint: "Dates, places, budget",
    icon: Map,
    message: "Hi TransVista Africa, I would like help planning my trip to Ghana.",
  },
  {
    id: "airport-transport",
    label: "Airport pickup & transport",
    hint: "Kotoka arrivals, intercity",
    icon: Plane,
    message: "Hi TransVista Africa, I need an airport pickup or transport in Ghana.",
  },
  {
    id: "booking-payment",
    label: "My booking or payment",
    hint: "Have your reference ready",
    icon: Receipt,
    message: "Hi TransVista Africa, I have a question about my booking. My reference is: ",
  },
  {
    id: "partner",
    label: "Partner with us",
    hint: "Guides, stays, transport",
    icon: Handshake,
    message: "Hi TransVista Africa, I'd like to partner with you (guide / stay / transport / tourism business).",
  },
];

/**
 * WhatsAppButton
 *
 * Icon-only floating launcher that opens a compact topic menu, so every
 * chat starts with context. On destination, experience and trip pages the
 * first option refers to the current page.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const contextual = pageMessage(pathname);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const options: Topic[] = contextual
    ? [
        {
          id: "this-page",
          label: "About this page",
          hint: "We'll know what you're viewing",
          icon: MessageCircle,
          message: contextual,
        },
        ...topics,
      ]
    : topics;

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
      <div
        id="whatsapp-menu"
        role="dialog"
        aria-label="Chat with TransVista on WhatsApp"
        aria-hidden={!open}
        className={`absolute bottom-[calc(100%+0.75rem)] right-0 w-[min(21rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] transition duration-200 ease-out ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#1DA851]">
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">TransVista Africa</p>
            <p className="text-xs text-slate-500">Pick a topic to continue on WhatsApp</p>
          </div>
        </div>

        <ul className="p-1.5">
          {options.map(({ id, label, hint, icon: Icon, message }) => (
            <li key={id}>
              <a
                href={whatsappLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  track("whatsapp_click", { topic: id, page: pathname });
                  setOpen(false);
                }}
                className="group/item flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover/item:bg-brand-blue-50 group-hover/item:text-brand-blue-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">{label}</span>
                  <span className="block truncate text-xs text-slate-500">{hint}</span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-slate-500"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="whatsapp-menu"
        aria-label="Chat with TransVista Africa on WhatsApp"
        title="Chat on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_-8px_rgba(37,211,102,0.55)] ring-1 ring-black/5 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(37,211,102,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <FaWhatsapp
          className={`absolute h-7 w-7 transition duration-200 ${open ? "rotate-90 scale-50 opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        />
        <X
          className={`absolute h-6 w-6 transition duration-200 ${open ? "opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

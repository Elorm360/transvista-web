"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { whatsappLink } from "@/lib/whatsapp";
import { destinations } from "@/constants/data/destinations";
import { experiences } from "@/constants/data/experiences";
import { centralRegionPackage } from "@/lib/travel/packages";

function messageFor(pathname: string) {
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
  return "Hi TransVista Africa, I would like help planning my trip.";
}

/**
 * WhatsAppButton
 *
 * Fixed floating chat entry point. The pre-filled message matches the page
 * the traveller is on, so the team knows the context immediately.
 */
export function WhatsAppButton() {
  const pathname = usePathname();

  return (
    <a
      href={whatsappLink(messageFor(pathname))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with TransVista Africa on WhatsApp"
      className="pulse-whatsapp group fixed bottom-6 right-6 z-50 flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-4 text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.7)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] sm:bottom-8 sm:right-8 sm:px-5"
    >
      <FaWhatsapp className="h-7 w-7 shrink-0" aria-hidden="true" />
      <span className="hidden text-sm font-semibold sm:inline">
        WhatsApp support
      </span>
    </a>
  );
}

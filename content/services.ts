import type { LucideIcon } from "lucide-react";
import { Compass, Route, Users } from "lucide-react";

export interface ServiceItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ServicesContent {
  badge: string;
  title: string;
  description: string;
  items: ServiceItem[];
}

export const servicesContent: ServicesContent = {
  badge: "What We Do",

  title: "Three pillars. One connected journey.",

  description:
    "TransVista brings mobility, experiences, and community together — so every part of your trip across Ghana works as one connected system, not a stack of separate bookings.",

  items: [
    {
      title: "Mobility",
      description:
        "Reliable transport connections that get you where you're going — from airport transfers to intercity travel, coordinated with trusted local providers.",
      icon: Route,
    },
    {
      title: "Experiences",
      description:
        "Curated tours, cultural landmarks, and hidden gems — hand-picked so every stop is worth the trip, not just another checkbox on an itinerary.",
      icon: Compass,
    },
    {
      title: "Connect",
      description:
        "A direct line to verified local guides, tourism businesses, and community partners who know Ghana best — trust built into every interaction.",
      icon: Users,
    },
  ],
};

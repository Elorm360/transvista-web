import type { LucideIcon } from "lucide-react";
import { Compass, Hotel, MessageCircle, Route } from "lucide-react";

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
  badge: "What We Plan",

  title: "One request. The right level of support.",

  description:
    "Come with a clear itinerary or just a starting idea. TransVista coordinates the pieces you need and introduces trusted providers after your plan is confirmed.",

  items: [
    {
      title: "Experiences & Tours",
      description:
        "Curated culture, nature, food, heritage, and local experiences matched to your interests and pace.",
      icon: Compass,
    },
    {
      title: "Transport & Transfers",
      description:
        "Airport pickup, local movement, and intercity routes coordinated with trusted transport providers.",
      icon: Route,
    },
    {
      title: "Accommodation",
      description:
        "Places to stay selected around your route, budget, comfort, and the kind of trip you want.",
      icon: Hotel,
    },
    {
      title: "Complete Trip Planning",
      description:
        "A connected itinerary combining destinations, stays, transport, and experiences in one proposal.",
      icon: MessageCircle,
    },
  ],
};

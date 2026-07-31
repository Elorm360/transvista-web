import type { FeatureIconKey } from "@/lib/icons";

export interface WhyTransVistaCard {
  title: string;
  description: string;
  icon: FeatureIconKey;
}

export interface WhyTransVistaContent {
  badge: string;
  title: string;
  description: string;
  cards: WhyTransVistaCard[];
}

export const whyTransVistaContent: WhyTransVistaContent = {
  badge: "Why TransVista",

  title: "Everything you need to explore Ghana in one trusted platform.",

  description:
    "Planning your trip shouldn't mean juggling transport, accommodations, tour guides, and local contacts. TransVista brings trusted travel services together to make discovering Ghana simpler, safer, and more enjoyable.",

  cards: [
    {
      title: "Trusted Transport",
      description:
        "Connect with reliable transport providers for safe and convenient travel across Ghana.",
      icon: "Bus",
    },
    {
      title: "Curated Experiences",
      description:
        "Discover authentic tours, cultural experiences, and unforgettable destinations selected with care.",
      icon: "Compass",
    },
    {
      title: "Local Expertise",
      description:
        "Travel confidently with trusted guides, tourism businesses, and community partners.",
      icon: "Users",
    },
  ],
};

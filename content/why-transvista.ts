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

  title: "One connected journey. Built on trust.",

  description:
    "Transport, experiences, and local partners belong in the same plan. TransVista vets the people in that plan, keeps pricing clear, and designs the trip for how Ghana is actually travelled.",

  cards: [
    {
      title: "One connected journey",
      description:
        "Mobility, curated experiences, and verified local partners in one place — not a stack of separate bookings that do not talk to each other.",
      icon: "Compass",
    },
    {
      title: "Vetted partners, clear prices",
      description:
        "Every partner is vetted before they join, and you agree one clear price with TransVista before you pay anything.",
      icon: "ShieldCheck",
    },
    {
      title: "Local Expertise",
      description:
        "Built with guides and partners rooted in the communities you’ll visit, with transparent pricing and people you can actually reach.",
      icon: "Users",
    },
  ],
};

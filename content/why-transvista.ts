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

  title: "Built on trust, not just convenience.",

  description:
    "Anyone can list a transport provider or a tour. What makes TransVista different is how every partner, payment, and journey is vetted, transparent, and built for the way people actually travel across Ghana.",

  cards: [
    {
      title: "Verified & Secure",
      description:
        "Every partner is vetted before they join, and every transaction is protected — so you can book with confidence, not guesswork.",
      icon: "ShieldCheck",
    },
    {
      title: "Local Expertise",
      description:
        "Built by people who know Ghana — guides and partners rooted in the communities you'll actually visit, not a generic directory.",
      icon: "Users",
    },
    {
      title: "Transparent Pricing",
      description:
        "No hidden fees or last-minute surprises. What you see when you plan is what you pay when you travel.",
      icon: "BadgeCheck",
    },
    {
      title: "Curated, Not Crowdsourced",
      description:
        "Every experience is selected with care by people who've actually been there — quality over an endless, unvetted list.",
      icon: "Compass",
    },
    {
      title: "Built for Africa",
      description:
        "Designed for the realities of travel across Ghana and the wider region — not a global template retrofitted for local roads.",
      icon: "Globe2",
    },
    {
      title: "Real Support, Real People",
      description:
        "A team that's reachable when you need help — before, during, and after your trip, not a chatbot loop.",
      icon: "MessageCircle",
    },
  ],
};

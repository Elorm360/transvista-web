import type { EcosystemIconKey } from "@/lib/icons";

export interface EcosystemPillar {
  title: string;
  description: string;
  icon: EcosystemIconKey;
}

export interface EcosystemContent {
  badge: string;
  title: string;
  description: string;
  pillars: EcosystemPillar[];
  cta: {
    label: string;
  };
}

export const ecosystemContent: EcosystemContent = {
  badge: "Our Ecosystem",

  title: "Building Africa's Connected Travel Ecosystem.",

  description:
    "TransVista is bringing together transport providers, tour operators, accommodations, local guides, tourism businesses, and travelers into one trusted digital ecosystem designed for Africa.",

  pillars: [
    {
      title: "Transport",
      description:
        "Trusted transport providers that help travelers move confidently across destinations.",
      icon: "Bus",
    },
    {
      title: "Tour Guides",
      description:
        "Local experts creating authentic experiences.",
      icon: "Compass",
    },
    {
      title: "Accommodation",
      description:
        "Hotels, guesthouses, and unique places to stay.",
      icon: "Hotel",
    },
    {
      title: "Local Businesses",
      description:
        "Restaurants, artisans, attractions, and community experiences.",
      icon: "Store",
    },
  ],

  cta: {
    label: "Become a Partner",
  },
};


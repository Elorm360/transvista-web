import { brand } from "@/constants/config/brand";

export interface FooterColumnLink {
  label: string;
  href?: string;
  isDisabled?: boolean;
  comingSoon?: boolean;
}

export type SocialPlatformKey =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "tiktok";

export interface SocialLink {
  label: string;
  key: SocialPlatformKey;
  href: string;
}

export interface FooterContent {
  brand: {
    tagline: string;
    mission: string;
  };
  columns: Array<{
    heading: string;
    links: FooterColumnLink[];
  }>;
  contact: {
    phone: string;
    phoneHref: string;
    email: string;
    emailHref: string;
    location: string;
  };
  socials: SocialLink[];
  bottom: {
    copyright: string;
    builtWith: string;
    links: FooterColumnLink[];
  };
}

const socialPlatforms: Array<{
  label: string;
  key: SocialPlatformKey;
}> = [
  { label: "LinkedIn", key: "linkedin" },
  { label: "Facebook", key: "facebook" },
  { label: "Instagram", key: "instagram" },
  { label: "TikTok", key: "tiktok" },
];

export const footerContent: FooterContent = {
  brand: {
    tagline: brand.tagline,
    mission:
      "Thoughtfully coordinating trusted travel experiences across Ghana.",
  },

  columns: [
    {
      heading: "Explore",
      links: [
        { label: "Explore Ghana", href: "/#explore-ghana" },
        { label: "Accra", href: "/destinations/accra" },
        { label: "Cape Coast & Elmina", href: "/destinations/cape-coast" },
        { label: "Volta Region", href: "/destinations/volta-region" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Upcoming Group Trip", href: "/trips/central-region-heritage-adventure-2026" },
        { label: "Plan My Trip", href: "/plan" },
      ],
    },
  ],

  contact: {
    phone: "+233 24 844 2916",
    phoneHref: "tel:+233248442916",
    email: "info@transvistaafrica.com",
    emailHref: "mailto:info@transvistaafrica.com",
    location: "Accra, Ghana",
  },

  socials: socialPlatforms.map(({ label, key }) => {
    const href = brand.socials[key];
    return {
      label,
      key,
      href: href || "#",
    };
  }),

  bottom: {
    copyright: `© ${new Date().getFullYear()} TransVista Africa Ltd. All rights reserved.`,
    builtWith: "Built with ❤️ in Ghana.",
    links: [
      {
        label: "Payment, Booking & Refund Policy",
        href: "/policies/payment-booking-refunds",
      },
      {
        label: "Privacy Policy",
        comingSoon: true,
      },
      {
        label: "Terms of Service",
        comingSoon: true,
      },
      {
        label: "Cookie Policy",
        comingSoon: true,
      },
    ],
  },
};

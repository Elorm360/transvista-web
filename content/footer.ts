import { brand } from "@/constants/config/brand";
import { whatsappLink } from "@/lib/whatsapp";

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
    whatsappHref: string;
  };
  community: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    cta: string;
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
        { label: "Contact", href: "/contact" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "All Destinations", href: "/destinations" },
        { label: "Group Trips", href: "/trips" },
        { label: "Plan My Trip", href: "/plan" },
      ],
    },
  ],

  contact: {
    phone: brand.contact.phoneDisplay,
    phoneHref: brand.contact.phoneHref,
    email: brand.contact.email,
    emailHref: `mailto:${brand.contact.email}`,
    location: "Accra, Ghana",
    whatsappHref: whatsappLink(
      "Hi TransVista Africa, I would like help planning my trip.",
    ),
  },

  community: {
    eyebrow: "Travel updates on WhatsApp",
    title: "Join the TransVista community",
    description:
      "Get new group-trip announcements, Ghana travel inspiration and useful planning updates directly from our official channel.",
    href: "https://whatsapp.com/channel/0029VbBchTr0G0XluVpGfy2q",
    cta: "Follow our WhatsApp Channel",
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
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookies", href: "/privacy#cookies" },
    ],
  },
};

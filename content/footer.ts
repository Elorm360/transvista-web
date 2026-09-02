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
      "Building Africa's connected travel ecosystem by making travel simpler, safer, and more accessible.",
  },

  columns: [
    {
      heading: "Explore",
      links: [
        { label: "Home", href: "/" },
        { label: "Volta trip package", href: "/packages/volta-highlands-escape" },
        { label: "Explore Ghana", href: "/#explore-ghana" },
        { label: "Cape Coast", href: "/destinations/cape-coast" },
        { label: "Mole National Park", href: "/destinations/mole-national-park" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Join Waitlist", href: "/#waitlist" },
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

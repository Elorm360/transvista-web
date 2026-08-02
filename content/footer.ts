import { brand } from "@/constants/config/brand";

export interface FooterColumnLink {
  label: string;
  href?: string;
  isDisabled?: boolean;
  comingSoon?: boolean;
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
  socials: Array<{
    label: string;
    href: string;
    comingSoon: boolean;
  }>;
  bottom: {
    copyright: string;
    builtWith: string;
    links: FooterColumnLink[];
  };
}

const socialPlatforms = [
  { label: "LinkedIn", key: "linkedin" as const },
  { label: "Facebook", key: "facebook" as const },
  { label: "Instagram", key: "instagram" as const },
  { label: "X (Twitter)", key: "x" as const },
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
        { label: "Experiences", href: "#experiences" },
        { label: "Explore Ghana", href: "#explore-by-experience" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Partners", href: "#ecosystem" },
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
      href: href || "#",
      comingSoon: !href,
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


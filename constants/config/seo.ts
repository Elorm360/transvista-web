export interface SeoConfig {
  name: string;
  title: string;
  shortTitle: string;
  description: string;
  url: string;
  locale: string;
  type: string;
  author: string;
  keywords: string[];
  openGraphImage: string;
  twitterHandle: string;
}

export const seoConfig: SeoConfig = {
  name: "TransVista Africa",

  title:
    "TransVista Africa | Discover Ghana Through Trusted Travel Experiences",

  shortTitle: "TransVista Africa",

  description:
    "Discover trusted transport, curated experiences, and seamless travel planning across Ghana. Join the TransVista waitlist and be part of the future of African travel.",

  url: "https://transvistaafrica.com",

  locale: "en_GH",

  type: "website",

  author: "TransVista Africa Ltd",

  keywords: [
    "Ghana travel",
    "Travel Ghana",
    "Tourism Ghana",
    "Visit Ghana",
    "Ghana tours",
    "African travel",
    "Travel technology",
    "Tour guides Ghana",
    "Transport Ghana",
    "Travel experiences Ghana",
  ],

  openGraphImage: "/images/og/transvista-og.png",

  twitterHandle: "@transvistaafrica",
};

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
}

export const seoConfig: SeoConfig = {
  name: "TransVista Africa",

  title:
    "TransVista Africa | Thoughtfully Planned Ghana Travel",

  shortTitle: "TransVista Africa",

  description:
    "Explore curated Ghana destinations and let TransVista coordinate trusted experiences, transport, accommodation, or your complete trip.",

  url: "https://www.transvistaafrica.com",

  locale: "en_GH",

  type: "website",

  author: "TransVista Africa Ltd",

  keywords: [
    "Ghana travel planning",
    "Travel Ghana",
    "Ghana tours",
    "Visit Ghana",
    "Accra travel",
    "Cape Coast and Elmina",
    "Volta Region travel",
    "Ghana transport",
    "Ghana accommodation",
    "Ghana travel experiences",
  ],

  openGraphImage: "/images/og/transvista-og.png",

};

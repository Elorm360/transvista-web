export type PastEvent = {
  slug: string;
  title: string;
  region: string;
  dateLabel: string;
  dateIso: string;
  originalPriceLabel: string;
  pickup: string;
  summary: string;
  destinations: string[];
  href: string;
  feedbackHref: string;
};

export const pastEvents: PastEvent[] = [
  {
    slug: "central-region-heritage-adventure-2026",
    title: "Central Region Heritage & Adventure Day Trip",
    region: "Central Region",
    dateLabel: "Saturday, 14 November 2026",
    dateIso: "2026-11-14",
    originalPriceLabel: "GH₵400 per person",
    pickup: "Accra Mall, Accra",
    summary:
      "A full-day journey combining rainforest adventure, coastal heritage, shared meals and a guided photo and video experience.",
    destinations: [
      "Kakum National Park",
      "Hans Cottage Botel",
      "Cape Coast Castle",
      "Elmina Castle",
    ],
    href: "/past-events/central-region-heritage-adventure-2026",
    feedbackHref: "/event-feedback/central-region-heritage-adventure-2026",
  },
];

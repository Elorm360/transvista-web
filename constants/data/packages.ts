export type TripPackage = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  region: string;
  duration: string;
  priceFrom: number;
  currency: "USD";
  priceNote: string;
  groupType: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  itinerary: Array<{
    day: string;
    title: string;
    description: string;
  }>;
};

export const tripPackages: TripPackage[] = [
  {
    id: "volta-highlands-escape",
    slug: "volta-highlands-escape",
    name: "Volta Highlands & Waterfalls Escape",
    eyebrow: "Founding journey · Volta Region",
    tagline: "Two days of waterfalls, highland air, and local connection.",
    description:
      "Start with a personally confirmed two-day Volta journey from Accra. Tell us your dates and group size, and our team will coordinate the route, stay, transport, and local experiences into one clear quotation.",
    region: "Volta Region, Ghana",
    duration: "2 days · 1 night",
    priceFrom: 100,
    currency: "USD",
    priceNote:
      "Indicative group price per traveler. Your final quotation will reflect group size, dates, accommodation, and confirmed availability.",
    groupType: "Shared groups & private requests",
    image: "/images/experiences/wli-waterfalls.jpg",
    imageAlt: "Wli Waterfalls surrounded by forest in Ghana's Volta Region",
    highlights: [
      "A thoughtfully paced waterfall and highlands route",
      "Transport coordination from Accra",
      "One overnight stay selected for the confirmed itinerary",
      "Local guidance and TransVista trip support",
    ],
    included: [
      "Round-trip road transport from the confirmed Accra meeting point",
      "One night of accommodation",
      "Local guide coordination",
      "Confirmed attraction entry fees listed in your quotation",
      "TransVista support before and during the journey",
    ],
    notIncluded: [
      "Flights to or within Ghana",
      "Meals or activities not listed in the final quotation",
      "Personal purchases and travel insurance",
      "Changes requested after the itinerary is confirmed",
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Accra to the Volta highlands",
        description:
          "Meet your confirmed transport in Accra and travel into the Volta Region. The final route will pair a locally guided nature or community stop with an unhurried highlands evening and overnight stay.",
      },
      {
        day: "Day 2",
        title: "Waterfall morning and return",
        description:
          "Begin with the journey's main waterfall experience, then make a confirmed stop along the return route before arriving back in Accra. Exact attractions and timings are finalized with your quotation.",
      },
    ],
  },
];

export function getTripPackageBySlug(slug: string) {
  return tripPackages.find((tripPackage) => tripPackage.slug === slug);
}

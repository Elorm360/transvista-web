export interface ExperienceCategory {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
}

export interface ExploreByExperienceCta {
  title: string;
  description: string;
  action: string;
}

export interface ExploreByExperienceContent {
  badge: string;
  title: string;
  description: string;
  categories: ExperienceCategory[];
  cta: ExploreByExperienceCta;
}

export const exploreByExperienceContent = {
  badge: "Explore Ghana",

  title: "Find the journey that matches your travel style.",

  description:
    "Whether you're drawn to culture, nature, beaches, food, or adventure, discover experiences designed around how you want to explore Ghana.",

  categories: [
    {
      id: "culture",
      slug: "culture-heritage",
      title: "Culture & Heritage",
      subtitle: "Historic landmarks and traditions",
    },
    {
      id: "nature",
      slug: "nature-escapes",
      title: "Nature & Adventure",
      subtitle: "Waterfalls, mountains and hiking",
    },
    {
      id: "wildlife",
      slug: "wildlife-safaris",
      title: "Wildlife Safaris",
      subtitle: "National parks and conservation",
    },
    {
      id: "beaches",
      slug: "beaches-coastline",
      title: "Beaches & Coastline",
      subtitle: "Relax along Ghana's coast",
    },
    {
      id: "food",
      slug: "food-local-life",
      title: "Food & Local Life",
      subtitle: "Taste authentic Ghana",
    },
    {
      id: "city",
      slug: "city-experiences",
      title: "City Experiences",
      subtitle: "Explore vibrant urban life",
    },
  ],

  cta: {
    title: "Not sure where to begin?",
    description:
      "We'll help you discover the perfect experience when TransVista launches.",
    action: "Join the Waitlist",
  },
} as const;


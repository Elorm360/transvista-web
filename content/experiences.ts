export interface Experience {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  image: string;
}

export interface ExperiencesContent {
  badge: string;
  title: string;
  description: string;
  items: Experience[];
}

export const experiencesContent = {
  badge: "Featured Experiences",

  title: "Discover journeys worth remembering.",

  description:
    "From rich cultural landmarks to breathtaking natural wonders, explore experiences that showcase the beauty and diversity of Ghana.",

  items: [
    {
      id: "cape-coast",
      slug: "cape-coast-heritage",
      title: "Cape Coast Heritage",
      category: "History & Culture",
      location: "Central Region",
      image: "/images/experiences/cape-coast-heritage.jpg",
    },
    {
      id: "mole",
      slug: "mole-national-park",
      title: "Mole National Park",
      category: "Wildlife",
      location: "Savannah Region",
      image: "/images/experiences/mole-national-park.jpg",
    },
    {
      id: "wli",
      slug: "wli-waterfalls",
      title: "Wli Waterfalls",
      category: "Nature",
      location: "Volta Region",
      image: "/images/experiences/wli-waterfalls.jpg",
    },
  ],
} as const;


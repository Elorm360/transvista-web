export type Destination = {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  image: string;
  category: string;
  featured: boolean;
};

export const destinations: Destination[] = [
  {
    id: "accra",
    name: "Accra",
    slug: "accra",
    region: "Greater Accra",
    description:
      "Discover Ghana's vibrant capital, from coastal escapes and historic landmarks to food, culture, and city life.",
    image: "/images/destinations/accra.jpg",
    category: "City & Culture",
    featured: true,
  },
  {
    id: "cape-coast",
    name: "Cape Coast",
    slug: "cape-coast",
    region: "Central Region",
    description:
      "Explore Ghana's historic coastline, heritage sites, beaches, and unforgettable cultural experiences.",
    image: "/images/destinations/cape-coast.jpg",
    category: "History & Culture",
    featured: true,
  },
  {
    id: "kumasi",
    name: "Kumasi",
    slug: "kumasi",
    region: "Ashanti Region",
    description:
      "Experience the heart of Ashanti culture through traditional craftsmanship, markets, history, and local life.",
    image: "/images/destinations/kumasi.jpg",
    category: "Culture & Heritage",
    featured: true,
  },
  {
    id: "volta-region",
    name: "Volta Region",
    slug: "volta-region",
    region: "Volta Region",
    description:
      "Journey through mountains, waterfalls, forests, and peaceful communities in one of Ghana's most scenic regions.",
    image: "/images/destinations/volta-region.jpg",
    category: "Nature & Adventure",
    featured: true,
  },
];

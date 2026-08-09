export type Experience = {
  id: string;
  name: string;
  slug: string;
  destinationId: string;
  category: string;
  description: string;
  image: string;
  featured: boolean;
};

export const experiences: Experience[] = [
  {
    id: "accra-city-culture",
    name: "Accra City & Culture",
    slug: "accra-city-culture",
    destinationId: "accra",
    category: "Culture & City Life",
    description:
      "Discover the energy of Accra through its food, creative spaces, historic landmarks, markets, and coastal atmosphere.",
    image: "/images/experiences/accra-city-culture.jpg",
    featured: true,
  },
  {
    id: "cape-coast-heritage",
    name: "Cape Coast Heritage",
    slug: "cape-coast-heritage",
    destinationId: "cape-coast",
    category: "History & Heritage",
    description:
      "Explore Ghana's coastal heritage and the historic places that tell important stories about the country's past.",
    image: "/images/experiences/cape-coast-heritage.jpg",
    featured: true,
  },
  {
    id: "kumasi-ashanti-culture",
    name: "Ashanti Culture & Craft",
    slug: "kumasi-ashanti-culture",
    destinationId: "kumasi",
    category: "Culture & Heritage",
    description:
      "Experience the traditions, craftsmanship, markets, and cultural heritage of the Ashanti heartland.",
    image: "/images/experiences/kumasi-ashanti-culture.jpg",
    featured: true,
  },
  {
    id: "volta-nature-adventure",
    name: "Volta Nature & Adventure",
    slug: "volta-nature-adventure",
    destinationId: "volta-region",
    category: "Nature & Adventure",
    description:
      "Discover waterfalls, mountains, forests, and outdoor adventures across the scenic Volta Region.",
    image: "/images/experiences/volta-nature-adventure.jpg",
    featured: true,
  },
];

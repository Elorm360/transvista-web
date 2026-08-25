export type Experience = {
  id: string;
  name: string;
  slug: string;
  destinationId: string;
  category: string;
  description: string;
  tagline: string;
  story: string[];
  whatToExpect: string[];
  bestFor: string[];
  image: string | null;
  imageAlt: string;
  photoNote: string;
  featured: boolean;
};

export const experiences: Experience[] = [
  {
    id: "accra-city-culture",
    name: "Accra City & Culture",
    slug: "accra-city-culture",
    destinationId: "accra",
    category: "Culture & City Life",
    featured: true,
    tagline: "Eat, walk, and listen your way through Ghana’s capital.",
    description:
      "Discover Accra through its food, creative spaces, historic landmarks, markets, and coastal atmosphere — a city stay that sets up the rest of Ghana.",
    story: [
      "This experience is for travellers who do not want Accra to be a blur between the airport and the next highway. A well-paced city day can take in Independence Square, Jamestown, a market morning, and an evening built around Ghanaian food rather than a hotel restaurant.",
      "Accra’s creative scene — galleries, music, fashion, and kitchens — is part of why people fall for Ghana before they have left the Greater Accra Region. We will connect those hours with trusted local partners so the city feels hosted, not scavenged from a generic list.",
    ],
    whatToExpect: [
      "A guided look at old Accra and the city’s Atlantic edge",
      "Market and neighbourhood time with room to eat well",
      "An introduction to contemporary Ghanaian culture, not only monuments",
    ],
    bestFor: [
      "First nights in Ghana",
      "Food-led city travellers",
      "Short Accra stays before the coast or the north",
    ],
    image: null,
    imageAlt: "City and culture in Accra, Ghana",
    photoNote: "Original TransVista photography coming soon.",
  },
  {
    id: "cape-coast-heritage",
    name: "Cape Coast Heritage",
    slug: "cape-coast-heritage",
    destinationId: "cape-coast",
    category: "History & Heritage",
    featured: true,
    tagline: "Walk the castles with context, not as a rushed stop.",
    description:
      "Explore Ghana’s coastal heritage and the historic places that tell necessary stories about the country’s past — with time to stay on the Atlantic after.",
    story: [
      "Cape Coast and Elmina ask for a guide who can hold history without turning it into spectacle. This experience is built around a castle visit done properly: time inside, time to be quiet, and a clear explanation of what you are seeing.",
      "The rest of the day can stay coastal — harbour, university town, a meal facing the water — so the visit is a full chapter, not an isolated ticket. Kakum is close enough to add on another morning.",
    ],
    whatToExpect: [
      "A guided visit to Cape Coast Castle and, where it fits, Elmina",
      "Time to sit with the history rather than hurry the corridor",
      "A coastal stay that can connect to Kakum the next day",
    ],
    bestFor: [
      "Travellers coming to Ghana for history and meaning",
      "Thoughtful first visits to the Central Region",
      "Itineraries that pair heritage with rainforest",
    ],
    image: "/images/experiences/cape-coast-heritage.jpg",
    imageAlt: "Cape Coast heritage experience, Ghana",
    photoNote:
      "Illustrative photo. Original TransVista photography is on the way.",
  },
  {
    id: "kumasi-ashanti-culture",
    name: "Ashanti Culture & Craft",
    slug: "kumasi-ashanti-culture",
    destinationId: "kumasi",
    category: "Culture & Heritage",
    featured: true,
    tagline: "Palace, market, and cloth — Ashanti culture in the city that holds it.",
    description:
      "Experience the traditions, craftsmanship, markets, and cultural heritage of the Ashanti heartland around Kumasi.",
    story: [
      "Ashanti culture is not a museum label. In Kumasi it is a living court, a market economy, and a craft practice you can still watch. This experience brings those pieces into one stay: Manhyia, the market, and a weaving or adinkra visit with someone who belongs to the work.",
      "Go with a local guide. Kejetia is easier — and more generous — when you are not inventing the route yourself. The same is true of craft villages, where a good introduction matters more than a souvenir stop.",
    ],
    whatToExpect: [
      "Manhyia Palace Museum and royal context",
      "A guided market walk",
      "Kente or adinkra craft with time to watch, not only to buy",
    ],
    bestFor: [
      "Culture and design travellers",
      "Visitors who want inland Ghana, not only the beach",
      "Anyone building a route through the Ashanti Region",
    ],
    image: null,
    imageAlt: "Ashanti culture and craft in Kumasi, Ghana",
    photoNote: "Original TransVista photography coming soon.",
  },
  {
    id: "volta-nature-adventure",
    name: "Volta Nature & Adventure",
    slug: "volta-nature-adventure",
    destinationId: "volta-region",
    category: "Nature & Adventure",
    featured: true,
    tagline: "Waterfalls and highland trails east of Accra.",
    description:
      "Discover waterfalls, mountains, forests, and outdoor days across the Volta Region — with Wli Falls as the centrepiece.",
    story: [
      "A Volta nature trip should feel like leaving the capital’s heat for hills and water. The walk to Wli Falls is the signature: forest path, sound of water, then the drop of Ghana’s highest waterfall. Add Mount Afadja if you want a climb, or Tafi Atome if you want a gentler wildlife morning.",
      "Stay overnight. Doing Wli as a punishing day trip from Accra is possible and rarely pleasant. Two nights in the hills is the version people recommend to friends.",
    ],
    whatToExpect: [
      "The forest walk to Wli Falls",
      "Optional hike up Mount Afadja",
      "Village hospitality and cooler evenings than Accra",
    ],
    bestFor: [
      "Hikers and waterfall travellers",
      "Weekenders who want landscape, not nightlife",
      "Active trips that still fit in a long weekend",
    ],
    image: "/images/experiences/wli-waterfalls.jpg",
    imageAlt: "Wli Waterfalls nature experience, Ghana",
    photoNote:
      "Illustrative photo of Wli Falls. Original TransVista photography is on the way.",
  },
  {
    id: "mole-wildlife-safari",
    name: "Mole Wildlife Safari",
    slug: "mole-wildlife-safari",
    destinationId: "mole",
    category: "Wildlife",
    featured: true,
    tagline: "Elephants, savannah, and Ghana’s classic northern park.",
    description:
      "A safari chapter at Mole National Park — walking and vehicle game viewing in Ghana’s largest wildlife reserve.",
    story: [
      "Mole is the safari most visitors mean when they say they want to see wildlife in Ghana. Mornings start early. Guides work from tracks, water, and patience. Elephants are the hope; antelope, warthogs, and birds are the reliable company.",
      "This experience assumes at least two nights. The road (or the flight-plus-transfer) is part of the trip. We will treat transport and the park stay as one plan so the north does not unravel into a string of separate arrangements.",
    ],
    whatToExpect: [
      "Guided game drives and, where available, walking safaris",
      "Time at watering holes, including views from lodge terraces",
      "A northern landscape that feels far from the coast",
    ],
    bestFor: [
      "Wildlife-focused travellers",
      "Longer Ghana itineraries",
      "People willing to travel for a different Ghana than the beach",
    ],
    image: "/images/experiences/mole-national-park.jpg",
    imageAlt: "Safari experience at Mole National Park, Ghana",
    photoNote:
      "Illustrative photo. Original TransVista photography is on the way.",
  },
  {
    id: "kakum-canopy-walk",
    name: "Kakum Canopy Walk",
    slug: "kakum-canopy-walk",
    destinationId: "kakum",
    category: "Rainforest & Adventure",
    featured: true,
    tagline: "Cross the rainforest on Ghana’s famous canopy walkway.",
    description:
      "A morning in Kakum National Park: canopy bridges above the trees, forest air, and a natural add-on to Cape Coast.",
    story: [
      "The canopy walkway is the headline, and it deserves an early start. Crossing hanging bridges above a living rainforest is the memory most first-time visitors to Ghana take home from the Central Region — especially when it is not done in a crowded midday slot.",
      "Pair it with Cape Coast heritage. The road between park and coast is short. Together they are one of the strongest two-day stories in the country: history by the sea, forest in the morning.",
    ],
    whatToExpect: [
      "The canopy walkway, timed to avoid the busiest hours where possible",
      "Guided forest context, not only the bridges",
      "Easy combination with a Cape Coast stay",
    ],
    bestFor: [
      "First-time visitors",
      "Travellers who want adventure without a northern safari",
      "Cape Coast itineraries that should include the rainforest",
    ],
    image: null,
    imageAlt: "Kakum National Park canopy walk, Ghana",
    photoNote: "Original TransVista photography coming soon.",
  },
];

export function getExperienceBySlug(slug: string) {
  return experiences.find((item) => item.slug === slug);
}

export function getExperiencesByDestination(destinationId: string) {
  return experiences.filter((item) => item.destinationId === destinationId);
}

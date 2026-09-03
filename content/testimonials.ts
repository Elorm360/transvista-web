export type TravellerTestimonial = {
  slug: string;
  name: string;
  location: string;
  trip: string;
  date: string;
  image: string;
  imageAlt: string;
  quote: string;
  shortQuote: string;
  favouriteMoment: string;
  stoodOut: string;
  featured?: boolean;
};

export const travellerTestimonials: TravellerTestimonial[] = [
  {
    slug: "iddrisu-issah",
    name: "Iddrisu Issah",
    location: "Accra, Ghana",
    trip: "Mount Afadzato & Wli Waterfalls",
    date: "October 2025",
    image: "/images/testimonials/iddrisu-issah.webp",
    imageAlt: "Iddrisu Issah during the Volta Region group trip",
    quote:
      "The trip was well organized and the itinerary was on point. Mount Afadzato was full of fun and adventure, while the networking made the experience even more memorable.",
    shortQuote:
      "Mount Afadzato was full of fun and adventure, and the networking made the experience even more memorable.",
    favouriteMoment: "Climbing Mount Afadzato and connecting with fellow travellers.",
    stoodOut: "Strong organization, a well-planned itinerary, adventure and networking.",
    featured: true,
  },
  {
    slug: "ishmael-adam-eghan-abraham",
    name: "Ishmael Adam Eghan Abraham",
    location: "Takoradi, Ghana",
    trip: "Mount Afadzato & Wli Waterfalls",
    date: "October 2025",
    image: "/images/testimonials/ishmael-adam-eghan-abraham.webp",
    imageAlt: "Ishmael Adam Eghan Abraham",
    quote:
      "I loved the vibe on the bus. The food was great, and the driver was welcoming and respectful. It made the entire journey enjoyable.",
    shortQuote:
      "The food was great, and the welcoming driver made the entire journey enjoyable.",
    favouriteMoment: "The lively bus journey and shared group atmosphere.",
    stoodOut: "Great food, a comfortable journey, and a welcoming, respectful driver.",
  },
  {
    slug: "gifty",
    name: "Gifty",
    location: "Accra, Ghana",
    trip: "Mount Afadzato & Wli Waterfalls",
    date: "2025",
    image: "/images/testimonials/gifty.webp",
    imageAlt: "Gifty at Mount Afadzato",
    quote:
      "The trip was sociable and fun, and I really enjoyed the food. It was a great experience connecting with everyone along the way.",
    shortQuote: "It was a great experience connecting with everyone along the way.",
    favouriteMoment: "Connecting and socializing with other travellers.",
    stoodOut: "A fun, sociable atmosphere and enjoyable food.",
  },
  {
    slug: "eymarde",
    name: "Eymarde",
    location: "Benin",
    trip: "Mount Afadzato & Wli Waterfalls",
    date: "2025",
    image: "/images/testimonials/eymarde.webp",
    imageAlt: "Eymarde at Wli Waterfalls",
    quote:
      "The vibes were amazing. The whole atmosphere was lively, fun and welcoming, which made the experience really enjoyable.",
    shortQuote: "The whole atmosphere was lively, fun and welcoming.",
    favouriteMoment: "Enjoying the lively group atmosphere throughout the trip.",
    stoodOut: "The welcoming energy, fun and positive group experience.",
  },
  {
    slug: "bilal",
    name: "Bilal",
    location: "Paga, Ghana",
    trip: "Wli Waterfalls & Mount Afadzato",
    date: "2025",
    image: "/images/testimonials/bilal.webp",
    imageAlt: "Bilal at Wli Waterfalls",
    quote:
      "The food, music and overall atmosphere were amazing. The bus was comfortable, and I really enjoyed the networking opportunities throughout the trip. It was a fun, well-organized and memorable experience.",
    shortQuote: "The bus was comfortable, and the trip was fun, well-organized and memorable.",
    favouriteMoment: "The music, food and opportunities to network with other travellers.",
    stoodOut: "Comfortable transport, strong organization and a memorable atmosphere.",
  },
  {
    slug: "precious",
    name: "Precious",
    location: "Kumasi, Ghana",
    trip: "Boti Falls Resort",
    date: "August 2026",
    image: "/images/testimonials/precious.webp",
    imageAlt: "Precious during the Boti Falls Resort trip",
    quote:
      "My experience at Boti Falls Resort was amazing. I really enjoyed the beautiful scenery, the peaceful atmosphere and the overall experience. It was a great opportunity to relax, explore and create beautiful memories. I would definitely recommend the experience to anyone looking for a fun and refreshing getaway.",
    shortQuote: "It was a great opportunity to relax, explore and create beautiful memories.",
    favouriteMoment: "Relaxing and taking in the beautiful scenery at Boti Falls.",
    stoodOut: "The peaceful setting, refreshing atmosphere and chance to explore.",
    featured: true,
  },
  {
    slug: "munat-ekua-adam-eghan-abraham",
    name: "Munat Ekua Adam Eghan Abraham",
    location: "Takoradi, Ghana",
    trip: "Boti Falls Resort",
    date: "August 2026",
    image: "/images/testimonials/munat-ekua-adam-eghan-abraham.webp",
    imageAlt: "Munat Ekua Adam Eghan Abraham during the Boti Falls Resort trip",
    quote:
      "The networking within the TransVista family was amazing—good food, good vibes and a wonderful driver. The waterfall felt like therapy, and I truly enjoyed every moment.",
    shortQuote: "The waterfall felt like therapy, and I truly enjoyed every moment.",
    favouriteMoment: "Experiencing the waterfall and connecting with the TransVista family.",
    stoodOut: "Excellent networking, good food, good vibes and a wonderful driver.",
  },
  {
    slug: "doku-vicentia-vida",
    name: "Doku Vicentia Vida",
    location: "Accra, Ghana",
    trip: "Boti Falls Resort",
    date: "August 2026",
    image: "/images/testimonials/doku-vicentia-vida.webp",
    imageAlt: "Doku Vicentia Vida during the Boti Falls Resort trip",
    quote:
      "It was my first time joining the TransVista family, and everyone was incredibly friendly. I made new friends and connected with new people.",
    shortQuote: "Everyone was incredibly friendly, and I made new friends along the way.",
    favouriteMoment: "Making new friends and connecting with new people.",
    stoodOut: "The friendliness and welcoming spirit of the TransVista community.",
    featured: true,
  },
];

export const featuredTestimonials = travellerTestimonials.filter((story) => story.featured);

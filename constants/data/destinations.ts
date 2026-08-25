export type Destination = {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  tagline: string;
  story: string[];
  highlights: string[];
  bestFor: string[];
  gettingThere: string;
  image: string | null;
  imageAlt: string;
  photoNote: string;
  category: string;
  featured: boolean;
};

export const destinations: Destination[] = [
  {
    id: "accra",
    name: "Accra",
    slug: "accra",
    region: "Greater Accra",
    category: "City & Culture",
    featured: true,
    tagline: "Ghana’s coastal capital — food, music, and the start of most journeys.",
    description:
      "Discover Ghana’s vibrant capital, from Jamestown and Independence Square to markets, beaches, and a food scene that runs late into the night.",
    story: [
      "Most trips to Ghana begin in Accra. Kotoka International Airport sits in the city, and from here you can reach the coast, the forest, the Ashanti heartland, or the north in a day or two — if the journey is planned well.",
      "The capital rewards people who stay a few nights. Walk Jamestown’s fishing harbour and lighthouse, stand at Independence Square, and spend a morning in Makola Market. Osu, Labone, and Airport Residential mix galleries, music, and kitchens that take Ghanaian cooking seriously: waakye in the morning, jollof and grilled tilapia later, kelewele when the evening opens up.",
      "Accra is also the practical hub of a TransVista trip — the place to land, rest, and connect trusted transport to Cape Coast, Kumasi, the Volta Region, or Mole. We are building the city as a confident first chapter, not a layover you rush through.",
    ],
    highlights: [
      "Jamestown harbour, lighthouse, and old Accra streets",
      "Independence Square and Kwame Nkrumah Mausoleum",
      "Makola Market and Osu street life",
      "Labadi and the city’s Atlantic edge",
      "Food, music, and contemporary Ghanaian art",
    ],
    bestFor: [
      "First-time visitors who need a clear landing place",
      "Food and city-culture travellers",
      "Short stays before a Cape Coast, Volta, or northbound trip",
    ],
    gettingThere:
      "Accra is Ghana’s main international gateway. Most visitors fly into Kotoka, then use a trusted transfer into town. From Accra, Cape Coast is roughly a 2.5–3.5 hour road journey; Kumasi about 4–5 hours; Ho and the Volta highlands a similar half-day by road, depending on traffic.",
    image: null,
    imageAlt: "Accra, Ghana",
    photoNote: "Original TransVista photography coming soon.",
  },
  {
    id: "cape-coast",
    name: "Cape Coast",
    slug: "cape-coast",
    region: "Central Region",
    category: "History & Culture",
    featured: true,
    tagline: "Castles, coastline, and stories Ghana asks you to meet with care.",
    description:
      "Explore Ghana’s historic coastline — Cape Coast and nearby Elmina — where heritage sites, university town energy, and Atlantic beaches sit side by side.",
    story: [
      "Cape Coast is one of the most important places to visit in Ghana, and one of the most demanding. Cape Coast Castle and Elmina Castle are UNESCO World Heritage Sites. They hold the history of the transatlantic slave trade, including the Door of No Return. A visit is not a photo stop. It is a guided encounter with memory, and it should be paced with respect.",
      "Around that history is a living coastal city. The University of Cape Coast gives the town a young pulse. Fishing canoes work the same Atlantic that tourists come to see. Beaches and small restaurants make it possible to stay several nights without treating the castles as the only reason to be here.",
      "Cape Coast also sits close to Kakum National Park. Heritage in the morning and rainforest canopy in the afternoon is a classic Central Region pairing — the kind of connected day TransVista is being built to plan without three separate bookings.",
    ],
    highlights: [
      "Cape Coast Castle and a guided heritage visit",
      "Elmina Castle and the historic fishing harbour",
      "University town streets and coastal walks",
      "Easy pairing with Kakum’s canopy walkway",
      "Atlantic beaches along the Central Region",
    ],
    bestFor: [
      "Travellers who want Ghana’s history told honestly",
      "Culture-first itineraries",
      "Trips that combine heritage with Kakum rainforest",
    ],
    gettingThere:
      "Cape Coast is about 150 km west of Accra — typically 2.5–3.5 hours by road. Elmina is a short drive further along the coast. Many visitors base in Cape Coast for two or three nights and day-trip to Kakum.",
    image: "/images/experiences/cape-coast-heritage.jpg",
    imageAlt: "Cape Coast heritage and coastline, Ghana",
    photoNote:
      "Illustrative photo. Original TransVista photography is on the way.",
  },
  {
    id: "kumasi",
    name: "Kumasi",
    slug: "kumasi",
    region: "Ashanti Region",
    category: "Culture & Heritage",
    featured: true,
    tagline: "The Ashanti heartland — palaces, markets, kente, and living tradition.",
    description:
      "Experience the cultural capital of the Asante: Manhyia Palace, one of West Africa’s great markets, and craft villages where kente and adinkra are still made.",
    story: [
      "Kumasi is the seat of the Asantehene and the cultural centre of the Ashanti Region. If Accra is Ghana’s coastal gateway, Kumasi is where many of the country’s royal, craft, and market traditions are still organised in public view.",
      "Manhyia Palace Museum introduces the Asante kingdom with objects and stories you will not get from a passing look at the city. Kejetia and the Adum streets around it are a lesson in West African trade — dense, loud, and worth a guide who knows how to walk them well. Nearby villages such as Bonwire are known for kente weaving; adinkra symbols appear on cloth, walls, and everyday design.",
      "Give Kumasi time. A rushed afternoon misses the reason to come. Two nights lets you see the palace, the market, and a craft village without treating Ashanti culture as a checklist.",
    ],
    highlights: [
      "Manhyia Palace and the Asante royal story",
      "Kejetia Market and Adum city life",
      "Kente weaving in villages such as Bonwire",
      "Adinkra design and Ashanti craft",
      "A slower, inland counterpoint to coastal Ghana",
    ],
    bestFor: [
      "Culture and craft travellers",
      "Visitors who want the Asante story in context",
      "Overland routes between Accra, the north, and the coast",
    ],
    gettingThere:
      "Kumasi is Ghana’s second city, about 4–5 hours by road from Accra depending on traffic. It is a natural stop between the coast and northern parks such as Mole, and a destination in its own right for anyone travelling for culture rather than beaches.",
    image: null,
    imageAlt: "Kumasi, Ashanti Region, Ghana",
    photoNote: "Original TransVista photography coming soon.",
  },
  {
    id: "volta-region",
    name: "Volta Region",
    slug: "volta-region",
    region: "Volta Region",
    category: "Nature & Adventure",
    featured: true,
    tagline: "Waterfalls, highlands, and some of Ghana’s most welcoming hill country.",
    description:
      "Journey through mountains, waterfalls, forests, and communities in one of Ghana’s most scenic regions — from Wli Falls to Mount Afadja.",
    story: [
      "The Volta Region is where Ghana’s landscape opens into hills. Wli Falls (Agumatsa) is Ghana’s highest waterfall, reached on a forest walk that most visitors remember as clearly as the falls themselves. Further into the Togo Atakora range, Mount Afadja (Afadjato) is one of the country’s best-known climbs — steep, short enough for a determined morning, and wide in the views from the top.",
      "This is also a region of villages and hospitality. Tafi Atome is known for its monkey sanctuary. Lake Volta sits on the western edge of the region’s story, even when your nights are spent around Ho, Wli, or the mountain towns. Ewe communities here have a reputation for warmth that travellers mention as often as the scenery.",
      "Volta trips work best when they are not treated as a single waterfall selfie. A two- or three-night stay lets you walk to Wli, climb Afadja, and still have an evening that is not a long transfer back to Accra.",
    ],
    highlights: [
      "Wli Falls, Ghana’s highest waterfall",
      "Mount Afadja and highland hiking",
      "Tafi Atome Monkey Sanctuary",
      "Forest walks and village stays",
      "A cooler, greener pace than the capital",
    ],
    bestFor: [
      "Hikers and nature travellers",
      "Weekends out of Accra that should feel like a different country",
      "People who want waterfalls without a full northern safari",
    ],
    gettingThere:
      "Ho, the regional capital, is typically 3–4 hours by road from Accra. Wli and the mountain villages sit further east toward the Togo border and need another transfer. Plan the last stretch in daylight; the roads are scenic and slower than the Accra–Cape Coast highway.",
    image: "/images/experiences/wli-waterfalls.jpg",
    imageAlt: "Wli Waterfalls in the Volta Region, Ghana",
    photoNote:
      "Illustrative photo of Wli Falls. Original TransVista photography is on the way.",
  },
  {
    id: "mole",
    name: "Mole National Park",
    slug: "mole-national-park",
    region: "Savannah Region",
    category: "Wildlife & Safari",
    featured: true,
    tagline: "Ghana’s flagship safari — elephants, savannah, and a slower northern clock.",
    description:
      "Ghana’s largest national park: walking and vehicle safaris, elephants at watering holes, and a landscape that feels a world away from the coast.",
    story: [
      "Mole National Park covers about 4,840 square kilometres of savannah woodland in Ghana’s north. It is the country’s best-known place to see elephants, along with antelope, warthogs, and more than 300 bird species. This is not East African big-five marketing. It is a West African park with its own rhythm: heat, dust, watering holes, and guides who know the ground.",
      "Many visitors stay at Mole Motel, which looks over a watering hole where elephants sometimes appear without anyone leaving the terrace. Walking safaris and vehicle drives run with park guides. Nearby Larabanga is home to a historic mud-and-stick mosque — one of the oldest in Ghana — and is a meaningful stop on the same northern road.",
      "The dry season, roughly November to April, is when animals concentrate around water and viewing is usually better. Mole is a commitment: a long road or a domestic flight into the north, then a transfer. That is exactly why a connected plan matters. TransVista’s job is to make that northern chapter feel intended, not improvised.",
    ],
    highlights: [
      "Elephant viewing and savannah game drives",
      "Guided walking safaris with park rangers",
      "Birdlife across Guinea savannah woodland",
      "Larabanga Mosque on the approach",
      "A complete change of pace from Accra and the coast",
    ],
    bestFor: [
      "Wildlife travellers who can give the north enough time",
      "Photographers and birders",
      "Itineraries of a week or more that should reach beyond the coast",
    ],
    gettingThere:
      "Mole is a long day’s road journey from Accra (often 10–12 hours) or a combination of a flight toward Tamale and a road transfer of a few hours. Most visitors stay at least two nights. Do not treat it as a day trip from the capital.",
    image: "/images/experiences/mole-national-park.jpg",
    imageAlt: "Wildlife and savannah at Mole National Park, Ghana",
    photoNote:
      "Illustrative photo. Original TransVista photography is on the way.",
  },
  {
    id: "kakum",
    name: "Kakum National Park",
    slug: "kakum-national-park",
    region: "Central Region",
    category: "Rainforest & Adventure",
    featured: true,
    tagline: "Rainforest canopy, a famous walkway, and the green twin of Cape Coast.",
    description:
      "Walk above a tropical rainforest on Kakum’s canopy walkway — Ghana’s best-known forest experience, an easy pairing with Cape Coast heritage.",
    story: [
      "Kakum National Park protects a tract of tropical rainforest in Ghana’s Central Region. People come for the canopy walkway: a series of hanging bridges roughly 30 to 40 metres above the forest floor, stretching a few hundred metres through the trees. It is one of the most photographed outdoor experiences in the country, and it is still a real walk — not a theme-park queue if you time it well.",
      "Below the walkway, forest trails and guided interpretation matter more than a quick crossing. Kakum is home to forest elephants (rarely seen), monkeys, butterflies, and a dense bird community. Go early. Heat, tour groups, and midday light all change the feeling of the park.",
      "Kakum sits close enough to Cape Coast that heritage and rainforest belong on the same itinerary. TransVista will treat them as one Central Region chapter: castle, forest, road, and a place to sleep, planned as a single journey.",
    ],
    highlights: [
      "Canopy walkway above the rainforest",
      "Guided forest trails and birding",
      "Cooler, wetter landscape than Accra",
      "Natural pairing with Cape Coast and Elmina",
      "A flagship outdoor experience for first-time visitors",
    ],
    bestFor: [
      "First-time visitors who want one unforgettable outdoor morning",
      "Families and travellers who prefer a shorter adventure than Mole",
      "Cape Coast stays that should include the forest, not only the coast",
    ],
    gettingThere:
      "Kakum is about 30–40 minutes by road from Cape Coast, and roughly three to four hours from Accra if you travel straight there. Most people visit as a morning trip from Cape Coast. Arrive at opening time if you want the walkway before it fills.",
    image: null,
    imageAlt: "Kakum National Park rainforest, Ghana",
    photoNote: "Original TransVista photography coming soon.",
  },
];

export function getDestinationBySlug(slug: string) {
  return destinations.find((item) => item.slug === slug);
}

export function getDestinationById(id: string) {
  return destinations.find((item) => item.id === id);
}

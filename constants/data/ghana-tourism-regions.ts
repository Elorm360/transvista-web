export type GhanaTourismRegion = {
  slug: string;
  name: string;
  destinations: readonly string[];
  sourceUrl: string;
};

export const ghanaTourismRegions = [
  {
    slug: "ahafo",
    name: "Ahafo Region",
    destinations: [
      "Mim Buo",
      "Asumura White-necked Rockfowl Conservation",
    ],
    sourceUrl: "https://visitghana.com/ahafo-region/",
  },
  {
    slug: "ashanti",
    name: "Ashanti Region",
    destinations: [
      "Manhyia Palace Museum",
      "Kejetia Market",
      "Lake Bosomtwe",
      "Bonwire Kente Weaving Village",
    ],
    sourceUrl: "https://visitghana.com/ashanti-region/",
  },
  {
    slug: "bono",
    name: "Bono Region",
    destinations: [
      "Nchiraa Waterfalls",
      "Duasidan Monkey Sanctuary",
      "Bui National Park and Bui Dam",
      "Hani Archaeological Site",
    ],
    sourceUrl: "https://visitghana.com/bono-region/",
  },
  {
    slug: "bono-east",
    name: "Bono East Region",
    destinations: [
      "Kintampo Waterfalls",
      "Fuller Falls",
      "Buabeng-Fiema Monkey Sanctuary",
      "Bono Manso Slave Centre",
      "Tano Boase Sacred Grove",
      "Digya National Park",
    ],
    sourceUrl: "https://visitghana.com/bono-east-region/",
  },
  {
    slug: "central",
    name: "Central Region",
    destinations: [
      "Cape Coast Castle",
      "Elmina Castle",
      "Kakum National Park",
      "Assin Manso Ancestral Slave River Site",
    ],
    sourceUrl: "https://visitghana.com/central-region/",
  },
  {
    slug: "eastern",
    name: "Eastern Region",
    destinations: [
      "Boti Falls",
      "Aburi Botanical Gardens",
      "Umbrella Rock",
      "Tetteh Quarshie Cocoa Farm",
      "Lake Volta and Akosombo",
    ],
    sourceUrl: "https://visitghana.com/eastern-region/",
  },
  {
    slug: "greater-accra",
    name: "Greater Accra Region",
    destinations: [
      "Kwame Nkrumah Memorial Park",
      "Independence Square",
      "National Museum of Ghana",
      "National Theatre of Ghana",
      "Ada Foah",
    ],
    sourceUrl: "https://visitghana.com/greater-accra-region/",
  },
  {
    slug: "north-east",
    name: "North East Region",
    destinations: [
      "Gambaga Escarpment",
      "Naa Jeringa Defence Wall",
      "Gingana Mountain and Rock Art",
      "White Volta River Rapids",
    ],
    sourceUrl: "https://northeastghana.com/",
  },
  {
    slug: "northern",
    name: "Northern Region",
    destinations: [
      "Tamale Zoological Garden and Craft Centre",
      "Kukuo Pottery Centre",
      "Gushiegu Local Textile Centre",
      "Greenwich Meridian Point in Yendi",
    ],
    sourceUrl: "https://visitghana.com/northern-region/",
  },
  {
    slug: "oti",
    name: "Oti Region",
    destinations: [
      "Kyabobo National Park",
      "Lake Volta",
      "Breast Mountain",
      "Chaiso Forest Reserve",
      "Shiare Hanging Village",
    ],
    sourceUrl: "https://visitghana.com/oti-region/",
  },
  {
    slug: "savannah",
    name: "Savannah Region",
    destinations: [
      "Mole National Park",
      "Larabanga Mosque and Mystic Stone",
      "Mognori Eco Village",
      "Salaga Slave Wells and Market",
      "Daboya",
      "Kulmasa Crocodile Pond",
    ],
    sourceUrl: "https://visitghana.com/savannah-region/",
  },
  {
    slug: "upper-east",
    name: "Upper East Region",
    destinations: [
      "Paga Crocodile Pond",
      "Tongo-Tenzug Shrine",
      "Sirigu Art and Pottery Village",
    ],
    sourceUrl: "https://visitghana.com/upper-east-region/",
  },
  {
    slug: "upper-west",
    name: "Upper West Region",
    destinations: [
      "Wechiau Hippo Sanctuary",
      "Gwollu Slave Defence Wall",
      "Nakore Ancient Mosque",
      "Wa Naa’s Palace",
      "Gbelle Game Reserve",
    ],
    sourceUrl: "https://visitghana.com/upper-west-region/",
  },
  {
    slug: "volta",
    name: "Volta Region",
    destinations: [
      "Wli Waterfalls",
      "Mount Afadja",
      "Tagbo Falls",
      "Tafi Atome Monkey Sanctuary",
      "Lake Volta",
    ],
    sourceUrl: "https://visitghana.com/volta-region/",
  },
  {
    slug: "western",
    name: "Western Region",
    destinations: [
      "Nzulezu Stilt Village",
      "Fort Metal Cross",
      "Fort Fredericksburg",
      "Fort Apollonia",
      "Cape Three Points",
    ],
    sourceUrl: "https://visitghana.com/western-region/",
  },
  {
    slug: "western-north",
    name: "Western North Region",
    destinations: [
      "Bia National Park",
      "Bonsai Waterfalls",
      "Mystery Hole attraction",
    ],
    sourceUrl: "https://visitghana.com/western-north-region/",
  },
] as const satisfies readonly GhanaTourismRegion[];

const initialDestinationRegion: Record<string, string> = {
  accra: "greater-accra",
  "cape-coast": "central",
  "volta-region": "volta",
};

export function regionSlugForInitialDestination(value: string) {
  return initialDestinationRegion[value] ?? value;
}

export function getGhanaTourismRegion(slug: string) {
  return ghanaTourismRegions.find((region) => region.slug === slug);
}

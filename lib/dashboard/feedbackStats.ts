/** Pure calculations for the event feedback dashboard (no database access). */

export type FeedbackRow = {
  id: string;
  event_slug: string;
  event_title: string;
  booking_reference: string;
  full_name: string;
  email: string;
  overall_rating: number;
  transport_rating: number;
  organisation_rating: number;
  itinerary_rating: number;
  guide_rating: number;
  value_rating: number;
  recommendation_score: number;
  favourite_part: string | null;
  improvement_suggestion: string | null;
  would_travel_again: "yes" | "maybe" | "no";
  next_destination_interest: string | null;
  created_at: string;
};

export const CATEGORIES = [
  { key: "transport_rating", label: "Transport & comfort" },
  { key: "organisation_rating", label: "Organisation & communication" },
  { key: "itinerary_rating", label: "Itinerary & destinations" },
  { key: "guide_rating", label: "Guides & hospitality" },
  { key: "value_rating", label: "Value for money" },
] as const;

const round1 = (n: number) => Math.round(n * 10) / 10;

export function average(rows: FeedbackRow[], key: keyof FeedbackRow): number | null {
  const values = rows.map((r) => Number(r[key])).filter(Number.isFinite);
  return values.length ? round1(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

/** Net Promoter Score: % promoters (9–10) minus % detractors (0–6). Range −100…+100. */
export function nps(rows: FeedbackRow[]) {
  const total = rows.length;
  const promoters = rows.filter((r) => r.recommendation_score >= 9).length;
  const passives = rows.filter((r) => r.recommendation_score >= 7 && r.recommendation_score <= 8).length;
  const detractors = rows.filter((r) => r.recommendation_score <= 6).length;
  const score = total ? Math.round(((promoters - detractors) / total) * 100) : null;
  return { score, promoters, passives, detractors, total };
}

export function npsLabel(score: number | null) {
  if (score === null) return "No responses yet";
  if (score >= 70) return "World-class";
  if (score >= 50) return "Excellent";
  if (score >= 30) return "Good";
  if (score >= 0) return "Needs work";
  return "Critical";
}

export function categoryAverages(rows: FeedbackRow[]) {
  return CATEGORIES.map((c) => ({ ...c, average: average(rows, c.key) }));
}

/** Lowest-scoring category: where improvement will matter most. */
export function weakestCategory(rows: FeedbackRow[]) {
  const scored = categoryAverages(rows).filter((c) => c.average !== null);
  if (!scored.length) return null;
  return scored.reduce((low, c) => (c.average! < low.average! ? c : low));
}

export function travelAgain(rows: FeedbackRow[]) {
  const count = (v: string) => rows.filter((r) => r.would_travel_again === v).length;
  const yes = count("yes");
  return { yes, maybe: count("maybe"), no: count("no"), yesPercent: rows.length ? Math.round((yes / rows.length) * 100) : null };
}

/** Known Ghana destinations, matched in free-text "where next?" answers. */
const DESTINATIONS: Array<[string, RegExp]> = [
  ["Volta Region (Wli, Afadzato, Akosombo)", /volta|wli|afadzato|afadjato|akosombo|amedzofe|tafi|hohoe|ho\b/i],
  ["Kumasi & Ashanti", /kumasi|ashanti|manhyia|lake bosomtwe|bosumtwi/i],
  ["Mole National Park & the North", /mole|tamale|north|larabanga|paga|bolgatanga|wa\b/i],
  ["Cape Coast & Elmina", /cape coast|elmina/i],
  ["Kakum National Park", /kakum/i],
  ["Accra city", /accra|jamestown|labadi|osu/i],
  ["Ada & coastal beaches", /\bada\b|beach|busua|anomabo|kokrobite|axim/i],
  ["Western Region (Nzulezu, Takoradi)", /nzulezu|takoradi|western/i],
  ["Boti Falls & Eastern Region", /boti|koforidua|aburi|eastern/i],
  ["Outside Ghana", /togo|benin|nigeria|côte|cote d|ivory|burkina|abroad|dubai|kenya/i],
];

export function destinationDemand(rows: FeedbackRow[]) {
  const counts = new Map<string, number>();
  const other: string[] = [];
  for (const r of rows) {
    const text = (r.next_destination_interest ?? "").trim();
    if (!text) continue;
    const hits = DESTINATIONS.filter(([, re]) => re.test(text)).map(([name]) => name);
    if (!hits.length) other.push(text);
    for (const h of hits) counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  return { ranked, other };
}

export function needsAttention(r: FeedbackRow) {
  return r.overall_rating <= 3 || r.recommendation_score <= 6 || r.would_travel_again === "no";
}

export function toCsv(rows: FeedbackRow[]) {
  const headers = [
    "Submitted", "Event", "Name", "Email", "Booking reference", "Overall", "Transport", "Organisation",
    "Itinerary", "Guides", "Value", "Recommend (0-10)", "Travel again", "Favourite part", "Improvements", "Next destination",
  ];
  const esc = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) => [
    r.created_at, r.event_title, r.full_name, r.email, r.booking_reference, r.overall_rating, r.transport_rating,
    r.organisation_rating, r.itinerary_rating, r.guide_rating, r.value_rating, r.recommendation_score,
    r.would_travel_again, r.favourite_part, r.improvement_suggestion, r.next_destination_interest,
  ].map(esc).join(","));
  return [headers.join(","), ...lines].join("\r\n");
}
export const heroTrustItems = [
  "Trusted Local Partners",
  "Curated Experiences",
  "Secure Travel Planning",
] as const;

export interface HeroStat {
  /** Numeric stats animate with CountUp; text stats render as static display copy. */
  type: "count" | "text";
  value?: number;
  suffix?: string;
  display?: string;
  label: string;
}

/** Floating stats bar shown beneath the hero headline. */
export const heroStats: HeroStat[] = [
  { type: "count", value: 107, suffix: "+", label: "Travellers" },
  { type: "count", value: 4, suffix: "+", label: "Experiences" },
  { type: "count", value: 132, suffix: "+", label: "Partners" },
  { type: "text", display: "Ghana's #1", label: "Platform" },
];


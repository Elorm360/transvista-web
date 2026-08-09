export interface ImpactStat {
  value: number;
  prefix?: string;
  suffix: string;
  decimals?: number;
  label: string;
}

export const impactContent = {
  badge: "Our Traction",
  title: "Building momentum before we even launch.",
  description:
    "Ghana's tourism sector is one of Africa's fastest-growing markets — and TransVista is building the platform to connect it.",

  stats: [
    { value: 107, suffix: "+", label: "Early Community Members" },
    { value: 4.8, prefix: "US$", suffix: "B", decimals: 1, label: "Ghana Tourism Market Size" },
    { value: 132, suffix: "+", label: "Prospective Partners" },
    { value: 6, suffix: "", label: "Team Members" },
  ] satisfies ImpactStat[],
} as const;

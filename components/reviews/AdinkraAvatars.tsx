import type { ReactNode } from "react";

/**
 * Hand-drawn Adinkra avatars for traveller reviews (TransVista brand colours).
 * Simplified, respectful renderings of traditional Akan symbols.
 */
export const ADINKRA_AVATARS = [
  { id: "nkyinkyim", name: "Nkyinkyim", meaning: "life's journey" },
  { id: "sankofa", name: "Sankofa", meaning: "learn from the past" },
  { id: "nsoromma", name: "Nsoromma", meaning: "a guiding star" },
  { id: "akoma", name: "Akoma", meaning: "the heart · goodwill" },
  { id: "adinkrahene", name: "Adinkrahene", meaning: "greatness" },
  { id: "nkonsonkonson", name: "Nkonsonkonson", meaning: "linked together" },
] as const;

export type AdinkraId = (typeof ADINKRA_AVATARS)[number]["id"];

export function isAdinkraId(value: unknown): value is AdinkraId {
  return ADINKRA_AVATARS.some((a) => a.id === value);
}

const BLUE = "#1A3A9C";
const ORANGE = "#F47B20";
const CREAM = "#FFF4EC";

// Each symbol is drawn in a 100×100 box. `fg` is the symbol colour.
function symbol(id: AdinkraId, fg: string): ReactNode {
  const s = { fill: "none", stroke: fg, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "nkyinkyim": // twisting path of life: bold zigzag
      return (
        <g {...s} strokeWidth={10}>
          <path d="M34 10 L66 26 L34 42 L66 58 L34 74 L66 90" />
        </g>
      );
    case "sankofa": // heart-form Sankofa with inward spirals
      return (
        <g {...s} strokeWidth={6.5}>
          <path d="M50 80 C 34 70, 16 56, 17 38 C 18 24, 32 18, 42 24 C 50 29, 46 41, 38 40 C 31 39, 32 30, 38 31" />
          <path d="M50 80 C 66 70, 84 56, 83 38 C 82 24, 68 18, 58 24 C 50 29, 54 41, 62 40 C 69 39, 68 30, 62 31" />
          <path d="M50 80 C 46 86, 38 86, 37 80" />
          <path d="M50 80 C 54 86, 62 86, 63 80" />
        </g>
      );
    case "nsoromma": // star: child of the heavens
      return (
        <g fill={fg}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d="M50 9 L57 31 L50 38 L43 31 Z" transform={`rotate(${i * 45} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="11" />
        </g>
      );
    case "akoma": // the heart
      return (
        <path
          fill={fg}
          d="M50 82 C 22 64, 13 47, 21 33 C 29 19, 45 21, 50 34 C 55 21, 71 19, 79 33 C 87 47, 78 64, 50 82 Z"
        />
      );
    case "adinkrahene": // chief of the symbols: concentric circles
      return (
        <g>
          <circle cx="50" cy="50" r="35" fill="none" stroke={fg} strokeWidth="7" />
          <circle cx="50" cy="50" r="21" fill="none" stroke={fg} strokeWidth="7" />
          <circle cx="50" cy="50" r="8" fill={fg} />
        </g>
      );
    case "nkonsonkonson": // chain links: unity
      return (
        <g {...s} strokeWidth={7.5}>
          <rect x="8" y="33" width="40" height="34" rx="17" />
          <rect x="30" y="33" width="40" height="34" rx="17" />
          <rect x="52" y="33" width="40" height="34" rx="17" />
        </g>
      );
  }
}

/** Round avatar artwork. Alternates cream/blue backgrounds for variety. */
export function AdinkraAvatar({ id, size = 56, title }: { id: AdinkraId; size?: number; title?: string }) {
  const index = ADINKRA_AVATARS.findIndex((a) => a.id === id);
  const dark = index % 2 === 1;
  const bg = dark ? BLUE : CREAM;
  const fg = dark ? "#FFFFFF" : index % 3 === 0 ? ORANGE : BLUE;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx="50" cy="50" r="50" fill={bg} />
      <g transform="translate(11 11) scale(0.78)">{symbol(id, fg)}</g>
    </svg>
  );
}

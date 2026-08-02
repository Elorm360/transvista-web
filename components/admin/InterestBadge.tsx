import { interests } from "@/constants/data/interests";

// Map each known interest to a Tailwind badge color.
// Uses only existing design-system colors (blue, green, purple, orange, amber, etc.).
const badgeStyles: Record<string, string> = {
  Traveler: "bg-blue-50 text-blue-700 ring-blue-200",
  Partner: "bg-green-50 text-green-700 ring-green-200",
  Investor: "bg-purple-50 text-purple-700 ring-purple-200",
  "Transport Provider": "bg-orange-50 text-orange-700 ring-orange-200",
  "Tour Operator": "bg-amber-50 text-amber-700 ring-amber-200",
  "Tour Guide": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "Hotel / Accommodation": "bg-rose-50 text-rose-700 ring-rose-200",
  "Business Partner": "bg-teal-50 text-teal-700 ring-teal-200",
  "Tourism Organization": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Student: "bg-lime-50 text-lime-700 ring-lime-200",
  Other: "bg-slate-100 text-slate-700 ring-slate-200",
};

interface InterestBadgeProps {
  /** The interest value to display */
  interest: string;
}

/**
 * InterestBadge
 *
 * Displays a community member's interest as a small colored badge.
 * Falls back to a neutral slate badge for unknown interests.
 */
export default function InterestBadge({ interest }: InterestBadgeProps) {
  const styles = badgeStyles[interest] ?? badgeStyles.Other;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {interest}
    </span>
  );
}

// Re-export for consistency — interests are the source of truth for badge labels.
export { interests };

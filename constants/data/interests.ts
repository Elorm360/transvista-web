/**
 * Interest options for the waitlist form.
 *
 * Covers both travellers and industry partners to keep the form
 * inclusive while providing clear segmentation for the team.
 *
 * @example
 * ```tsx
 * import { interests } from "@/constants/data/interests";
 * <select>
 *   {interests.map((i) => <option key={i}>{i}</option>)}
 * </select>
 * ```
 */
export const interests = [
  "Traveler",
  "Tour Operator",
  "Transport Provider",
  "Tour Guide",
  "Hotel / Accommodation",
  "Business Partner",
  "Investor",
  "Tourism Organization",
  "Student",
  "Other",
] as const;

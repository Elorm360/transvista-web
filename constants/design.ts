/**
 * Design Tokens
 *
 * Centralized visual constants for TransVista's premium design system.
 *
 * These tokens replace hardcoded Tailwind class fragments across components.
 * Updating a value here propagates everywhere — no more hunting through dozens of files.
 *
 * @usage
 * ```tsx
 * import { cn } from "@/lib/utils";
 * import { radius } from "@/constants/design";
 *
 * <div className={cn(radius.card)} />
 * ```
 *
 * The values use Tailwind utility class fragments so they compose naturally
 * with other classes via `cn()`.
 */

/* ── Spacing ───────────────────────────────────────────────── */

export const spacing = {
  /** Standard section vertical padding */
  section: "py-14 lg:py-20",

  /** Compact section vertical padding */
  sectionCompact: "py-12 lg:py-16",

  /** Container horizontal padding */
  container: "px-6 lg:px-8",

  /** Large grid gap (cards) */
  gridGap: "gap-6 lg:gap-8",

  /** Medium grid gap */
  gridGapSm: "gap-5",

  /** Section header → content */
  headerToContent: "mt-10 lg:mt-12",

  /** Badge → title */
  badgeToTitle: "mt-3",

  /** Title → description */
  titleToDescription: "mt-4",

  /** Card content padding */
  cardPadding: "p-6",

  /** Inner card text padding */
  cardTextPadding: "pt-5",

  /** Icon → card title */
  iconToTitle: "mt-5",
} as const;

/* ── Border Radius ─────────────────────────────────────────── */

export const radius = {
  /** Cards (experience, category, how-it-works, ecosystem, waitlist panel) */
  card: "rounded-[28px]",

  /** Image / placeholder within a card */
  image: "rounded-[28px]",

  /** Input fields */
  input: "rounded-xl",

  /** Buttons */
  button: "rounded-xl",

  /** Icon containers */
  icon: "rounded-full",
} as const;

/* ── Shadows ────────────────────────────────────────────────── */

export const shadow = {
  /** Resting card shadow */
  rest: "shadow-sm",

  /** Hover card shadow */
  hover: "shadow-xl",

  /** Hero / elevated card shadow */
  elevated: "shadow-2xl",
} as const;

/* ── Motion ────────────────────────────────────────────────── */

export const motion = {
  /** Card/interaction transitions */
  card: "transition-all duration-300 ease-out",

  /** Button transitions */
  button: "transition-all duration-200 ease-out",

  /** Arrow slide micro-interaction */
  arrowSlide: "transition-transform duration-300 ease-out",
} as const;

/* ── Borders ───────────────────────────────────────────────── */

export const border = {
  /** Resting card border */
  rest: "border border-slate-200",

  /** Hover card border */
  hover: "hover:border-slate-300",
} as const;

/* ── Typography ─────────────────────────────────────────────── */

export const typography = {
  /** Badge label */
  badge:
    "text-sm font-semibold uppercase tracking-[0.2em] text-blue-700",

  /** Section title */
  title: "text-4xl lg:text-5xl font-bold leading-tight tracking-tight",

  /** Section description */
  description: "text-lg leading-8 text-slate-600 max-w-2xl",

  /** Heading link / "Explore" / "Discover" */
  link: "text-sm font-medium text-blue-700",
} as const;

/* ── Card Compositions ───────────────────────────────────────── */

/**
 * Standard card composable — combines the common card pattern
 * used across ExperienceCard, CategoryCard, HowItWorksStep, etc.
 */
export const card = [
  radius.card,
  border.rest,
  "bg-white",
  motion.card,
  "hover:-translate-y-1",
  border.hover,
  shadow.hover,
].join(" ");


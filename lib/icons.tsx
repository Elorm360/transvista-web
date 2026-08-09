import {
  BadgeCheck,
  Bus,
  Compass,
  Globe2,
  Hotel,
  MessageCircle,
  Mountain,
  Route,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

/**
 * Centralized icon mapping for feature cards and value propositions.
 *
 * Each key maps to a pre-sized icon component, keeping content files
 * free of React imports while ensuring consistent sizing across the site.
 *
 * @example
 * ```tsx
 * import { featureIcons } from "@/lib/icons";
 * <div>{featureIcons["Bus"]}</div>
 * ```
 */
export const featureIcons = {
  Bus: <Bus className="h-8 w-8" />,
  Compass: <Compass className="h-8 w-8" />,
  Users: <Users className="h-8 w-8" />,
  ShieldCheck: <ShieldCheck className="h-8 w-8" />,
  BadgeCheck: <BadgeCheck className="h-8 w-8" />,
  Globe2: <Globe2 className="h-8 w-8" />,
  MessageCircle: <MessageCircle className="h-8 w-8" />,
} as const;

/** Union type of available feature icon keys */
export type FeatureIconKey = keyof typeof featureIcons;

/**
 * Centralized icon mapping for the "How It Works" steps.
 *
 * Slightly larger than feature icons (h-8 w-8) to sit comfortably
 * inside a 48px soft circular background.
 *
 * @example
 * ```tsx
 * import { stepIcons } from "@/lib/icons";
 * <div>{stepIcons["Compass"]}</div>
 * ```
 */
export const stepIcons = {
  Compass: <Compass className="h-8 w-8" />,
  Route: <Route className="h-8 w-8" />,
  Mountain: <Mountain className="h-8 w-8" />,
} as const;

/** Union type of available step icon keys */
export type StepIconKey = keyof typeof stepIcons;

/**
 * Centralized icon mapping for the Ecosystem section pillars.
 *
 * Sized at h-8 w-8 to sit comfortably inside a soft circular
 * background, supporting the content without competing with it.
 *
 * @example
 * ```tsx
 * import { ecosystemIcons } from "@/lib/icons";
 * <div>{ecosystemIcons["Bus"]}</div>
 * ```
 */
export const ecosystemIcons = {
  Bus: <Bus className="h-8 w-8" />,
  Compass: <Compass className="h-8 w-8" />,
  Hotel: <Hotel className="h-8 w-8" />,
  Store: <Store className="h-8 w-8" />,
} as const;

/** Union type of available ecosystem icon keys */
export type EcosystemIconKey = keyof typeof ecosystemIcons;


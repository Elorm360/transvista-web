import { Bus, Compass, Users } from "lucide-react";

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
  Bus: <Bus className="h-7 w-7" />,
  Compass: <Compass className="h-7 w-7" />,
  Users: <Users className="h-7 w-7" />,
} as const;

/** Union type of available feature icon keys */
export type FeatureIconKey = keyof typeof featureIcons;


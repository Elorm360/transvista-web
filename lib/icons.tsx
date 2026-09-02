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

export const featureIcons = {
  Bus: <Bus className="h-8 w-8" />,
  Compass: <Compass className="h-8 w-8" />,
  Users: <Users className="h-8 w-8" />,
  ShieldCheck: <ShieldCheck className="h-8 w-8" />,
  BadgeCheck: <BadgeCheck className="h-8 w-8" />,
  Globe2: <Globe2 className="h-8 w-8" />,
  MessageCircle: <MessageCircle className="h-8 w-8" />,
} as const;

export type FeatureIconKey = keyof typeof featureIcons;

export const stepIcons = {
  MessageCircle: <MessageCircle className="h-8 w-8" />,
  Compass: <Compass className="h-8 w-8" />,
  Route: <Route className="h-8 w-8" />,
  ShieldCheck: <ShieldCheck className="h-8 w-8" />,
  Mountain: <Mountain className="h-8 w-8" />,
} as const;

export type StepIconKey = keyof typeof stepIcons;

export const ecosystemIcons = {
  Bus: <Bus className="h-8 w-8" />,
  Compass: <Compass className="h-8 w-8" />,
  Hotel: <Hotel className="h-8 w-8" />,
  Store: <Store className="h-8 w-8" />,
} as const;

export type EcosystemIconKey = keyof typeof ecosystemIcons;

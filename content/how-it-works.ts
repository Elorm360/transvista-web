import type { StepIconKey } from "@/lib/icons";

export interface HowItWorksStep {
  title: string;
  description: string;
  icon: StepIconKey;
}

export interface HowItWorksContent {
  badge: string;
  title: string;
  description: string;
  steps: HowItWorksStep[];
}

export const howItWorksContent: HowItWorksContent = {
  badge: "How It Works",

  title: "A clear path from idea to confirmed trip.",

  description:
    "TransVista coordinates your request first, so you receive one clear proposal before any provider introduction.",

  steps: [
    {
      title: "Tell us about your trip",
      description:
        "Share what you know—destination, dates, group, interests, or simply the kind of Ghana experience you want.",
      icon: "MessageCircle",
    },
    {
      title: "We coordinate",
      description:
        "TransVista checks the right routes, stays, experiences, and trusted providers for your request.",
      icon: "Route",
    },
    {
      title: "Receive your proposal",
      description:
        "Within 48 hours, we respond with availability, a recommended plan, and a clear price.",
      icon: "Compass",
    },
    {
      title: "Confirm and prepare",
      description:
        "Pay TransVista the agreed deposit or full amount, then meet the confirmed provider and get ready to travel.",
      icon: "ShieldCheck",
    },
  ],
};

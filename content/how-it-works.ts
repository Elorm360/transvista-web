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

  title: "Travel planning, simplified.",

  description:
    "From discovering destinations to connecting trusted transport, accommodation, and local experiences, TransVista is designed to make every journey easier.",

  steps: [
    {
      title: "Discover",
      description:
        "Browse trusted destinations and curated experiences tailored to your travel interests.",
      icon: "Compass",
    },
    {
      title: "Plan",
      description:
        "Organize transport, accommodation, activities, and local guidance in one connected journey.",
      icon: "Route",
    },
    {
      title: "Explore",
      description:
        "Travel with greater confidence knowing every part of your experience is thoughtfully connected.",
      icon: "Mountain",
    },
  ],
};


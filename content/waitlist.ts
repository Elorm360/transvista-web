export interface WaitlistFormFields {
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  interestLabel: string;
  interestPlaceholder: string;
  intentLabel: string;
  travelerIntent: string;
  partnerIntent: string;
  partnerInterestLabel: string;
  submitLabel: string;
  compactSubmitLabel: string;
  submittingLabel: string;
  privacyNote: string;
}

export interface WaitlistContent {
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  form: WaitlistFormFields;
  success: {
    heading: string;
    body: string;
    travelerBody: string;
    partnerBody: string;
    emailNote: string;
    nextStepsTitle: string;
    nextSteps: string[];
    shareTitle: string;
    shareBody: string;
    shareCta: string;
    copyLinkCta: string;
    copiedCta: string;
    exploreCta: string;
  };
  duplicate: {
    heading: string;
    body: string;
    shareTitle: string;
    shareBody: string;
    shareCta: string;
    copyLinkCta: string;
    copiedCta: string;
    exploreCta: string;
  };
  error: {
    unknown: string;
  };
}

export const waitlistContent: WaitlistContent = {
  badge: "Join the Community",

  title: "Join the TransVista Family",

  description:
    "Be among the first to discover new destinations, receive launch updates, exclusive travel opportunities, and partnership announcements.",

  benefits: [
    "Early access before public launch",
    "Exclusive product updates",
    "Invitations to beta testing",
    "Help shape the platform through feedback",
  ],

  form: {
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Your full name",

    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",

    phoneLabel: "Phone Number (optional)",
    phonePlaceholder: "+233 XX XXX XXXX",

    countryLabel: "Country",
    countryPlaceholder: "Select your country",

    interestLabel: "I am a…",
    interestPlaceholder: "Select your interest",

    intentLabel: "I am joining as",
    travelerIntent: "Traveler",
    partnerIntent: "Partner",
    partnerInterestLabel: "What kind of partner?",

    submitLabel: "Join the TransVista Family",
    compactSubmitLabel: "Join the waitlist",
    submittingLabel: "Joining…",
    privacyNote:
      "We’ll only use your details for TransVista updates. No spam.",
  },

  success: {
    heading: "You’re on the list. Welcome.",
    body: "Thank you for joining the TransVista Family. We’ll email you as we open early access, new Ghana journeys, and partnership news.",
    travelerBody:
      "You’re in as a traveler. We’ll send launch updates, destination stories, and early access to plan Ghana with trusted transport and local partners.",
    partnerBody:
      "You’re in as a partner. We’ll share ecosystem updates and the right moment to join as a transport provider, guide, stay, or tourism business.",
    emailNote:
      "Your welcome email couldn’t be delivered right now, but we’ve saved your details. We’ll reach out soon.",
    nextStepsTitle: "What happens next",
    nextSteps: [
      "Check your inbox for a short welcome from TransVista.",
      "We’ll email you when early access and new journeys open.",
      "No spam — only updates about the platform and Ghana travel.",
    ],
    shareTitle: "Know someone exploring Ghana?",
    shareBody: "Share the waitlist with a friend. The more of us on the list, the stronger the launch.",
    shareCta: "Share on WhatsApp",
    copyLinkCta: "Copy link",
    copiedCta: "Link copied",
    exploreCta: "Explore Ghana",
  },

  duplicate: {
    heading: "You’re already on the waitlist",
    body: "This email is already part of the TransVista Family. There’s nothing else you need to do — we’ll keep you posted.",
    shareTitle: "Bring a friend along",
    shareBody: "If someone you know is planning Ghana, send them the waitlist.",
    shareCta: "Share on WhatsApp",
    copyLinkCta: "Copy link",
    copiedCta: "Link copied",
    exploreCta: "Explore Ghana",
  },

  error: {
    unknown:
      "We couldn’t complete your request at the moment. Please try again in a few moments.",
  },
};

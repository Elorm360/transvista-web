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
  submitLabel: string;
  submittingLabel: string;
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
    emailNote: string;
  };
  duplicate: {
    heading: string;
    body: string;
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

    submitLabel: "Join the TransVista Family",
    submittingLabel: "Joining…",
  },

  success: {
    heading: "Welcome to the TransVista Family!",
    body: "Your request has been received successfully.\n\nThank you for becoming one of our earliest community members.\n\nWe'll keep you informed about product launches, exclusive travel experiences, partnership opportunities, and important updates as we build Africa's trusted travel ecosystem.\n\nWe're excited to have you with us, and our team will be in touch soon.",
    emailNote:
      "Your welcome email couldn't be delivered right now, but we've saved your details. We'll reach out soon!",
  },

  duplicate: {
    heading: "You're already on the waitlist!",
    body: "You're already part of the TransVista Community — thank you for joining us! 🎉\n\nIf you'd like to update any details, please use the same email address you originally signed up with so we can match your account. No need to join the waitlist again.",
  },

  error: {
    unknown:
      "We couldn't complete your request at the moment.\n\nPlease try again in a few moments.",
  },
};

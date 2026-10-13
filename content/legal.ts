import type { PolicySection } from "@/content/payment-policy";

// DRAFT — to be reviewed by TransVista's legal adviser before relying on it.
// Reflects how the site actually handles data today (Supabase storage,
// Resend email, Twilio SMS, Vercel hosting, WhatsApp contact).

export const privacyPolicy: {
  effectiveLabel: string;
  introduction: string;
  sections: PolicySection[];
} = {
  effectiveLabel: "Last updated: October 13, 2026",
  introduction:
    "TransVista Africa Ltd (“TransVista”, “we”, “us”) respects your privacy. This policy explains what personal data we collect through transvistaafrica.com and our booking channels, why we collect it, and the choices you have. We process personal data in line with Ghana’s Data Protection Act, 2012 (Act 843).",
  sections: [
    {
      title: "1. Data we collect",
      bullets: [
        "Contact details: full name, email address, phone or WhatsApp number, country or city of residence.",
        "Trip details: destinations, dates, number of travellers, services, interests, budget range, accommodation and transport preferences, and any notes you share.",
        "Group trip registrations: emergency contact name and phone, dietary needs, number of travellers, photo and video consent choices.",
        "Community sign-ups: whether you join as a traveller or partner, and your country.",
        "Payment records: amounts, references and payment status. We do not store card or mobile money PINs.",
        "Messages: emails, SMS and WhatsApp conversations you have with our team.",
      ],
    },
    {
      title: "2. Why we use it",
      bullets: [
        "To review your request, prepare a proposal and coordinate your trip with confirmed providers.",
        "To confirm registrations, request deposits or balances, and send booking, pickup and safety updates.",
        "To contact your emergency contact if something happens during a trip.",
        "To cater for dietary and accessibility needs you tell us about.",
        "To send launch and group-trip updates when you have asked to receive them. You can opt out at any time.",
        "To keep financial records and meet legal obligations.",
      ],
    },
    {
      title: "3. Sensitive information",
      paragraphs: [
        "Dietary, health or accessibility information is optional. We use it only to plan your trip safely, share it only with the providers who need it (for example, a caterer or guide), and delete it with your booking record.",
      ],
    },
    {
      title: "4. Who we share it with",
      paragraphs: [
        "We share only what is needed with confirmed trip providers (transport, accommodation, guides, venues) once your plan is confirmed. We also use trusted service providers that process data on our behalf: Supabase (secure database), Vercel (website hosting), Resend (email delivery), Twilio (SMS) and WhatsApp (messaging). Some of these providers store data outside Ghana under appropriate safeguards. We never sell your personal data.",
      ],
    },
    {
      title: "5. Photos and video",
      paragraphs: [
        "Some group trips include a guided photo and video experience. We only use identifiable images of you in promotional content if you gave optional consent on the registration form. You can withdraw that consent at any time by contacting us; we will stop using the images in new content.",
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies and local storage",
      paragraphs: [
        "The public website does not use advertising or tracking cookies. We use your browser’s local storage to remember small preferences, such as having closed the upcoming-trip announcement. Staff sign-in to the admin area uses essential authentication cookies. If we add analytics in future, we will update this section first.",
      ],
    },
    {
      title: "7. How long we keep it",
      paragraphs: [
        "We keep trip requests and bookings for as long as needed to deliver the service and meet accounting and legal requirements, then delete or anonymise them. Community sign-ups are kept until you unsubscribe or ask us to delete them.",
      ],
    },
    {
      title: "8. Your rights",
      bullets: [
        "Ask for a copy of the personal data we hold about you.",
        "Ask us to correct or delete your data.",
        "Object to or withdraw consent for marketing and promotional use.",
        "Complain to the Data Protection Commission of Ghana if you believe your data has been mishandled.",
      ],
    },
    {
      title: "9. Contact us",
      paragraphs: [
        "Email info@transvistaafrica.com or call/WhatsApp +233 24 844 2916. TransVista Africa Ltd, Accra, Ghana.",
      ],
    },
  ],
};

export const termsOfService: {
  effectiveLabel: string;
  introduction: string;
  sections: PolicySection[];
} = {
  effectiveLabel: "Last updated: October 13, 2026",
  introduction:
    "These terms govern your use of transvistaafrica.com and the trip planning services offered by TransVista Africa Ltd. By using the website or submitting a request, you agree to these terms.",
  sections: [
    {
      title: "1. What TransVista does",
      paragraphs: [
        "TransVista coordinates travel in Ghana: experiences, transport, accommodation and complete itineraries. We review each request, prepare a proposal and, once you confirm and pay, introduce and coordinate the confirmed providers.",
      ],
    },
    {
      title: "2. Requests are not bookings",
      paragraphs: [
        "Submitting a trip request or group-trip registration does not create a confirmed booking. A booking is provisional after the required deposit is received and verified, and confirmed after full payment, as described in our Payment, Booking & Refund Policy.",
      ],
    },
    {
      title: "3. Prices and payments",
      paragraphs: [
        "Prices shown on the website are per person in Ghana cedis unless stated otherwise. Proposal prices are valid for the period stated in the proposal. Payments, deposits, cancellations, refunds and transfers are governed by the Payment, Booking & Refund Policy, which forms part of these terms.",
      ],
    },
    {
      title: "4. Your responsibilities",
      bullets: [
        "Provide accurate contact, traveller and health or dietary information.",
        "Arrive on time for pickups; itineraries may change for traffic, weather, access or safety.",
        "Hold valid travel documents and any insurance you need.",
        "Follow guide and provider safety instructions and respect local communities and heritage sites.",
      ],
    },
    {
      title: "5. Third-party providers",
      paragraphs: [
        "Transport, accommodation, venues and guides are delivered by vetted independent providers. TransVista coordinates and supports your trip but providers remain responsible for their own services. Where a provider fails to deliver, we will work with you on an alternative, credit or refund in line with our policy.",
      ],
    },
    {
      title: "6. Website content",
      paragraphs: [
        "Destination information is provided for inspiration and planning. Some photographs are illustrative placeholders until original TransVista photography is available. All TransVista branding and original content belong to TransVista Africa Ltd.",
      ],
    },
    {
      title: "7. Liability",
      paragraphs: [
        "To the extent permitted by Ghanaian law, TransVista is not liable for indirect losses or events outside our reasonable control, including weather, road conditions, strikes or government action. Nothing in these terms limits liability that cannot be limited by law.",
      ],
    },
    {
      title: "8. Governing law",
      paragraphs: [
        "These terms are governed by the laws of the Republic of Ghana. We will always try to resolve concerns directly first: contact info@transvistaafrica.com or +233 24 844 2916.",
      ],
    },
  ],
};

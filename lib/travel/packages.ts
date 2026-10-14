export const bookingPolicyVersion = "2026-08-07";

export const sharedBookingPolicy = {
  depositRange: "30%–50%",
  standardBalanceWindow: "7–14 days before travel",
  policyHref: "/policies/payment-booking-refunds",
  cancellationBands: [
    {
      window: "7 or more days before travel",
      outcome:
        "Eligible for a full refund, less any non-refundable third-party costs already committed.",
    },
    {
      window: "3–7 days before travel",
      outcome:
        "Eligible for a partial refund of approximately 50%–70%, depending on committed costs.",
    },
    {
      window: "Less than 3 days before travel",
      outcome:
        "Generally non-refundable because major arrangements may already have been committed.",
    },
  ],
} as const;

export const centralRegionPackage = {
  slug: "central-region-heritage-adventure-2026",
  title: "Central Region Heritage & Adventure Day Trip",
  shortTitle: "Central Region Day Trip",
  date: "2026-11-14",
  displayDate: "Saturday, November 14, 2026",
  registrationDeadline: "November 1, 2026",
  registrationDeadlineIso: "2026-11-01",
  departureCity: "Accra",
  pickupLocation: "Accra Mall",
  checkInTime: "5:00 a.m.",
  departureTime: "5:30 a.m.",
  expectedReturnTime: "Approximately 7:00 p.m., subject to traffic",
  pricePerPerson: 400,
  capacity: 35,
  depositPerPerson: 200,
  balancePerPerson: 200,
  balanceDeadline: "November 7, 2026",
  currency: "GHS",
  currencySymbol: "GH₵",
  bookingMode: "Open registration",
  image: "/images/experiences/cape-coast-heritage.jpg",
  imageAlt: "Cape Coast heritage and coastline in Ghana",
  inclusions: [
    "Round-trip transport from Accra Mall",
    "Breakfast, lunch, and snacks",
    "Kakum National Park and canopy experience",
    "Guided visits to Cape Coast Castle and Elmina Castle",
    "Hans Cottage Botel stop",
    "Guided photo-shoot and short-form video experience",
    "TransVista trip coordination",
  ],
  itinerary: [
    {
      title: "Meet at Accra Mall",
      detail: "Check in from 5:00 a.m. for a prompt 5:30 a.m. departure.",
    },
    {
      title: "Kakum National Park",
      detail: "Explore the rainforest and take on the famous canopy walkway.",
    },
    {
      title: "Hans Cottage Botel",
      detail: "Pause for food, nature, photos, and relaxed group moments.",
    },
    {
      title: "Cape Coast Castle",
      detail: "Join a guided heritage visit and engage the history with care.",
    },
    {
      title: "Elmina Castle",
      detail: "Continue the coastal heritage story with a guided visit in Elmina.",
    },
    {
      title: "Return to Accra",
      detail: "Expected arrival around 7:00 p.m.; timing may change with traffic.",
    },
  ],
  packageTerms: [
    "Registration closes November 1, 2026 and may close earlier if operational capacity requires it.",
    "A GH₵200 deposit per traveller is requested only after TransVista confirms the registration.",
    "The remaining GH₵200 per traveller is due by November 7, 2026.",
    "A registration is provisional after the deposit and fully confirmed only after full payment.",
    "Vehicle size—or multiple vehicles—will be arranged according to confirmed paid attendance.",
  ],
} as const;

export type CentralRegionPackage = typeof centralRegionPackage;

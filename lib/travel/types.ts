export type ActionResult = {
  success: boolean;
  reference?: string;
  emailSent?: boolean;
  message?: string;
};

export type TripRequestInput = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  dateFlexibility: string;
  adults: number;
  children: number;
  serviceTypes: string[];
  interests: string[];
  budgetBasis: string;
  budgetRange: string;
  budgetCurrency: string;
  accommodationStyle: string;
  transportDetails: string;
  notes: string;
  acceptedPolicy: boolean;
  website?: string;
};

export type PackageReservationInput = {
  packageSlug: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  participants: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dietaryNeeds: string;
  notes: string;
  mediaNoticeAcknowledged: boolean;
  promotionalMediaConsent: boolean;
  acceptedPolicy: boolean;
  website?: string;
};

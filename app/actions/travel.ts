"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendRequestEmails } from "@/lib/email/sendRequestEmails";
import {
  bookingPolicyVersion,
  centralRegionPackage,
} from "@/lib/travel/packages";
import type {
  ActionResult,
  PackageReservationInput,
  TripRequestInput,
} from "@/lib/travel/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s()-]{6,24}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function clean(value: string, max = 500) {
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function cleanList(values: string[], maxItems = 12) {
  return values.map((value) => clean(value, 80)).filter(Boolean).slice(0, maxItems);
}

function reference(prefix: "TVR" | "TVP") {
  return `${prefix}-${new Date().getUTCFullYear()}-${crypto.randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase()}`;
}

function invalidContact(fullName: string, email: string, phone: string) {
  if (fullName.length < 2 || fullName.length > 120) return true;
  if (!emailPattern.test(email) || email.length > 254) return true;
  if (!phonePattern.test(phone)) return true;
  return false;
}

export async function submitTripRequest(
  input: TripRequestInput,
): Promise<ActionResult> {
  if (input.website) return { success: true };

  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 254).toLowerCase();
  const phone = clean(input.phone, 30);
  const country = clean(input.country, 100);
  const destinations = cleanList(input.destinations);
  const serviceTypes = cleanList(input.serviceTypes);
  const interests = cleanList(input.interests);
  const startDate = clean(input.startDate, 10);
  const endDate = clean(input.endDate, 10);
  const dateFlexibility = clean(input.dateFlexibility, 80);

  if (invalidContact(fullName, email, phone) || !country) {
    return { success: false, message: "Please check your contact details." };
  }
  if (!destinations.length || !serviceTypes.length) {
    return {
      success: false,
      message: "Choose at least one destination and one planning service.",
    };
  }
  if (!input.acceptedPolicy) {
    return {
      success: false,
      message: "Please accept the booking and payment policy.",
    };
  }
  if (startDate && !datePattern.test(startDate)) {
    return { success: false, message: "Please provide a valid start date." };
  }
  if (endDate && (!datePattern.test(endDate) || (startDate && endDate < startDate))) {
    return { success: false, message: "Please check your travel dates." };
  }
  if (!startDate && !dateFlexibility) {
    return {
      success: false,
      message: "Add a travel date or tell us that your dates are flexible.",
    };
  }

  const adults = Math.min(Math.max(Number(input.adults) || 1, 1), 50);
  const children = Math.min(Math.max(Number(input.children) || 0, 0), 50);
  const requestReference = reference("TVR");
  const supabase = createAdminClient();

  const { error } = await supabase.from("trip_requests").insert({
    reference: requestReference,
    full_name: fullName,
    email,
    phone,
    country,
    destinations,
    start_date: startDate || null,
    end_date: endDate || null,
    date_flexibility: dateFlexibility || null,
    adults,
    children,
    service_types: serviceTypes,
    interests,
    budget_basis: clean(input.budgetBasis, 30),
    budget_range: clean(input.budgetRange, 80),
    budget_currency: clean(input.budgetCurrency, 10),
    accommodation_style: clean(input.accommodationStyle, 80) || null,
    transport_details: clean(input.transportDetails, 500) || null,
    notes: clean(input.notes, 1500) || null,
    status: "new",
    policy_version: bookingPolicyVersion,
    accepted_policy: true,
  });

  if (error) {
    console.error("[submitTripRequest] Insert failed:", error);
    return {
      success: false,
      message: "We could not save your request. Please try again.",
    };
  }

  let emailSent = false;
  try {
    emailSent = await sendRequestEmails({
      fullName,
      email,
      reference: requestReference,
      customerTitle: "Your Ghana trip request is with us",
      customerIntro:
        "Thank you for sharing your plans. TransVista will review the destinations, services, dates, and budget you provided.",
      adminTitle: "New custom trip request",
      details: [
        { label: "Destinations", value: destinations.join(", ") },
        { label: "Services", value: serviceTypes.join(", ") },
        {
          label: "Travel dates",
          value: startDate
            ? `${startDate}${endDate ? ` to ${endDate}` : ""}`
            : dateFlexibility,
        },
        { label: "Travellers", value: `${adults} adults, ${children} children` },
        {
          label: "Budget",
          value: `${clean(input.budgetCurrency, 10)} ${clean(input.budgetRange, 80)} (${clean(input.budgetBasis, 30)})`,
        },
      ],
    });
  } catch (emailError) {
    console.error("[submitTripRequest] Email failed:", emailError);
  }

  return {
    success: true,
    reference: requestReference,
    emailSent,
  };
}

export async function submitPackageReservation(
  input: PackageReservationInput,
): Promise<ActionResult> {
  if (input.website) return { success: true };
  if (input.packageSlug !== centralRegionPackage.slug) {
    return { success: false, message: "This package is not available." };
  }

  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 254).toLowerCase();
  const phone = clean(input.phone, 30);
  const city = clean(input.city, 100);
  const emergencyContactName = clean(input.emergencyContactName, 120);
  const emergencyContactPhone = clean(input.emergencyContactPhone, 30);
  const participants = Math.min(Math.max(Number(input.participants) || 1, 1), 20);

  if (
    invalidContact(fullName, email, phone) ||
    !city ||
    emergencyContactName.length < 2 ||
    !phonePattern.test(emergencyContactPhone)
  ) {
    return { success: false, message: "Please check the registration details." };
  }
  if (!input.mediaNoticeAcknowledged || !input.acceptedPolicy) {
    return {
      success: false,
      message: "Please acknowledge the trip notice and booking policy.",
    };
  }

  const requestReference = reference("TVP");
  const supabase = createAdminClient();
  const { error } = await supabase.from("package_reservations").insert({
    reference: requestReference,
    package_slug: centralRegionPackage.slug,
    package_title: centralRegionPackage.title,
    package_date: centralRegionPackage.date,
    full_name: fullName,
    email,
    phone,
    city,
    participants,
    emergency_contact_name: emergencyContactName,
    emergency_contact_phone: emergencyContactPhone,
    dietary_needs: clean(input.dietaryNeeds, 500) || null,
    notes: clean(input.notes, 1000) || null,
    price_per_person: centralRegionPackage.pricePerPerson,
    deposit_per_person: centralRegionPackage.depositPerPerson,
    balance_per_person: centralRegionPackage.balancePerPerson,
    currency: centralRegionPackage.currency,
    registration_status: "received",
    payment_status: "not_requested",
    media_notice_acknowledged: true,
    promotional_media_consent: Boolean(input.promotionalMediaConsent),
    policy_version: bookingPolicyVersion,
    accepted_policy: true,
  });

  if (error) {
    console.error("[submitPackageReservation] Insert failed:", error);
    return {
      success: false,
      message: "We could not save your registration. Please try again.",
    };
  }

  let emailSent = false;
  try {
    emailSent = await sendRequestEmails({
      fullName,
      email,
      reference: requestReference,
      customerTitle: "We received your trip registration",
      customerIntro:
        "Your place is not yet confirmed and no payment is due now. TransVista will review the registration and send official deposit instructions after confirmation.",
      adminTitle: "New Central Region trip registration",
      details: [
        { label: "Trip", value: centralRegionPackage.title },
        { label: "Date", value: centralRegionPackage.displayDate },
        { label: "Participants", value: String(participants) },
        {
          label: "Payment after confirmation",
          value: `${centralRegionPackage.currencySymbol}${centralRegionPackage.depositPerPerson} deposit per person; balance due ${centralRegionPackage.balanceDeadline}`,
        },
        {
          label: "Promotional media consent",
          value: input.promotionalMediaConsent ? "Yes" : "No",
        },
      ],
    });
  } catch (emailError) {
    console.error("[submitPackageReservation] Email failed:", emailError);
  }

  return {
    success: true,
    reference: requestReference,
    emailSent,
  };
}

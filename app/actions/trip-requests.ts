"use server";

import { createClient } from "@/lib/supabase/server";
import { getTripPackageBySlug } from "@/constants/data/packages";

export type TripRequestState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<
    Record<
      | "fullName"
      | "email"
      | "phone"
      | "country"
      | "startDate"
      | "travelers"
      | "budget",
      string
    >
  >;
};

export const initialTripRequestState: TripRequestState = {
  status: "idle",
  message: "",
};

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitTripRequest(
  _previousState: TripRequestState,
  formData: FormData,
): Promise<TripRequestState> {
  const packageSlug = textValue(formData, "packageSlug");
  const tripPackage = getTripPackageBySlug(packageSlug);
  const fullName = textValue(formData, "fullName");
  const email = textValue(formData, "email").toLowerCase();
  const phone = textValue(formData, "phone");
  const country = textValue(formData, "country");
  const startDate = textValue(formData, "startDate");
  const travelersRaw = textValue(formData, "travelers");
  const budget = textValue(formData, "budget");
  const notes = textValue(formData, "notes");
  const website = textValue(formData, "website");
  const travelers = Number(travelersRaw);

  // Quietly accept bot-filled honeypot submissions without persisting them.
  if (website) {
    return { status: "success", message: "Request received." };
  }

  if (!tripPackage) {
    return {
      status: "error",
      message: "This journey is not available for requests right now.",
    };
  }

  const errors: NonNullable<TripRequestState["errors"]> = {};

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "Enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.email = "Enter a valid email address.";
  }
  if (phone.length < 7 || phone.length > 40) {
    errors.phone = "Enter a phone or WhatsApp number.";
  }
  if (!country || country.length > 80) {
    errors.country = "Select your country of residence.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    errors.startDate = "Choose your preferred start date.";
  } else {
    const requestedDate = new Date(`${startDate}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (requestedDate < today) {
      errors.startDate = "Choose a future start date.";
    }
  }
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 40) {
    errors.travelers = "Enter between 1 and 40 travelers.";
  }
  if (!budget) {
    errors.budget = "Select an approximate budget.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Review the highlighted details and try again.",
      errors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("trip_requests").insert({
    package_slug: tripPackage.slug,
    package_name: tripPackage.name,
    full_name: fullName,
    email,
    phone,
    country,
    preferred_start_date: startDate,
    traveler_count: travelers,
    budget_range: budget,
    notes: notes.slice(0, 2000) || null,
    status: "new",
  });

  if (error) {
    console.error("[submitTripRequest] Insert failed:", {
      code: error.code,
      message: error.message,
    });
    return {
      status: "error",
      message:
        "We could not save your request just now. Please try again or contact us on WhatsApp.",
    };
  }

  return {
    status: "success",
    message: "Your request has been received.",
  };
}

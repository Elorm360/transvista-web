"use server";

import { revalidatePath } from "next/cache";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createClient } from "@/lib/supabase/server";

export type TravelEventActionState = { success: boolean; message: string };

const STATUSES = ["draft", "published", "registration_closed", "completed", "cancelled"] as const;
const CURRENCIES = ["GHS", "USD", "EUR", "GBP"] as const;

function field(form: FormData, name: string, max = 5000) {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function parseEvent(form: FormData) {
  const title = field(form, "title", 160);
  const region = field(form, "region", 100);
  const summary = field(form, "summary", 500);
  const description = field(form, "description", 5000);
  const startDate = field(form, "startDate", 10);
  const endDate = field(form, "endDate", 10);
  const registrationDeadline = field(form, "registrationDeadline", 10);
  const priceText = field(form, "priceAmount", 20);
  const priceAmount = Number(priceText);
  const currency = field(form, "currency", 3);
  const capacityText = field(form, "capacity", 8);
  const capacity = capacityText ? Number(capacityText) : null;
  const pickupLocation = field(form, "pickupLocation", 240);
  const imagePath = field(form, "imagePath", 500);
  const imageAlt = field(form, "imageAlt", 240);
  const status = field(form, "status", 30);
  const featured = field(form, "featured", 5) === "true";
  const inclusions = field(form, "inclusions", 4000).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 20);
  const itinerary = field(form, "itinerary", 6000).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 20).map((line) => {
    const [stop, ...detail] = line.split("|");
    return { title: stop.trim().slice(0, 160), detail: detail.join("|").trim().slice(0, 500) };
  });

  if (title.length < 3 || region.length < 2 || summary.length < 20) {
    throw new Error("Enter an event title, region and a summary of at least 20 characters.");
  }
  if (!validDate(startDate) || (endDate && !validDate(endDate)) || (registrationDeadline && !validDate(registrationDeadline))) {
    throw new Error("Enter valid event dates.");
  }
  if (endDate && endDate < startDate) throw new Error("The end date cannot be earlier than the start date.");
  if (registrationDeadline && registrationDeadline > startDate) throw new Error("The registration deadline must be on or before the event start date.");
  if (!priceText || !Number.isFinite(priceAmount) || priceAmount < 0 || priceAmount > 10000000) throw new Error("Enter a valid event price.");
  if (!(CURRENCIES as readonly string[]).includes(currency)) throw new Error("Choose a supported currency.");
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)) throw new Error("Enter a valid capacity or leave it blank.");
  if (!(STATUSES as readonly string[]).includes(status)) throw new Error("Choose a valid event status.");
  if (imagePath && (!imagePath.startsWith("/images/") || imagePath.includes(".."))) throw new Error("Use an approved image path inside /images/.");
  if (itinerary.some((stop) => !stop.title)) throw new Error("Each itinerary line needs a stop title.");

  return {
    title, region, summary, description: description || null,
    start_date: startDate, end_date: endDate || null,
    registration_deadline: registrationDeadline || null,
    price_amount: priceAmount, currency, capacity,
    pickup_location: pickupLocation || null,
    image_path: imagePath || null, image_alt: imageAlt || null,
    inclusions, itinerary, status, featured,
  };
}

function refreshEventPaths() {
  revalidatePath("/admin/events");
  revalidatePath("/trips");
  revalidatePath("/past-events");
  revalidatePath("/");
}

export async function createTravelEvent(
  _previous: TravelEventActionState,
  form: FormData,
): Promise<TravelEventActionState> {
  await requireAdminArea("events");
  try {
    if (process.env.VERCEL_ENV === "preview") {
      return { success: false, message: "This preview is read-only because it shares live TransVista data." };
    }
    const values = parseEvent(form);
    const slug = slugify(field(form, "slug", 120) || values.title);
    if (slug.length < 3) return { success: false, message: "Enter a valid event URL slug." };
    const supabase = await createClient();
    const { error } = await supabase.from("travel_events").insert({
      ...values, slug,
      published_at: ["published", "registration_closed"].includes(values.status) ? new Date().toISOString() : null,
    });
    if (error?.code === "23505") return { success: false, message: "That event URL is already in use. Choose a different slug." };
    if (error) {
      console.error("[createTravelEvent]", error);
      return { success: false, message: "The event could not be saved. Please try again." };
    }
    refreshEventPaths();
    return { success: true, message: "Event created successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "The event could not be created." };
  }
}

export async function updateTravelEvent(
  _previous: TravelEventActionState,
  form: FormData,
): Promise<TravelEventActionState> {
  await requireAdminArea("events");
  try {
    if (process.env.VERCEL_ENV === "preview") {
      return { success: false, message: "This preview is read-only because it shares live TransVista data." };
    }
    const id = field(form, "eventId", 40);
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { success: false, message: "The event could not be identified." };
    const values = parseEvent(form);
    const supabase = await createClient();
    const { data: current, error: readError } = await supabase.from("travel_events").select("published_at").eq("id", id).maybeSingle();
    if (readError || !current) return { success: false, message: "This event could not be found. Refresh the page and try again." };
    const { error } = await supabase.from("travel_events").update({
      ...values,
      published_at: current.published_at ?? (["published", "registration_closed"].includes(values.status) ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      console.error("[updateTravelEvent]", error);
      return { success: false, message: "The event could not be updated. Please try again." };
    }
    refreshEventPaths();
    return { success: true, message: "Event updated successfully." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "The event could not be updated." };
  }
}

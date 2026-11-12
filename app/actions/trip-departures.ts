"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TripDepartureActionState = {
  success: boolean;
  message: string;
  completedAt?: string;
};

const CHECKLIST = [
  { key: "itinerary_confirmed", label: "Itinerary and inclusions confirmed" },
  { key: "transport_confirmed", label: "Transport provider and vehicle confirmed" },
  { key: "driver_vetted", label: "Driver identity and documents checked" },
  { key: "manifest_reviewed", label: "Traveller manifest reviewed" },
  { key: "payments_reviewed", label: "Booking and payment status reviewed" },
  { key: "pickup_instructions_ready", label: "Meeting point and pickup instructions ready" },
  { key: "emergency_support_ready", label: "Emergency and support contacts ready" },
  { key: "team_briefing_complete", label: "Operations team briefing complete" },
];

function value(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function dateTime(input: string) {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) throw new Error("Enter a valid date and time.");
  return parsed.toISOString();
}

async function getOperationsMember() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, member: null, message: "Your session has expired. Please sign in again." };

  const { data: member, error } = await supabase
    .from("admin_team_members")
    .select("id, role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !member || member.status !== "active" || !["owner", "admin", "support"].includes(member.role)) {
    return { supabase, member: null, message: "You do not have permission to manage trip departures." };
  }
  return { supabase, member, message: "" };
}

export async function createTripDeparture(
  _previousState: TripDepartureActionState,
  formData: FormData,
): Promise<TripDepartureActionState> {
  try {
    const title = value(formData, "title", 160);
    const departureDate = value(formData, "departureDate", 10);
    const bookingKeys = JSON.parse(value(formData, "bookingKeys", 5000)) as string[];

    if (title.length < 2 || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
      return { success: false, message: "Enter a departure name and a valid departure date." };
    }
    if (!Array.isArray(bookingKeys) || bookingKeys.length < 1 || bookingKeys.length > 100) {
      return { success: false, message: "Select at least one eligible booking." };
    }

    const parsedBookings = bookingKeys.map((key) => {
      const match = /^(custom|package)-(\d+)$/.exec(key);
      if (!match) throw new Error("One of the selected bookings is invalid.");
      return { request_kind: match[1], request_id: Number(match[2]) };
    });
    if (new Set(parsedBookings.map((booking) => booking.request_kind + "-" + booking.request_id)).size !== parsedBookings.length) {
      return { success: false, message: "The selected booking list contains duplicates." };
    }

    const { supabase, member, message } = await getOperationsMember();
    if (!member) return { success: false, message };

    for (const booking of parsedBookings) {
      const table = booking.request_kind === "custom" ? "trip_requests" : "package_reservations";
      const { data, error } = await supabase.from(table)
        .select("id, status, archived_at")
        .eq("id", booking.request_id)
        .maybeSingle();
      const allowed = booking.request_kind === "custom"
        ? ["confirmed", "in-progress"]
        : ["confirmed-awaiting-deposit", "deposit-paid", "paid", "in-progress"];
      if (error || !data || data.archived_at || !allowed.includes(data.status)) {
        return { success: false, message: "A selected booking is no longer eligible for departure planning. Refresh and try again." };
      }
    }

    const { data: allLinks, error: linksError } = await supabase
      .from("trip_departure_bookings")
      .select("request_kind, request_id");
    if (linksError) return { success: false, message: "Existing departure assignments could not be checked." };

    const linked = new Set((allLinks ?? []).map((link) => link.request_kind + "-" + link.request_id));
    if (parsedBookings.some((booking) => linked.has(booking.request_kind + "-" + booking.request_id))) {
      return { success: false, message: "One or more bookings already belong to a departure. Refresh the page to see the latest assignments." };
    }

    const operationsLeadId = value(formData, "operationsLeadId", 60) || null;
    if (operationsLeadId) {
      const { data: operators, error } = await supabase.rpc("list_request_operators");
      if (error || !(operators ?? []).some((operator: { id: string }) => operator.id === operationsLeadId)) {
        return { success: false, message: "Choose an active operations lead." };
      }
    }

    const { data: departure, error: createError } = await supabase
      .from("trip_departures")
      .insert({
        title,
        departure_date: departureDate,
        operations_lead_id: operationsLeadId,
        created_by: member.id,
        updated_by: member.id,
      })
      .select("id")
      .single();

    if (createError || !departure) {
      console.error("[createTripDeparture] Create failed:", createError);
      return { success: false, message: "The departure could not be created." };
    }

    const { error: bookingInsertError } = await supabase.from("trip_departure_bookings").insert(
      parsedBookings.map((booking) => ({ ...booking, departure_id: departure.id, added_by: member.id })),
    );
    if (bookingInsertError) {
      await supabase.from("trip_departures").delete().eq("id", departure.id);
      console.error("[createTripDeparture] Booking links failed:", bookingInsertError);
      return { success: false, message: "The departure could not be linked to its bookings. No departure was kept." };
    }

    const { error: checklistError } = await supabase.from("trip_departure_checklist_items").insert(
      CHECKLIST.map((item, index) => ({
        departure_id: departure.id,
        item_key: item.key,
        label: item.label,
        position: index + 1,
      })),
    );
    if (checklistError) {
      await supabase.from("trip_departures").delete().eq("id", departure.id);
      console.error("[createTripDeparture] Checklist failed:", checklistError);
      return { success: false, message: "The departure checklist could not be created. No departure was kept." };
    }

    revalidatePath("/admin/trips");
    return { success: true, message: "Departure created and bookings linked.", completedAt: new Date().toISOString() };
  } catch (error) {
    console.error("[createTripDeparture]", error);
    return { success: false, message: error instanceof Error ? error.message : "The departure could not be created." };
  }
}

export async function saveTripDeparture(
  _previousState: TripDepartureActionState,
  formData: FormData,
): Promise<TripDepartureActionState> {
  try {
    const id = value(formData, "departureId", 60);
    const title = value(formData, "title", 160);
    const status = value(formData, "status", 30);
    const scheduledStartAt = dateTime(value(formData, "scheduledStartAt", 40));
    const scheduledEndAt = dateTime(value(formData, "scheduledEndAt", 40));
    const departureDate = value(formData, "departureDate", 10);
    const returnDate = value(formData, "returnDate", 10) || null;
    const meetingPoint = value(formData, "meetingPoint", 500);
    const transportProvider = value(formData, "transportProvider", 160);
    const driverName = value(formData, "driverName", 160);
    const driverPhone = value(formData, "driverPhone", 60);
    const driverVerified = value(formData, "driverVerified", 5) === "true";
    const vehicleType = value(formData, "vehicleType", 120);
    const vehicleRegistration = value(formData, "vehicleRegistration", 60);
    const operationsLeadId = value(formData, "operationsLeadId", 60) || null;
    const operationsNotes = value(formData, "operationsNotes", 3000);

    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
      return { success: false, message: "The departure could not be identified." };
    }
    if (!["planning", "confirmed", "ready", "underway", "completed", "cancelled"].includes(status)) {
      return { success: false, message: "Choose a valid departure status." };
    }
    if (returnDate && returnDate < departureDate) {
      return { success: false, message: "The return date cannot be earlier than the departure date." };
    }
    if (scheduledStartAt && scheduledEndAt && scheduledEndAt < scheduledStartAt) {
      return { success: false, message: "The return time cannot be earlier than the departure time." };
    }
    if (driverVerified && (!driverName || !driverPhone)) {
      return { success: false, message: "Enter the driver's name and phone before marking the details as verified." };
    }

    const { supabase, member, message } = await getOperationsMember();
    if (!member) return { success: false, message };

    if (operationsLeadId) {
      const { data: operators, error } = await supabase.rpc("list_request_operators");
      if (error || !(operators ?? []).some((operator: { id: string }) => operator.id === operationsLeadId)) {
        return { success: false, message: "Choose an active operations lead." };
      }
    }

    if (["ready", "underway"].includes(status)) {
      const { data: items, error } = await supabase
        .from("trip_departure_checklist_items")
        .select("is_complete")
        .eq("departure_id", id);
      if (error || !items || items.length === 0 || items.some((item) => !item.is_complete)) {
        return { success: false, message: "Complete every departure checklist item before marking this departure ready or underway." };
      }
      if (!meetingPoint || !driverVerified || !vehicleType || !vehicleRegistration || !operationsLeadId || !scheduledStartAt) {
        return { success: false, message: "To mark this departure ready, confirm the pickup point, vetted driver, vehicle, operations lead and departure time." };
      }
    }

    const { error: updateError } = await supabase.from("trip_departures").update({
      departure_date: departureDate,
      return_date: returnDate,
      scheduled_start_at: scheduledStartAt,
      scheduled_end_at: scheduledEndAt,
      meeting_point: meetingPoint || null,
      transport_provider: transportProvider || null,
      driver_name: driverName || null,
      driver_phone: driverPhone || null,
      driver_verified: driverVerified,
      vehicle_type: vehicleType || null,
      vehicle_registration: vehicleRegistration || null,
      operations_lead_id: operationsLeadId,
      status,
      operations_notes: operationsNotes || null,
      updated_by: member.id,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (updateError) {
      console.error("[saveTripDeparture] Update failed:", updateError);
      return { success: false, message: "Departure details could not be saved." };
    }

    revalidatePath("/admin/trips");
    return { success: true, message: "Departure details saved.", completedAt: new Date().toISOString() };
  } catch (error) {
    console.error("[saveTripDeparture]", error);
    return { success: false, message: error instanceof Error ? error.message : "Departure details could not be saved." };
  }
}

export async function setTripDepartureChecklistItem(formData: FormData) {
  const id = String(formData.get("departureId") ?? "").trim();
  const itemId = String(formData.get("itemId") ?? "").trim();
  const isComplete = String(formData.get("isComplete") ?? "") === "true";
  if (!id || !itemId) return;

  const { supabase, member } = await getOperationsMember();
  if (!member) return;

  const { error } = await supabase.from("trip_departure_checklist_items").update({
    is_complete: isComplete,
    completed_by: isComplete ? member.id : null,
    completed_at: isComplete ? new Date().toISOString() : null,
  }).eq("id", itemId).eq("departure_id", id);

  if (error) console.error("[setTripDepartureChecklistItem] Update failed:", error);
  revalidatePath("/admin/trips");
}

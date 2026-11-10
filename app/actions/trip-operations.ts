"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TripOperationActionState = {
  success: boolean;
  message: string;
  completedAt?: string;
};

function value(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function optionalDateTime(input: string) {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) throw new Error("Enter a valid trip date and time.");
  return parsed.toISOString();
}

export async function saveTripOperation(
  _previousState: TripOperationActionState,
  formData: FormData,
): Promise<TripOperationActionState> {
  try {
    const requestKind = value(formData, "requestKind", 20);
    const requestId = Number(value(formData, "requestId", 20));
    const operationsLeadId = value(formData, "operationsLeadId", 60) || null;
    const scheduledStartAt = optionalDateTime(value(formData, "scheduledStartAt", 40));
    const scheduledEndAt = optionalDateTime(value(formData, "scheduledEndAt", 40));
    const meetingPoint = value(formData, "meetingPoint");
    const transportProvider = value(formData, "transportProvider");
    const driverName = value(formData, "driverName", 160);
    const driverPhone = value(formData, "driverPhone", 60);
    const vehicleType = value(formData, "vehicleType", 120);
    const vehicleRegistration = value(formData, "vehicleRegistration", 60);
    const operationalStatus = value(formData, "operationalStatus", 30);
    const operationsNotes = value(formData, "operationsNotes", 3000);

    if (!["custom", "package"].includes(requestKind) || !Number.isInteger(requestId) || requestId < 1) {
      return { success: false, message: "This trip booking could not be identified." };
    }
    if (!["planning", "ready", "underway", "completed", "cancelled"].includes(operationalStatus)) {
      return { success: false, message: "Choose a valid trip operations status." };
    }
    if (scheduledStartAt && scheduledEndAt && scheduledEndAt < scheduledStartAt) {
      return { success: false, message: "The return time cannot be earlier than the departure time." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Your session has expired. Please sign in again." };

    const { data: member, error: memberError } = await supabase
      .from("admin_team_members")
      .select("id, role, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError || !member || member.status !== "active" || !["owner", "admin", "support"].includes(member.role)) {
      return { success: false, message: "You do not have permission to manage trip operations." };
    }

    if (operationsLeadId) {
      const { data: operators, error: operatorsError } = await supabase.rpc("list_request_operators");
      if (operatorsError || !(operators ?? []).some((operator: { id: string }) => operator.id === operationsLeadId)) {
        return { success: false, message: "Choose an active operations lead." };
      }
    }

    const table = requestKind === "custom" ? "trip_requests" : "package_reservations";
    const { data: booking, error: bookingError } = await supabase
      .from(table)
      .select("id, reference, status, archived_at")
      .eq("id", requestId)
      .maybeSingle();
    if (bookingError || !booking || booking.archived_at) {
      return { success: false, message: "This booking is no longer available for trip operations." };
    }

    const now = new Date().toISOString();
    const { error: saveError } = await supabase.from("trip_operation_details").upsert({
      request_kind: requestKind,
      request_id: requestId,
      operations_lead_id: operationsLeadId,
      scheduled_start_at: scheduledStartAt,
      scheduled_end_at: scheduledEndAt,
      meeting_point: meetingPoint || null,
      transport_provider: transportProvider || null,
      driver_name: driverName || null,
      driver_phone: driverPhone || null,
      vehicle_type: vehicleType || null,
      vehicle_registration: vehicleRegistration || null,
      operational_status: operationalStatus,
      operations_notes: operationsNotes || null,
      updated_by: member.id,
      updated_at: now,
    }, { onConflict: "request_kind,request_id" });

    if (saveError) {
      console.error("[saveTripOperation] Save failed:", saveError);
      return { success: false, message: "Trip operation details could not be saved." };
    }

    const summary = [
      "Trip operations updated",
      scheduledStartAt ? `Departure: ${new Date(scheduledStartAt).toLocaleString("en-GB", { timeZone: "Africa/Accra" })}` : "Departure time not set",
      scheduledEndAt ? `Return: ${new Date(scheduledEndAt).toLocaleString("en-GB", { timeZone: "Africa/Accra" })}` : "",
      meetingPoint ? `Meeting point: ${meetingPoint}` : "",
      transportProvider ? `Transport provider: ${transportProvider}` : "",
      driverName ? `Driver: ${driverName}` : "",
      vehicleType ? `Vehicle: ${vehicleType}` : "",
      `Operations status: ${operationalStatus.replaceAll("-", " ")}`,
      operationsNotes,
    ].filter(Boolean).join("\n");

    const { error: activityError } = await supabase.from("request_activity").insert({
      request_kind: requestKind,
      request_id: requestId,
      reference: booking.reference,
      activity_type: "trip-operation",
      summary,
      from_status: booking.status,
      to_status: booking.status,
      author_member_id: member.id,
    });
    if (activityError) console.error("[saveTripOperation] Activity log failed:", activityError);

    revalidatePath("/admin/trips");
    revalidatePath("/admin/requests");
    return {
      success: true,
      message: activityError
        ? "Trip operations saved. The activity history could not be updated."
        : "Trip operations saved and added to the booking history.",
      completedAt: now,
    };
  } catch (error) {
    console.error("[saveTripOperation]", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Trip operations could not be saved.",
    };
  }
}

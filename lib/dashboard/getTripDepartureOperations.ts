import "server-only";

import type { TripOperationRecord, TripOperationsOperator } from "@/lib/dashboard/getTripOperations";
import { createClient } from "@/lib/supabase/server";

export type TripDepartureChecklistItem = {
  id: string;
  itemKey: string;
  label: string;
  isComplete: boolean;
  position: number;
};

export type TripDepartureRecord = {
  id: string;
  reference: string;
  title: string;
  departureDate: string;
  returnDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  meetingPoint: string;
  transportProvider: string;
  driverName: string;
  driverPhone: string;
  driverVerified: boolean;
  vehicleType: string;
  vehicleRegistration: string;
  operationsLeadId: string | null;
  operationsLeadName: string | null;
  status: string;
  operationsNotes: string;
  bookings: TripOperationRecord[];
  checklist: TripDepartureChecklistItem[];
};

export type TripDepartureCandidate = {
  key: string;
  title: string;
  departureDate: string;
  returnDate: string;
  bookings: TripOperationRecord[];
  travellers: number;
};

export async function getTripDepartureOperations(
  trips: TripOperationRecord[],
  operators: TripOperationsOperator[],
): Promise<{ departures: TripDepartureRecord[]; candidates: TripDepartureCandidate[] }> {
  const supabase = await createClient();
  const [departuresResult, linksResult, checklistResult] = await Promise.all([
    supabase.from("trip_departures").select("*").order("departure_date", { ascending: true }),
    supabase.from("trip_departure_bookings").select("departure_id, request_kind, request_id"),
    supabase.from("trip_departure_checklist_items").select("*").order("position", { ascending: true }),
  ]);

  if (departuresResult.error) console.error("[getTripDepartureOperations] Departures:", departuresResult.error);
  if (linksResult.error) console.error("[getTripDepartureOperations] Booking links:", linksResult.error);
  if (checklistResult.error) console.error("[getTripDepartureOperations] Checklist:", checklistResult.error);

  const bookingByKey = new Map(trips.map((trip) => [trip.requestKind + "-" + trip.requestId, trip]));
  const operatorNames = new Map(operators.map((operator) => [operator.id, operator.fullName]));
  const linkedKeys = new Set((linksResult.data ?? []).map((link) => link.request_kind + "-" + link.request_id));
  const linksByDeparture = new Map<string, typeof linksResult.data>();
  for (const link of linksResult.data ?? []) {
    const current = linksByDeparture.get(link.departure_id) ?? [];
    current.push(link);
    linksByDeparture.set(link.departure_id, current);
  }
  const checklistByDeparture = new Map<string, TripDepartureChecklistItem[]>();
  for (const item of checklistResult.data ?? []) {
    const current = checklistByDeparture.get(item.departure_id) ?? [];
    current.push({
      id: item.id,
      itemKey: item.item_key,
      label: item.label,
      isComplete: item.is_complete,
      position: item.position,
    });
    checklistByDeparture.set(item.departure_id, current);
  }

  const departures: TripDepartureRecord[] = (departuresResult.data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference,
    title: row.title,
    departureDate: row.departure_date,
    returnDate: row.return_date,
    scheduledStartAt: row.scheduled_start_at,
    scheduledEndAt: row.scheduled_end_at,
    meetingPoint: row.meeting_point ?? "",
    transportProvider: row.transport_provider ?? "",
    driverName: row.driver_name ?? "",
    driverPhone: row.driver_phone ?? "",
    driverVerified: row.driver_verified,
    vehicleType: row.vehicle_type ?? "",
    vehicleRegistration: row.vehicle_registration ?? "",
    operationsLeadId: row.operations_lead_id,
    operationsLeadName: row.operations_lead_id ? operatorNames.get(row.operations_lead_id) ?? null : null,
    status: row.status,
    operationsNotes: row.operations_notes ?? "",
    bookings: (linksByDeparture.get(row.id) ?? [])
      .map((link) => bookingByKey.get(link.request_kind + "-" + link.request_id))
      .filter((booking): booking is TripOperationRecord => Boolean(booking)),
    checklist: checklistByDeparture.get(row.id) ?? [],
  }));

  const candidateGroups = new Map<string, TripOperationRecord[]>();
  for (const trip of trips) {
    const bookingKey = trip.requestKind + "-" + trip.requestId;
    const eligible = trip.requestKind === "custom"
      ? ["confirmed", "in-progress"].includes(trip.bookingStatus)
      : ["confirmed-awaiting-deposit", "deposit-paid", "paid", "in-progress"].includes(trip.bookingStatus);
    if (linkedKeys.has(bookingKey) || !eligible) continue;
    const current = candidateGroups.get(trip.calendarGroupKey) ?? [];
    current.push(trip);
    candidateGroups.set(trip.calendarGroupKey, current);
  }

  const candidates: TripDepartureCandidate[] = Array.from(candidateGroups.entries()).map(([key, bookings]) => ({
    key,
    title: bookings[0].title,
    departureDate: bookings.reduce((date, booking) => booking.tripStart < date ? booking.tripStart : date, bookings[0].tripStart),
    returnDate: bookings.reduce((date, booking) => booking.tripEnd > date ? booking.tripEnd : date, bookings[0].tripEnd),
    bookings,
    travellers: bookings.reduce((sum, booking) => sum + booking.travellers, 0),
  })).sort((a, b) => a.departureDate.localeCompare(b.departureDate));

  return { departures, candidates };
}

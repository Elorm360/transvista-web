import "server-only";
import { createClient } from "@/lib/supabase/server";

export type TripOperationRecord = {
  id: string;
  calendarGroupKey: string;
  requestKind: "custom" | "package";
  requestId: number;
  reference: string;
  title: string;
  travellerName: string;
  email: string;
  phone: string;
  travellers: number;
  bookingStatus: string;
  paymentStatus: string;
  amountPaid: number;
  currency: string;
  tripStart: string;
  tripEnd: string;
  calendarStartDate: string;
  calendarEndDate: string;
  assignedTo: string | null;
  assignedName: string | null;
  meetingPoint: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehiclePreference: string;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  operationsLeadId: string | null;
  operationsLeadName: string | null;
  transportProvider: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehicleRegistration: string;
  operationalStatus: string;
  operationsNotes: string;
};

export type TripOperationsOperator = {
  id: string;
  fullName: string;
  role: string;
};

export async function getTripOperations(): Promise<{
  trips: TripOperationRecord[];
  operators: TripOperationsOperator[];
}> {
  const supabase = await createClient();
  const [customResult, packageResult, operationsResult, operatorsResult] =
    await Promise.all([
      supabase.from("trip_requests").select(
        "id, reference, full_name, email, phone, destinations, adults, children, travel_start, travel_end, status, payment_status, amount_paid, quote_currency, assigned_to, pickup_location, dropoff_location, vehicle_preference, vehicle_recommendation, archived_at",
      ).is("archived_at", null).in("status", ["confirmed", "in-progress", "completed"]).not("travel_start", "is", null),
      supabase.from("package_reservations").select(
        "id, reference, package_slug, package_title, package_date, full_name, email, phone, city, travellers, status, payment_status, amount_paid, currency, assigned_to, archived_at",
      ).is("archived_at", null).in("status", ["confirmed-awaiting-deposit", "deposit-paid", "paid", "in-progress", "completed"]).not("package_date", "is", null),
      supabase.from("trip_operation_details").select("*"),
      supabase.rpc("list_request_operators"),
    ]);

  if (customResult.error) console.error("[getTripOperations] Custom trips:", customResult.error);
  if (packageResult.error) console.error("[getTripOperations] Group trips:", packageResult.error);
  if (operationsResult.error) console.error("[getTripOperations] Operation details:", operationsResult.error);
  if (operatorsResult.error) console.error("[getTripOperations] Operators:", operatorsResult.error);

  const operatorNames = new Map<string, string>(
    (operatorsResult.data ?? []).map((operator: { id: string; full_name: string }) => [
      operator.id,
      operator.full_name,
    ]),
  );
  const operationByBooking = new Map(
    (operationsResult.data ?? []).map((operation) => [
      `${operation.request_kind}-${operation.request_id}`,
      operation,
    ]),
  );

  const custom: TripOperationRecord[] = (customResult.data ?? []).map((row) => {
    const operation = operationByBooking.get(`custom-${row.id}`);
    const start = row.travel_start as string;
    const end = (row.travel_end as string | null) ?? start;
    const calendarStart = operation?.scheduled_start_at
      ? String(operation.scheduled_start_at).slice(0, 10)
      : start;
    const calendarEnd = operation?.scheduled_end_at
      ? String(operation.scheduled_end_at).slice(0, 10)
      : end;
    return {
      id: `custom-${row.id}`,
      calendarGroupKey: `custom-${row.id}`,
      requestKind: "custom",
      requestId: Number(row.id),
      reference: row.reference,
      title: (row.destinations ?? []).join(", ") || "Custom trip",
      travellerName: row.full_name,
      email: row.email,
      phone: row.phone,
      travellers: Number(row.adults) + Number(row.children),
      bookingStatus: row.status,
      paymentStatus: row.payment_status,
      amountPaid: Number(row.amount_paid ?? 0),
      currency: row.quote_currency ?? "GHS",
      tripStart: start,
      tripEnd: end,
      calendarStartDate: calendarStart,
      calendarEndDate: calendarEnd,
      assignedTo: row.assigned_to,
      assignedName: row.assigned_to ? operatorNames.get(row.assigned_to) ?? "Team member" : null,
      meetingPoint: operation?.meeting_point ?? row.pickup_location ?? "",
      pickupLocation: row.pickup_location ?? "",
      dropoffLocation: row.dropoff_location ?? "",
      vehiclePreference: row.vehicle_preference ?? row.vehicle_recommendation ?? "",
      scheduledStartAt: operation?.scheduled_start_at ?? null,
      scheduledEndAt: operation?.scheduled_end_at ?? null,
      operationsLeadId: operation?.operations_lead_id ?? null,
      operationsLeadName: operation?.operations_lead_id ? operatorNames.get(operation.operations_lead_id) ?? null : null,
      transportProvider: operation?.transport_provider ?? "",
      driverName: operation?.driver_name ?? "",
      driverPhone: operation?.driver_phone ?? "",
      vehicleType: operation?.vehicle_type ?? row.vehicle_preference ?? row.vehicle_recommendation ?? "",
      vehicleRegistration: operation?.vehicle_registration ?? "",
      operationalStatus: operation?.operational_status ?? "planning",
      operationsNotes: operation?.operations_notes ?? "",
    };
  });

  const packages: TripOperationRecord[] = (packageResult.data ?? []).map((row) => {
    const operation = operationByBooking.get(`package-${row.id}`);
    const start = row.package_date as string;
    const calendarStart = operation?.scheduled_start_at
      ? String(operation.scheduled_start_at).slice(0, 10)
      : start;
    const calendarEnd = operation?.scheduled_end_at
      ? String(operation.scheduled_end_at).slice(0, 10)
      : start;
    return {
      id: `package-${row.id}`,
      calendarGroupKey: `package-${row.package_slug}-${start}`,
      requestKind: "package",
      requestId: Number(row.id),
      reference: row.reference,
      title: row.package_title,
      travellerName: row.full_name,
      email: row.email,
      phone: row.phone,
      travellers: Number(row.travellers),
      bookingStatus: row.status,
      paymentStatus: row.payment_status,
      amountPaid: Number(row.amount_paid ?? 0),
      currency: row.currency ?? "GHS",
      tripStart: start,
      tripEnd: start,
      calendarStartDate: calendarStart,
      calendarEndDate: calendarEnd,
      assignedTo: row.assigned_to,
      assignedName: row.assigned_to ? operatorNames.get(row.assigned_to) ?? "Team member" : null,
      meetingPoint: operation?.meeting_point ?? row.city ?? "",
      pickupLocation: row.city ?? "",
      dropoffLocation: "",
      vehiclePreference: "",
      scheduledStartAt: operation?.scheduled_start_at ?? null,
      scheduledEndAt: operation?.scheduled_end_at ?? null,
      operationsLeadId: operation?.operations_lead_id ?? null,
      operationsLeadName: operation?.operations_lead_id ? operatorNames.get(operation.operations_lead_id) ?? null : null,
      transportProvider: operation?.transport_provider ?? "",
      driverName: operation?.driver_name ?? "",
      driverPhone: operation?.driver_phone ?? "",
      vehicleType: operation?.vehicle_type ?? "",
      vehicleRegistration: operation?.vehicle_registration ?? "",
      operationalStatus: operation?.operational_status ?? "planning",
      operationsNotes: operation?.operations_notes ?? "",
    };
  });

  const trips = [...custom, ...packages].sort(
    (a, b) => a.calendarStartDate.localeCompare(b.calendarStartDate),
  );
  const operators: TripOperationsOperator[] = (operatorsResult.data ?? []).map(
    (operator: { id: string; full_name: string; role: string }) => ({
      id: operator.id,
      fullName: operator.full_name,
      role: operator.role,
    }),
  );
  return { trips, operators };
}

import "server-only";
import { createClient } from "@/lib/supabase/server";

export type BusinessTrendPoint = { label: string; bookings: number; confirmed: number };
export type BusinessBarPoint = { label: string; value: number };
export type CurrencyPerformance = {
  currency: string;
  bookings: number;
  quoted: number;
  received: number;
  outstanding: number;
  averageBookingValue: number;
};
export type TeamWorkloadPoint = {
  name: string;
  bookings: number;
  confirmedBookings: number;
};
export type PaymentReconciliationRow = {
  currency: string;
  bookingAmountPaid: number;
  paymentEntries: number;
  openingBalances: number;
  adjustments: number;
  verifiedLedgerTotal: number;
  difference: number;
};
export type PaymentMismatch = {
  reference: string;
  currency: string;
  bookingAmountPaid: number;
  verifiedLedgerTotal: number;
  difference: number;
  ledgerEntries: number;
};
export type BusinessIntelligence = {
  rangeLabel: string;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  conversionRate: number;
  cancellationRate: number;
  averageFirstResponseHours: number | null;
  responseCoverage: number;
  trend: BusinessTrendPoint[];
  statuses: BusinessBarPoint[];
  topTrips: BusinessBarPoint[];
  sources: BusinessBarPoint[];
  currencies: CurrencyPerformance[];
  teamWorkload: TeamWorkloadPoint[];
  paymentReconciliation: PaymentReconciliationRow[];
  paymentMismatches: PaymentMismatch[];
  upcomingTrips: number;
  tripsReady: number;
  tripsNeedingPreparation: number;
};

const confirmedStatuses = new Set([
  "confirmed", "confirmed-awaiting-deposit", "deposit-paid", "paid", "in-progress", "completed",
]);

function bucketKey(value: string, monthly: boolean) {
  const date = new Date(value);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  if (monthly) return `${date.getUTCFullYear()}-${month}`;
  return date.toISOString().slice(0, 10);
}

function bucketLabel(key: string, monthly: boolean) {
  const [year, month, day] = key.split("-").map(Number);
  const date = monthly ? new Date(Date.UTC(year, month - 1, 1)) : new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-GB", monthly
    ? { month: "short", year: "2-digit", timeZone: "UTC" }
    : { day: "numeric", month: "short", timeZone: "UTC" });
}

export async function getBusinessIntelligence(days: number | null = 30): Promise<BusinessIntelligence> {
  const supabase = await createClient();
  const cutoff = days ? new Date(Date.now() - days * 86400000).toISOString() : null;

  let customQuery = supabase.from("trip_requests")
    .select("id,status,payment_status,amount_paid,quoted_amount,quote_currency,budget_currency,created_at,travel_start,destinations,assigned_to,archived_at")
    .is("archived_at", null).order("created_at", { ascending: true });
  let packageQuery = supabase.from("package_reservations")
    .select("id,reference,status,payment_status,amount_paid,total_price,currency,created_at,package_date,package_title,assigned_to,archived_at")
    .is("archived_at", null).order("created_at", { ascending: true });
  if (cutoff) {
    customQuery = customQuery.gte("created_at", cutoff);
    packageQuery = packageQuery.gte("created_at", cutoff);
  }

  const [customResult, packageResult, activityResult, operationsResult, operatorsResult] = await Promise.all([
    customQuery,
    packageQuery,
    supabase.from("request_activity").select("request_kind,request_id,activity_type,created_at")
      .in("activity_type", ["status", "follow-up", "note", "update", "assignment", "trip-operation"]),
    supabase.from("trip_operation_details").select("request_kind,request_id,operational_status"),
    supabase.rpc("list_request_operators"),
  ]);

  if (customResult.error) console.error("[BusinessIntelligence] Custom bookings:", customResult.error);
  if (packageResult.error) console.error("[BusinessIntelligence] Group bookings:", packageResult.error);
  if (activityResult.error) console.error("[BusinessIntelligence] Activity history:", activityResult.error);
  if (operationsResult.error) console.error("[BusinessIntelligence] Trip operations:", operationsResult.error);
  if (operatorsResult.error) console.error("[BusinessIntelligence] Team members:", operatorsResult.error);

  const packageRows = packageResult.data ?? [];
  const packageIds = packageRows.map((row) => Number(row.id));
  const ledgerResult = packageIds.length
    ? await supabase.from("package_payment_transactions")
        .select("reservation_id,transaction_type,amount,currency,status")
        .in("reservation_id", packageIds)
        .eq("status", "verified")
    : { data: [], error: null };
  if (ledgerResult.error) console.error("[BusinessIntelligence] Payment ledger:", ledgerResult.error);

  type RecordRow = {
    key: string;
    source: "custom" | "package";
    status: string;
    createdAt: string;
    assignedTo: string | null;
    amountPaid: number;
    currency: string;
    quotedAmount: number | null;
    title: string;
    tripDate: string | null;
  };

  const records: RecordRow[] = [
    ...(customResult.data ?? []).map((row) => ({
      key: `custom-${row.id}`,
      source: "custom" as const,
      status: row.status,
      createdAt: row.created_at,
      assignedTo: row.assigned_to,
      amountPaid: Number(row.amount_paid ?? 0),
      currency: row.quote_currency ?? row.budget_currency ?? "GHS",
      quotedAmount: row.quoted_amount === null ? null : Number(row.quoted_amount),
      title: (row.destinations ?? []).join(", ") || "Custom trip",
      tripDate: row.travel_start,
    })),
    ...packageRows.map((row) => ({
      key: `package-${row.id}`,
      source: "package" as const,
      status: row.status,
      createdAt: row.created_at,
      assignedTo: row.assigned_to,
      amountPaid: Number(row.amount_paid ?? 0),
      currency: row.currency ?? "GHS",
      quotedAmount: row.total_price === null ? null : Number(row.total_price),
      title: row.package_title,
      tripDate: row.package_date,
    })),
  ];

  const ledgerByReservation = new Map<number, { total: number; entries: number }>();
  for (const entry of ledgerResult.data ?? []) {
    const reservationId = Number(entry.reservation_id);
    const current = ledgerByReservation.get(reservationId) ?? { total: 0, entries: 0 };
    const amount = Number(entry.amount);
    current.total += entry.transaction_type === "adjustment" ? -amount : amount;
    current.entries += 1;
    ledgerByReservation.set(reservationId, current);
  }
  const paymentMismatches: PaymentMismatch[] = packageRows.flatMap((row) => {
    const ledger = ledgerByReservation.get(Number(row.id)) ?? { total: 0, entries: 0 };
    const bookingAmountPaid = Number(row.amount_paid ?? 0);
    const difference = ledger.total - bookingAmountPaid;
    return Math.abs(difference) > 0.01 ? [{
      reference: row.reference,
      currency: row.currency ?? "GHS",
      bookingAmountPaid,
      verifiedLedgerTotal: ledger.total,
      difference,
      ledgerEntries: ledger.entries,
    }] : [];
  }).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  const paymentLedgerMap = new Map<string, {
    bookingAmountPaid: number;
    paymentEntries: number;
    openingBalances: number;
    adjustments: number;
    verifiedLedgerTotal: number;
  }>();
  for (const row of packageRows) {
    const currency = row.currency ?? "GHS";
    const current = paymentLedgerMap.get(currency) ?? {
      bookingAmountPaid: 0, paymentEntries: 0, openingBalances: 0, adjustments: 0, verifiedLedgerTotal: 0,
    };
    current.bookingAmountPaid += Number(row.amount_paid ?? 0);
    paymentLedgerMap.set(currency, current);
  }
  for (const entry of ledgerResult.data ?? []) {
    const currency = entry.currency ?? "GHS";
    const current = paymentLedgerMap.get(currency) ?? {
      bookingAmountPaid: 0, paymentEntries: 0, openingBalances: 0, adjustments: 0, verifiedLedgerTotal: 0,
    };
    const amount = Number(entry.amount);
    if (entry.transaction_type === "adjustment") {
      current.adjustments += amount;
      current.verifiedLedgerTotal -= amount;
    } else {
      current.verifiedLedgerTotal += amount;
      if (entry.transaction_type === "payment") current.paymentEntries += amount;
      if (entry.transaction_type === "opening_balance") current.openingBalances += amount;
    }
    paymentLedgerMap.set(currency, current);
  }
  const paymentReconciliation: PaymentReconciliationRow[] = Array.from(paymentLedgerMap.entries())
    .map(([currency, value]) => ({
      currency,
      ...value,
      difference: value.verifiedLedgerTotal - value.bookingAmountPaid,
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  const totalBookings = records.length;
  const confirmedBookings = records.filter((row) => confirmedStatuses.has(row.status)).length;
  const cancelledBookings = records.filter((row) => row.status === "cancelled").length;
  const conversionRate = totalBookings ? (confirmedBookings / totalBookings) * 100 : 0;
  const cancellationRate = totalBookings ? (cancelledBookings / totalBookings) * 100 : 0;

  const currencyMap = new Map<string, { bookings: number; quoted: number; received: number }>();
  for (const row of records) {
    if (row.status === "cancelled" || row.status === "closed") continue;
    const current = currencyMap.get(row.currency) ?? { bookings: 0, quoted: 0, received: 0 };
    current.bookings += 1;
    current.received += row.amountPaid;
    if (row.quotedAmount !== null && row.quotedAmount > 0) current.quoted += row.quotedAmount;
    currencyMap.set(row.currency, current);
  }
  const currencies: CurrencyPerformance[] = Array.from(currencyMap.entries())
    .map(([currency, value]) => ({
      currency,
      bookings: value.bookings,
      quoted: value.quoted,
      received: value.received,
      outstanding: Math.max(value.quoted - value.received, 0),
      averageBookingValue: value.bookings ? value.quoted / value.bookings : 0,
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  const statusMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();
  const tripMap = new Map<string, number>();
  const teamMap = new Map<string, { bookings: number; confirmedBookings: number }>();
  for (const row of records) {
    statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
    const sourceLabel = row.source === "package" ? "Group trips" : "Custom trips";
    sourceMap.set(sourceLabel, (sourceMap.get(sourceLabel) ?? 0) + 1);
    tripMap.set(row.title, (tripMap.get(row.title) ?? 0) + 1);
    const teamKey = row.assignedTo ?? "unassigned";
    const team = teamMap.get(teamKey) ?? { bookings: 0, confirmedBookings: 0 };
    team.bookings += 1;
    if (confirmedStatuses.has(row.status)) team.confirmedBookings += 1;
    teamMap.set(teamKey, team);
  }

  const operatorNames = new Map<string, string>(
    (operatorsResult.data ?? []).map((operator: { id: string; full_name: string }) => [operator.id, operator.full_name]),
  );
  const teamWorkload: TeamWorkloadPoint[] = Array.from(teamMap.entries())
    .map(([id, value]) => ({
      name: id === "unassigned" ? "Unassigned" : operatorNames.get(id) ?? "Former team member",
      ...value,
    }))
    .sort((a, b) => b.bookings - a.bookings || a.name.localeCompare(b.name));

  const activityByBooking = new Map<string, string>();
  for (const activity of activityResult.data ?? []) {
    const key = `${activity.request_kind}-${activity.request_id}`;
    const previous = activityByBooking.get(key);
    if (!previous || activity.created_at < previous) activityByBooking.set(key, activity.created_at);
  }
  const responseHours = records.flatMap((row) => {
    const firstAction = activityByBooking.get(row.key);
    if (!firstAction) return [];
    const hours = (new Date(firstAction).getTime() - new Date(row.createdAt).getTime()) / 3600000;
    return hours >= 0 ? [hours] : [];
  });
  const averageFirstResponseHours = responseHours.length
    ? responseHours.reduce((sum, value) => sum + value, 0) / responseHours.length
    : null;

  const monthly = days === null || (days !== null && days > 90);
  const now = new Date();
  const minCreatedAt = records.map((row) => row.createdAt).sort()[0];
  const minCreated = minCreatedAt ? new Date(minCreatedAt) : now;
  const trendStart = cutoff ? new Date(cutoff) : minCreated;
  if (monthly) trendStart.setUTCDate(1);
  const trendMap = new Map<string, { bookings: number; confirmed: number }>();
  const cursor = new Date(Date.UTC(trendStart.getUTCFullYear(), trendStart.getUTCMonth(), monthly ? 1 : trendStart.getUTCDate()));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  while (cursor <= end) {
    const key = bucketKey(cursor.toISOString(), monthly);
    trendMap.set(key, { bookings: 0, confirmed: 0 });
    if (monthly) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    else cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  for (const row of records) {
    const key = bucketKey(row.createdAt, monthly);
    const point = trendMap.get(key);
    if (point) {
      point.bookings += 1;
      if (confirmedStatuses.has(row.status)) point.confirmed += 1;
    }
  }
  const trend = Array.from(trendMap.entries()).map(([key, value]) => ({
    label: bucketLabel(key, monthly),
    ...value,
  }));

  const statuses: BusinessBarPoint[] = Array.from(statusMap.entries())
    .map(([label, value]) => ({ label: label.replaceAll("-", " "), value }))
    .sort((a, b) => b.value - a.value);
  const topTrips: BusinessBarPoint[] = Array.from(tripMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const sources: BusinessBarPoint[] = Array.from(sourceMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const today = new Date().toISOString().slice(0, 10);
  const operationsByBooking = new Map(
    (operationsResult.data ?? []).map((operation) => [
      `${operation.request_kind}-${operation.request_id}`,
      operation.operational_status,
    ]),
  );
  const upcomingConfirmed = records.filter((row) =>
    row.tripDate && row.tripDate >= today && confirmedStatuses.has(row.status) && row.status !== "completed" && row.status !== "cancelled",
  );
  const tripsReady = upcomingConfirmed.filter((row) => {
    const status = operationsByBooking.get(row.key);
    return status === "ready" || status === "underway";
  }).length;

  return {
    rangeLabel: days === null ? "All time" : `Last ${days} days`,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    conversionRate,
    cancellationRate,
    averageFirstResponseHours,
    responseCoverage: totalBookings ? (responseHours.length / totalBookings) * 100 : 0,
    trend,
    statuses,
    topTrips,
    sources,
    currencies,
    teamWorkload,
    paymentReconciliation,
    paymentMismatches,
    upcomingTrips: upcomingConfirmed.length,
    tripsReady,
    tripsNeedingPreparation: Math.max(upcomingConfirmed.length - tripsReady, 0),
  };
}

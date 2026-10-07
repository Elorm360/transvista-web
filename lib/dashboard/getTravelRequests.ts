import "server-only";
import { createClient } from "@/lib/supabase/server";

export type RequestDetail = {
  label: string;
  value: string;
};

export type RequestActivityRecord = {
  id: string;
  type: string;
  summary: string;
  authorName: string;
  createdAt: string;
};

export type RequestOperator = {
  id: string;
  fullName: string;
  role: string;
};

export type TravelRequestRecord = {
  id: string;
  sourceId: number;
  source: "custom" | "package";
  reference: string;
  kind: "Custom trip" | "Group trip";
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  travellers: number;
  status: string;
  priority: string;
  assignedTo: string | null;
  assigneeName: string | null;
  followUpAt: string | null;
  quotedAmount: number | null;
  quoteCurrency: string | null;
  depositAmount: number | null;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentVerifiedAt: string | null;
  paymentDueAt: string | null;
  paymentRequestSentAt: string | null;
  paymentRequestAmount: number | null;
  paymentRequestType: string | null;
  confirmedItinerary: string | null;
  tripDate: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  archiveReason: string | null;
  details: RequestDetail[];
  activity: RequestActivityRecord[];
};

function valueOrDash(value: string | null | undefined) {
  return value?.trim() || "—";
}

function numberOrNull(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function activityKey(kind: "custom" | "package", requestId: number) {
  return `${kind}-${requestId}`;
}

export async function getRequestOperators(): Promise<RequestOperator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_request_operators");

  if (error) {
    console.error("[getRequestOperators]", error);
    return [];
  }

  return (data ?? []).map((operator: { id: string; full_name: string; role: string }) => ({
    id: operator.id,
    fullName: operator.full_name,
    role: operator.role,
  }));
}

export async function getTravelRequests(): Promise<TravelRequestRecord[]> {
  const supabase = await createClient();

  const [customResult, packageResult, activityResult, operatorsResult] =
    await Promise.all([
      supabase
        .from("trip_requests")
        .select("id, reference, full_name, email, phone, country, destinations, services, interests, travel_start, travel_end, date_flexibility, adults, children, budget_currency, budget_basis, budget_range, accommodation_style, transport_details, notes, status, policy_version, policy_accepted_at, assigned_to, priority, follow_up_at, quoted_amount, quote_currency, deposit_amount, amount_paid, payment_status, payment_method, payment_verified_at, payment_due_at, payment_request_sent_at, payment_request_amount, payment_request_type, confirmed_itinerary, archived_at, archive_reason, created_at, updated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("package_reservations")
        .select("id, reference, package_title, package_date, full_name, email, phone, city, emergency_contact_name, emergency_contact_phone, travellers, dietary_requirements, accessibility_requirements, notes, currency, price_per_person, total_price, deposit_per_person, deposit_due, balance_per_person, status, payment_status, promotional_media_consent, policy_version, policy_accepted_at, assigned_to, priority, follow_up_at, quoted_amount, quote_currency, deposit_amount, amount_paid, payment_method, payment_verified_at, payment_due_at, payment_request_sent_at, payment_request_amount, payment_request_type, confirmed_itinerary, archived_at, archive_reason, created_at, updated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("request_activity")
        .select("id, request_kind, request_id, activity_type, summary, author_member_id, created_at")
        .order("created_at", { ascending: false }),
      supabase.rpc("list_request_operators"),
    ]);

  if (customResult.error) {
    console.error("[getTravelRequests] custom:", customResult.error);
  }
  if (packageResult.error) {
    console.error("[getTravelRequests] package:", packageResult.error);
  }
  if (activityResult.error) {
    console.error("[getTravelRequests] activity:", activityResult.error);
  }
  if (operatorsResult.error) {
    console.error("[getTravelRequests] operators:", operatorsResult.error);
  }

  const operatorNames = new Map<string, string>(
    (operatorsResult.data ?? []).map(
      (operator: { id: string; full_name: string }) => [
        operator.id,
        operator.full_name,
      ],
    ),
  );
  const activity = new Map<string, RequestActivityRecord[]>();

  for (const row of activityResult.data ?? []) {
    const key = activityKey(row.request_kind, Number(row.request_id));
    const records = activity.get(key) ?? [];
    records.push({
      id: row.id,
      type: row.activity_type,
      summary: row.summary,
      authorName: operatorNames.get(row.author_member_id) ?? "TransVista team",
      createdAt: row.created_at,
    });
    activity.set(key, records);
  }

  const custom: TravelRequestRecord[] = (customResult.data ?? []).map((row) => {
    const sourceId = Number(row.id);
    return {
      id: activityKey("custom", sourceId),
      sourceId,
      source: "custom",
      reference: row.reference,
      kind: "Custom trip",
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      summary: row.destinations?.join(", ") || "Destination to be discussed",
      travellers: row.adults + row.children,
      status: row.status,
      priority: row.priority ?? "normal",
      assignedTo: row.assigned_to,
      assigneeName: row.assigned_to
        ? operatorNames.get(row.assigned_to) ?? "Team member"
        : null,
      followUpAt: row.follow_up_at,
      quotedAmount: numberOrNull(row.quoted_amount),
      quoteCurrency: row.quote_currency ?? row.budget_currency,
      depositAmount: numberOrNull(row.deposit_amount),
      amountPaid: numberOrNull(row.amount_paid) ?? 0,
      paymentStatus: row.payment_status ?? "not-requested",
      paymentMethod: row.payment_method,
      paymentVerifiedAt: row.payment_verified_at,
      paymentDueAt: row.payment_due_at,
      paymentRequestSentAt: row.payment_request_sent_at,
      paymentRequestAmount: numberOrNull(row.payment_request_amount),
      paymentRequestType: row.payment_request_type,
      confirmedItinerary: row.confirmed_itinerary,
      tripDate: row.travel_start,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      archivedAt: row.archived_at,
      archiveReason: row.archive_reason,
      activity: activity.get(activityKey("custom", sourceId)) ?? [],
      details: [
        { label: "Country", value: valueOrDash(row.country) },
        { label: "Destinations", value: row.destinations?.join(", ") || "—" },
        { label: "Services requested", value: row.services?.join(", ") || "—" },
        { label: "Interests", value: row.interests?.join(", ") || "—" },
        {
          label: "Travel dates",
          value: row.travel_start
            ? `${row.travel_start}${row.travel_end ? ` to ${row.travel_end}` : ""}`
            : valueOrDash(row.date_flexibility),
        },
        { label: "Travellers", value: `${row.adults} adults, ${row.children} children` },
        {
          label: "Budget",
          value: `${row.budget_currency} ${row.budget_range} · ${row.budget_basis.replaceAll("-", " ")}`,
        },
        { label: "Accommodation", value: valueOrDash(row.accommodation_style) },
        { label: "Transport", value: valueOrDash(row.transport_details) },
        { label: "Notes", value: valueOrDash(row.notes) },
        {
          label: "Policy accepted",
          value: `${row.policy_version} · ${new Date(row.policy_accepted_at).toLocaleString("en-GB")}`,
        },
      ],
    };
  });

  const packages: TravelRequestRecord[] = (packageResult.data ?? []).map((row) => {
    const sourceId = Number(row.id);
    return {
      id: activityKey("package", sourceId),
      sourceId,
      source: "package",
      reference: row.reference,
      kind: "Group trip",
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      summary: row.package_title,
      travellers: row.travellers,
      status: row.status,
      priority: row.priority ?? "normal",
      assignedTo: row.assigned_to,
      assigneeName: row.assigned_to
        ? operatorNames.get(row.assigned_to) ?? "Team member"
        : null,
      followUpAt: row.follow_up_at,
      quotedAmount: numberOrNull(row.quoted_amount) ?? Number(row.total_price),
      quoteCurrency: row.quote_currency ?? row.currency,
      depositAmount: numberOrNull(row.deposit_amount) ?? Number(row.deposit_due),
      amountPaid: numberOrNull(row.amount_paid) ?? 0,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      paymentVerifiedAt: row.payment_verified_at,
      paymentDueAt: row.payment_due_at,
      paymentRequestSentAt: row.payment_request_sent_at,
      paymentRequestAmount: numberOrNull(row.payment_request_amount),
      paymentRequestType: row.payment_request_type,
      confirmedItinerary: row.confirmed_itinerary,
      tripDate: row.package_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      archivedAt: row.archived_at,
      archiveReason: row.archive_reason,
      activity: activity.get(activityKey("package", sourceId)) ?? [],
      details: [
        { label: "Trip date", value: valueOrDash(row.package_date) },
        { label: "City", value: valueOrDash(row.city) },
        { label: "Travellers", value: String(row.travellers) },
        {
          label: "Emergency contact",
          value: `${row.emergency_contact_name} · ${row.emergency_contact_phone}`,
        },
        { label: "Dietary requirements", value: valueOrDash(row.dietary_requirements) },
        { label: "Accessibility requirements", value: valueOrDash(row.accessibility_requirements) },
        { label: "Additional notes", value: valueOrDash(row.notes) },
        { label: "Total package price", value: `${row.currency} ${row.total_price}` },
        {
          label: "Deposit due after confirmation",
          value: `${row.currency} ${row.deposit_due} (${row.deposit_per_person} per person)`,
        },
        { label: "Balance per person", value: `${row.currency} ${row.balance_per_person}` },
        {
          label: "Promotional media consent",
          value: row.promotional_media_consent ? "Yes" : "No",
        },
        {
          label: "Policy accepted",
          value: `${row.policy_version} · ${new Date(row.policy_accepted_at).toLocaleString("en-GB")}`,
        },
      ],
    };
  });

  return [...custom, ...packages].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

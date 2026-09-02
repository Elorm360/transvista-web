import { createAdminClient } from "@/lib/supabase/admin";

export type RequestDetail = {
  label: string;
  value: string;
};

export type TravelRequestRecord = {
  id: string;
  reference: string;
  kind: "Custom trip" | "Group trip";
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  travellers: number;
  status: string;
  createdAt: string;
  details: RequestDetail[];
};

function valueOrDash(value: string | null | undefined) {
  return value?.trim() || "—";
}

export async function getTravelRequests(): Promise<TravelRequestRecord[]> {
  const supabase = createAdminClient();

  const [customResult, packageResult] = await Promise.all([
    supabase
      .from("trip_requests")
      .select("id, reference, full_name, email, phone, country, destinations, services, interests, travel_start, travel_end, date_flexibility, adults, children, budget_currency, budget_basis, budget_range, accommodation_style, transport_details, notes, status, policy_version, policy_accepted_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("package_reservations")
      .select("id, reference, package_title, package_date, full_name, email, phone, city, emergency_contact_name, emergency_contact_phone, travellers, dietary_requirements, accessibility_requirements, notes, currency, price_per_person, total_price, deposit_per_person, deposit_due, balance_per_person, status, payment_status, promotional_media_consent, policy_version, policy_accepted_at, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (customResult.error) console.error("[getTravelRequests] custom:", customResult.error);
  if (packageResult.error) console.error("[getTravelRequests] package:", packageResult.error);

  const custom: TravelRequestRecord[] = (customResult.data ?? []).map((row) => ({
    id: `custom-${row.id}`,
    reference: row.reference,
    kind: "Custom trip",
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    summary: row.destinations?.join(", ") || "Destination to be discussed",
    travellers: row.adults + row.children,
    status: row.status,
    createdAt: row.created_at,
    details: [
      { label: "Country", value: valueOrDash(row.country) },
      { label: "Destinations", value: row.destinations?.join(", ") || "—" },
      { label: "Services requested", value: row.services?.join(", ") || "—" },
      { label: "Interests", value: row.interests?.join(", ") || "—" },
      {
        label: "Travel dates",
        value:
          row.travel_start
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
      { label: "Policy accepted", value: `${row.policy_version} · ${new Date(row.policy_accepted_at).toLocaleString("en-GB")}` },
    ],
  }));

  const packages: TravelRequestRecord[] = (packageResult.data ?? []).map((row) => ({
    id: `package-${row.id}`,
    reference: row.reference,
    kind: "Group trip",
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    summary: row.package_title,
    travellers: row.travellers,
    status: row.status,
    createdAt: row.created_at,
    details: [
      { label: "Trip date", value: valueOrDash(row.package_date) },
      { label: "City", value: valueOrDash(row.city) },
      { label: "Travellers", value: String(row.travellers) },
      { label: "Emergency contact", value: `${row.emergency_contact_name} · ${row.emergency_contact_phone}` },
      { label: "Dietary requirements", value: valueOrDash(row.dietary_requirements) },
      { label: "Accessibility requirements", value: valueOrDash(row.accessibility_requirements) },
      { label: "Additional notes", value: valueOrDash(row.notes) },
      { label: "Total package price", value: `${row.currency} ${row.total_price}` },
      { label: "Deposit due after confirmation", value: `${row.currency} ${row.deposit_due} (${row.deposit_per_person} per person)` },
      { label: "Balance per person", value: `${row.currency} ${row.balance_per_person}` },
      { label: "Payment status", value: row.payment_status.replaceAll("-", " ") },
      { label: "Promotional media consent", value: row.promotional_media_consent ? "Yes" : "No" },
      { label: "Policy accepted", value: `${row.policy_version} · ${new Date(row.policy_accepted_at).toLocaleString("en-GB")}` },
    ],
  }));

  return [...custom, ...packages].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}
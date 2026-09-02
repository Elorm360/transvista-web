import { createAdminClient } from "@/lib/supabase/admin";

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
};

export async function getTravelRequests(): Promise<TravelRequestRecord[]> {
  const supabase = createAdminClient();

  const [customResult, packageResult] = await Promise.all([
    supabase
      .from("trip_requests")
      .select("id, reference, full_name, email, phone, destinations, adults, children, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("package_reservations")
      .select("id, reference, full_name, email, phone, package_title, travellers, status, created_at")
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
  }));

  return [...custom, ...packages].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}
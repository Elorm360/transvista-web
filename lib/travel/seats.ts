import { createAdminClient } from "@/lib/supabase/admin";

// Registrations that hold a place: confirmed by the team, paid, or travelling.
const HOLDING_STATUSES = [
  "confirmed-awaiting-deposit",
  "deposit-paid",
  "paid",
  "in-progress",
  "completed",
];

/**
 * Places left on a group trip, or null when the count can't be read
 * (e.g. local builds without Supabase credentials) so the UI can hide it.
 * Server-only: uses the service-role client.
 */
export async function getPlacesLeft(packageSlug: string, capacity: number) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("package_reservations")
      .select("travellers")
      .eq("package_slug", packageSlug)
      .in("status", HOLDING_STATUSES)
      .is("archived_at", null);

    if (error || !data) return null;
    const taken = data.reduce((sum, row) => sum + (row.travellers ?? 0), 0);
    return Math.max(capacity - taken, 0);
  } catch {
    return null;
  }
}

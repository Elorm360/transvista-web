import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  /** Total number of community members */
  totalMembers: number;
  /** Number of distinct countries represented */
  distinctCountries: number;
  /** Number of distinct interest categories */
  distinctInterests: number;
  /** Number of members who joined in the last 7 days */
  joinedThisWeek: number;
}

export interface RecentMember {
  /** The member's full name */
  fullName: string;
  /** The member's country */
  country: string;
  /** The member's interest/role */
  interest: string;
  /** When they joined (ISO string) */
  createdAt: string;
}

/**
 * getDashboardStats
 *
 * Fetches aggregate statistics for the admin dashboard.
 * All queries are batched via Promise.all for efficiency.
 *
 * @returns DashboardStats with totalMembers, distinctCountries, distinctInterests, joinedThisWeek
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // PostgREST has no COUNT(DISTINCT …), so fetch just the two short
  // columns and de-duplicate here. Fine at waitlist scale (Supabase caps a
  // single select at 1,000 rows by default); move to an SQL view or RPC
  // before the waitlist grows past that.
  const [totalResult, segmentsResult, weekResult] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("country, interest"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
  ]);

  if (segmentsResult.error) {
    console.error("[getDashboardStats] Supabase error:", segmentsResult.error);
  }

  const rows = segmentsResult.data ?? [];
  const distinct = (values: (string | null)[]) =>
    new Set(
      values
        .map((value) => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value)),
    ).size;

  return {
    totalMembers: totalResult.count ?? 0,
    distinctCountries: distinct(rows.map((row) => row.country)),
    distinctInterests: distinct(rows.map((row) => row.interest)),
    joinedThisWeek: weekResult.count ?? 0,
  };
}

/**
 * getRecentMembers
 *
 * Fetches the 5 most recently joined community members.
 *
 * @returns Array of RecentMember objects, newest first
 */
export async function getRecentMembers(): Promise<RecentMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("full_name, country, interest, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("[getRecentMembers] Supabase error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    fullName: row.full_name,
    country: row.country ?? "—",
    interest: row.interest ?? "—",
    createdAt: row.created_at,
  }));
}

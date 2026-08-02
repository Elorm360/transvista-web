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

  const [totalResult, countriesResult, interestsResult, weekResult] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("country", { count: "exact", head: true })
        .not("country", "is", null),
      supabase
        .from("leads")
        .select("interest", { count: "exact", head: true })
        .not("interest", "is", null),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
    ]);

  return {
    totalMembers: totalResult.count ?? 0,
    distinctCountries: countriesResult.count ?? 0,
    distinctInterests: interestsResult.count ?? 0,
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

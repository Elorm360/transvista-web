import { createClient } from "@/lib/supabase/server";

/* ──────────────────────────────────────────────────────────────
 * Analytics service
 *
 * All reporting-related Supabase queries live here, kept separate
 * from dashboard statistics. The functions are designed to later
 * accept a `days` filter (7 / 30 / 90 / all time) — the range
 * helpers are already in place so adding filters won't require
 * restructuring.
 * ────────────────────────────────────────────────────────────── */

export interface GrowthPoint {
  /** Human-readable date label, e.g. "2 Aug" */
  label: string;
  /** Number of members who joined that day */
  count: number;
}

export interface CountryDistribution {
  /** Country name */
  country: string;
  /** Total members from that country */
  count: number;
}

export interface InterestBreakdown {
  /** Interest/role value */
  interest: string;
  /** Number of members with that interest */
  count: number;
}

export interface AnalyticsKpis {
  /** Members who joined in the last `days` days */
  newMembers30d: number;
  /** Country with the most recent signups */
  fastestGrowingCountry: string;
  /** Most common interest among recent signups */
  mostCommonInterest: string;
}

/**
 * Compute an ISO cutoff timestamp `days` days ago.
 * Returns null when no range is given (i.e. "All time").
 */
function sinceIso(days?: number): string | null {
  if (!days) return null;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Convert a Date to a local `YYYY-MM-DD` key (avoids UTC off-by-one). */
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format a `YYYY-MM-DD` key as "2 Aug". */
function formatLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/**
 * getGrowthData
 *
 * Returns the number of members who joined each day over the last
 * `days` days (default 30). Missing days are filled with 0 so the
 * line chart is continuous.
 *
 * @param days - Number of days to include (future: 7 / 30 / 90 / all time)
 */
export async function getGrowthData(days = 30): Promise<GrowthPoint[]> {
  const supabase = await createClient();

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const { data, error } = await supabase
    .from("leads")
    .select("created_at")
    .gte("created_at", since.toISOString());

  if (error) {
    console.error("[getAnalytics:growth] Supabase error:", error);
    return [];
  }

  // Seed every day with 0 so the chart has a continuous baseline.
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    counts.set(toLocalDateKey(d), 0);
  }

  for (const row of data ?? []) {
    const key = toLocalDateKey(new Date(row.created_at));
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([key, count]) => ({
    label: formatLabel(key),
    count,
  }));
}

/**
 * getCountryDistribution
 *
 * Returns the top `limit` countries by total member count, sorted
 * descending. Grouping happens client-side (dataset is small).
 *
 * @param limit - How many countries to return (default 5)
 */
export async function getCountryDistribution(
  limit = 5,
): Promise<CountryDistribution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("country")
    .not("country", "is", null);

  if (error) {
    console.error("[getAnalytics:countries] Supabase error:", error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.country) continue;
    counts.set(row.country, (counts.get(row.country) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * getInterestBreakdown
 *
 * Returns member counts grouped by interest value, sorted descending.
 */
export async function getInterestBreakdown(): Promise<InterestBreakdown[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("interest")
    .not("interest", "is", null);

  if (error) {
    console.error("[getAnalytics:interests] Supabase error:", error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.interest) continue;
    counts.set(row.interest, (counts.get(row.interest) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([interest, count]) => ({ interest, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * getAnalyticsKpis
 *
 * Returns summary KPIs computed over the last `days` days:
 * new member count, fastest-growing country, most common interest.
 *
 * @param days - Look-back window (default 30)
 */
export async function getAnalyticsKpis(days = 30): Promise<AnalyticsKpis> {
  const supabase = await createClient();

  const since = sinceIso(days);

  let query = supabase.from("leads").select("country, interest, created_at");
  if (since) {
    query = query.gte("created_at", since);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getAnalytics:kpis] Supabase error:", error);
    return {
      newMembers30d: 0,
      fastestGrowingCountry: "—",
      mostCommonInterest: "—",
    };
  }

  const rows = data ?? [];
  const countryCounts = new Map<string, number>();
  const interestCounts = new Map<string, number>();

  for (const row of rows) {
    if (row.country) {
      countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
    }
    if (row.interest) {
      interestCounts.set(row.interest, (interestCounts.get(row.interest) ?? 0) + 1);
    }
  }

  const topCountry = [...countryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const topInterest = [...interestCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return {
    newMembers30d: rows.length,
    fastestGrowingCountry: topCountry,
    mostCommonInterest: topInterest,
  };
}


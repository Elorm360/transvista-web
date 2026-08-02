import { createClient } from "@/lib/supabase/server";

export interface CommunityMember {
  /** Unique row id */
  id: string;
  /** The member's full name */
  fullName: string;
  /** The member's email address */
  email: string;
  /** The member's phone number (may be null) */
  phone: string | null;
  /** The member's country */
  country: string;
  /** The member's interest/role */
  interest: string;
  /** When they joined (ISO string) */
  createdAt: string;
}

/**
 * getCommunityMembers
 *
 * Fetches every community member from the leads table,
 * sorted newest first, with all fields needed for display.
 *
 * @returns Array of CommunityMember objects
 */
export async function getCommunityMembers(): Promise<CommunityMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, email, phone, country, interest, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCommunityMembers] Supabase error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? null,
    country: row.country ?? "—",
    interest: row.interest ?? "—",
    createdAt: row.created_at,
  }));
}

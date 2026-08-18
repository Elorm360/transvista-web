import { createClient } from "@/lib/supabase/server";

export interface TeamMember {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

/**
 * Fetch all TransVista admin team members.
 *
 * This is intentionally server-side so the browser never receives
 * direct database credentials.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_team_members")
    .select(
      "id, user_id, full_name, email, role, status, created_at",
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getTeamMembers] Supabase error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id ?? null,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  }));
}

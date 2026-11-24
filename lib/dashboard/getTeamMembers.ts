import { createClient } from "@/lib/supabase/server";

export interface TeamMember {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  role: string;
  status: string;
  avatarPath: string | null;
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
      "id, user_id, full_name, email, role, status, avatar_path, created_at",
    )
    // Permanently deleted members are kept only as an anonymous history label.
    .neq("status", "removed")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getTeamMembers] Supabase error:", error);
    // Throw so app/admin/error.tsx shows an error instead of an empty list.
    throw new Error("Team members could not be loaded.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id ?? null,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    avatarPath: row.avatar_path ?? null,
    createdAt: row.created_at,
  }));
}

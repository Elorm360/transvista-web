import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/auth/isAdmin";

/**
 * Read the admin role for an email from `admin_team_members`.
 *
 * Returns the role only when the member exists, status is `active`,
 * and the stored role is one of the known AdminRole values.
 * Used as the database-backed source of truth — do not call this
 * from the existing synchronous isAdmin / roleFor helpers.
 */
export async function getAdminRole(
  email: string | null | undefined,
): Promise<AdminRole | null> {
  if (!email) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_team_members")
    .select("role, status")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("[getAdminRole] Supabase error:", error);
    return null;
  }

  if (!data || data.status !== "active") {
    return null;
  }

  const validRoles: AdminRole[] = [
    "owner",
    "admin",
    "community_manager",
    "support",
  ];

  if (!validRoles.includes(data.role as AdminRole)) {
    return null;
  }

  return data.role as AdminRole;
}

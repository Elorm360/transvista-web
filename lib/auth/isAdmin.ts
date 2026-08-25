import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/auth/permissions";

export type { AdminRole, AdminArea } from "@/lib/auth/permissions";
export { canAccess, formatAdminRole } from "@/lib/auth/permissions";

/**
 * Get the role assigned to an authenticated user from admin_team_members.
 */
export async function roleFor(
  user: Pick<User, "id"> | null,
): Promise<AdminRole | null> {
  if (!user?.id) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_team_members")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[roleFor] Supabase error:", error);
    return null;
  }

  if (!data || data.status !== "active") {
    return null;
  }

  return data.role as AdminRole;
}

/**
 * Check whether an authenticated user has access to the admin area.
 */
export async function isAdmin(
  user: Pick<User, "id"> | null,
): Promise<boolean> {
  const role = await roleFor(user);
  return role !== null;
}

/**
 * Check whether the user is the TransVista owner.
 */
export async function isOwner(
  user: Pick<User, "id"> | null,
): Promise<boolean> {
  const role = await roleFor(user);
  return role === "owner";
}

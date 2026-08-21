import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminRole } from "@/lib/auth/getAdminRole";
import { canAccess, type AdminRole } from "@/lib/auth/isAdmin";

/**
 * Server-side gate for a specific admin area.
 *
 * Authenticated + active team member + role permitted for `area`,
 * otherwise redirect. Returns the caller's role for the page to use.
 */
export async function requireAdminAccess(
  area:
    | "dashboard"
    | "community"
    | "analytics"
    | "settings",
): Promise<AdminRole> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getAdminRole(user.email);

  if (!role) {
    redirect("/unauthorized");
  }

  if (!canAccess(role, area)) {
    redirect("/unauthorized");
  }

  return role;
}

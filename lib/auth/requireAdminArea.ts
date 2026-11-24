import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { resolveAdminAccess, type AdminAccess } from "@/lib/auth/access";
import type { AdminArea, AdminRole } from "@/lib/auth/permissions";

/**
 * For admin pages and layouts: the signed-in person's access, or a redirect.
 * - not signed in → /login
 * - two-step sign-in set up but not completed → /login/verify
 * - not an active team member → /unauthorized
 */
export async function getAdminSession(): Promise<{ user: User; role: AdminRole; access: AdminAccess }> {
  const result = await resolveAdminAccess();
  if (result.status === "signed-out") redirect("/login");
  if (result.status === "mfa-required") redirect("/login/verify");
  if (result.status === "no-access") redirect("/unauthorized");
  return { user: result.access.user, role: result.access.role, access: result.access };
}

/** Like getAdminSession, and also requires this section to be in their role. */
export async function requireAdminArea(area: AdminArea) {
  const session = await getAdminSession();
  if (!session.access.areas.includes(area)) redirect("/unauthorized");
  return session;
}

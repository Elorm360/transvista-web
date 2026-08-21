import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminRole } from "@/lib/auth/getAdminRole";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Admin layout
 *
 * Authentication:
 *   No session → /login
 *
 * Authorization:
 *   Session exists but no active admin-team membership → /unauthorized
 *
 * The user's role is read from admin_team_members rather than being
 * hard-coded in the application.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * ------------------------------------------------------------
   * 1. Authentication
   * ------------------------------------------------------------
   */

  if (!user) {
    redirect("/login");
  }

  /*
   * ------------------------------------------------------------
   * 2. Database-backed authorization
   * ------------------------------------------------------------
   */

  const role = await getAdminRole(user.email);

  if (!role) {
    redirect("/unauthorized");
  }

  /*
   * ------------------------------------------------------------
   * 3. Render admin application
   * ------------------------------------------------------------
   */

  return <AdminShell>{children}</AdminShell>;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminRole } from "@/lib/auth/getAdminRole";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Console chrome for the admin app.
 *
 * Invited users who still need to set a password are sent to
 * /admin/setup instead of the sidebar dashboard.
 */
export default async function AdminConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.must_set_password === true) {
    redirect("/admin/setup");
  }

  const role = await getAdminRole(user.email);

  if (!role) {
    redirect("/unauthorized");
  }

  return <AdminShell role={role}>{children}</AdminShell>;
}

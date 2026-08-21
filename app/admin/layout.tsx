import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminRole } from "@/lib/auth/getAdminRole";

/**
 * Admin layout
 *
 * Authentication:
 *   No session → /login
 *
 * Authorization:
 *   Session exists but no active admin-team membership → /unauthorized
 *
 * First-time invited users (must_set_password) still pass this gate
 * so they can reach /admin/setup. The console chrome is applied in
 * `app/admin/(console)/layout.tsx`.
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

  if (!user) {
    redirect("/login");
  }

  const role = await getAdminRole(user.email);

  if (!role) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleFor } from "@/lib/auth/isAdmin";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Admin layout (server component)
 *
 * Authentication:
 * no session → /login
 *
 * Authorization:
 * session but not an active admin team member → /unauthorized
 *
 * Per-area permissions are enforced on each page via requireAdminArea().
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

  const role = await roleFor(user);

  if (!role) {
    redirect("/unauthorized");
  }

  return <AdminShell role={role}>{children}</AdminShell>;
}

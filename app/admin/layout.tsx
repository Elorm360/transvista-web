import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Admin layout (server component)
 *
 * Authentication:
 * no session → /login
 *
 * Authorization:
 * session but not an active admin team member → /unauthorized
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

  // Not signed in → /login
  if (!user) {
    redirect("/login");
  }

  // Signed in but not an active admin team member → /unauthorized
  if (!(await isAdmin(user))) {
    redirect("/unauthorized");
  }

  return <AdminShell>{children}</AdminShell>;
}

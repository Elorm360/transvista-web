import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Admin layout (server component)
 *
 * Defense-in-depth: the proxy (`proxy.ts`) already blocks unauthenticated
 * and unauthorized requests at the edge, but this guard runs again during
 * server-side rendering so the admin chrome can never render for a
 * signed-in user without admin permission — even on direct navigation.
 *
 * Authentication: no session → /login
 * Authorization: session but not an admin → /unauthorized
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

  // Signed in but not authorized → /unauthorized
  if (!isAdmin(user)) {
    redirect("/unauthorized");
  }

  return <AdminShell>{children}</AdminShell>;
}


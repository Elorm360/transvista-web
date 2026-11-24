import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleFor } from "@/lib/auth/isAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminNotifications } from "@/lib/dashboard/getAdminNotifications";
import { getMyProfile } from "@/lib/dashboard/getMyProfile";

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

  const [{ unreadCount }, profile] = await Promise.all([
    getAdminNotifications(user.id, role, { limit: 150 }),
    getMyProfile(user.id),
  ]);

  return (
    <AdminShell
      role={role}
      unreadCount={unreadCount}
      me={{ name: profile?.fullName ?? user.email ?? "Team member", avatarPath: profile?.avatarPath ?? null }}
    >
      {children}
    </AdminShell>
  );
}

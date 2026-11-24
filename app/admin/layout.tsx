import { getAdminSession } from "@/lib/auth/requireAdminArea";
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
  const { user, access } = await getAdminSession();

  const [{ unreadCount }, profile] = await Promise.all([
    getAdminNotifications(user.id, access.areas, { limit: 150 }),
    getMyProfile(user.id),
  ]);

  return (
    <AdminShell
      roleLabel={access.roleLabel}
      areas={access.areas}
      unreadCount={unreadCount}
      me={{ name: profile?.fullName ?? user.email ?? "Team member", avatarPath: profile?.avatarPath ?? null }}
      theme={profile?.theme ?? "system"}
    >
      {children}
    </AdminShell>
  );
}

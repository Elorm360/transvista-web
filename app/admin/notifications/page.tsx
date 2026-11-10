import { Bell } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import NotificationList from "@/components/admin/NotificationList";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { getAdminNotifications } from "@/lib/dashboard/getAdminNotifications";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const { user, role } = await requireAdminArea("dashboard");
  const { notifications, unreadCount } = await getAdminNotifications(user.id, role, { limit: 150 });

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        icon={Bell}
        title="Notifications"
        description="Stay on top of new bookings, payment updates and important team activity."
      />
      <NotificationList notifications={notifications} unreadCount={unreadCount} />
    </div>
  );
}

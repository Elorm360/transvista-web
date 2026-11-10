import "server-only";

import { createClient } from "@/lib/supabase/server";
import { canAccess, type AdminRole } from "@/lib/auth/permissions";

export type AdminNotification = {
  key: string;
  title: string;
  description: string;
  href: string;
  category: "booking" | "payment" | "community" | "team";
  createdAt: string;
  actor: string | null;
  read: boolean;
};

type NotificationOptions = {
  limit?: number;
};

const activityTitles: Record<string, string> = {
  status: "Booking status updated",
  assignment: "Booking assigned",
  payment: "Payment activity recorded",
  "follow-up": "Follow-up scheduled",
  note: "Team note added",
  update: "Booking details updated",
};

export async function getAdminNotifications(
  userId: string,
  role: AdminRole,
  options: NotificationOptions = {},
): Promise<{ notifications: AdminNotification[]; unreadCount: number }> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 150);
  const canSeeRequests = canAccess(role, "requests");
  const canSeeCommunity = canAccess(role, "community");

  const [packagesResult, tripsResult, activityResult, leadsResult, operatorsResult] =
    await Promise.all([
      canSeeRequests
        ? supabase.from("package_reservations")
            .select("id,reference,full_name,package_title,status,created_at")
            .is("archived_at", null).gte("created_at", cutoff)
            .order("created_at", { ascending: false }).limit(100)
        : Promise.resolve({ data: [], error: null }),
      canSeeRequests
        ? supabase.from("trip_requests")
            .select("id,reference,full_name,destinations,status,created_at")
            .is("archived_at", null).gte("created_at", cutoff)
            .order("created_at", { ascending: false }).limit(100)
        : Promise.resolve({ data: [], error: null }),
      canSeeRequests
        ? supabase.from("request_activity")
            .select("id,request_kind,request_id,reference,activity_type,summary,author_member_id,created_at")
            .gte("created_at", cutoff).order("created_at", { ascending: false }).limit(150)
        : Promise.resolve({ data: [], error: null }),
      canSeeCommunity
        ? supabase.from("leads")
            .select("id,full_name,interest,created_at")
            .gte("created_at", cutoff).order("created_at", { ascending: false }).limit(100)
        : Promise.resolve({ data: [], error: null }),
      canSeeRequests
        ? supabase.rpc("list_request_operators")
        : Promise.resolve({ data: [], error: null }),
    ]);

  for (const [label, result] of [
    ["package registrations", packagesResult],
    ["trip requests", tripsResult],
    ["team activity", activityResult],
    ["community sign-ups", leadsResult],
  ] as const) {
    if (result.error) console.error(`[getAdminNotifications] ${label}:`, result.error);
  }

  const actorNames = new Map<string, string>(
    (operatorsResult.data ?? []).map((operator: { id: string; full_name: string }) => [
      operator.id,
      operator.full_name,
    ]),
  );

  const events: AdminNotification[] = [];

  for (const row of packagesResult.data ?? []) {
    events.push({
      key: `booking:package:${row.id}`,
      title: "New group trip registration",
      description: `${row.full_name} · ${row.package_title} · ${row.reference}`,
      href: "/admin/requests",
      category: "booking",
      createdAt: row.created_at,
      actor: null,
      read: false,
    });
  }

  for (const row of tripsResult.data ?? []) {
    const destination = (row.destinations ?? []).join(", ") || "Destination to be discussed";
    events.push({
      key: `booking:custom:${row.id}`,
      title: "New trip request received",
      description: `${row.full_name} · ${destination} · ${row.reference}`,
      href: "/admin/requests",
      category: "booking",
      createdAt: row.created_at,
      actor: null,
      read: false,
    });
  }

  for (const row of activityResult.data ?? []) {
    const title = activityTitles[row.activity_type] ?? "Booking activity updated";
    const isPayment = row.activity_type === "payment";
    events.push({
      key: `activity:${row.id}`,
      title,
      description: `${row.reference} · ${row.summary.replace(/\\s+/g, " ").slice(0, 240)}`,
      href: isPayment ? "/admin/payments" : "/admin/requests",
      category: isPayment ? "payment" : "team",
      createdAt: row.created_at,
      actor: actorNames.get(row.author_member_id) ?? "TransVista team",
      read: false,
    });
  }

  for (const row of leadsResult.data ?? []) {
    events.push({
      key: `lead:${row.id}`,
      title: "New community sign-up",
      description: `${row.full_name} · ${row.interest ?? "Community member"}`,
      href: "/admin/community",
      category: "community",
      createdAt: row.created_at,
      actor: null,
      read: false,
    });
  }

  events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const visibleEvents = events.slice(0, limit);
  const keys = visibleEvents.map((event) => event.key);
  if (!keys.length) return { notifications: [], unreadCount: 0 };

  const { data: reads, error: readsError } = await supabase
    .from("admin_notification_reads")
    .select("notification_key")
    .eq("user_id", userId)
    .in("notification_key", keys);

  if (readsError) {
    console.error("[getAdminNotifications] read states:", readsError);
  }
  const readKeys = new Set((reads ?? []).map((row) => row.notification_key));
  const notifications = visibleEvents.map((event) => ({
    ...event,
    read: readKeys.has(event.key),
  }));

  return {
    notifications,
    unreadCount: notifications.filter((event) => !event.read).length,
  };
}

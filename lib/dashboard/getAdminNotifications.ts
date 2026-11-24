import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AdminArea } from "@/lib/auth/permissions";

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
  areas: readonly AdminArea[],
  options: NotificationOptions = {},
): Promise<{ notifications: AdminNotification[]; unreadCount: number }> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 150);
  const canSeeRequests = areas.includes("requests");
  const canSeeCommunity = areas.includes("community");

  const [packagesResult, tripsResult, activityResult, leadsResult, operatorsResult, selfResult] =
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
      // The viewer's own team id, so their own actions don't count as new.
      supabase.from("admin_team_members").select("id").eq("user_id", userId).maybeSingle(),
    ]);
  const selfMemberId: string | null = selfResult.data?.id ?? null;

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
      href: `/admin/requests?open=package-${row.id}`,
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
      href: `/admin/requests?open=custom-${row.id}`,
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
      href: isPayment ? "/admin/payments" : `/admin/requests?open=${row.request_kind}-${row.request_id}`,
      category: isPayment ? "payment" : "team",
      createdAt: row.created_at,
      actor: actorNames.get(row.author_member_id) ?? "TransVista team",
      // You don't need to be notified about your own changes.
      read: Boolean(selfMemberId && row.author_member_id === selfMemberId),
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

  // Tasks and approvals: what's been handed to you, escalated to you, or decided for you.
  if (selfMemberId) {
    const canDecide = areas.includes("approvals");
    const [tasksResult, approvalsResult, directoryResult] = await Promise.all([
      supabase.from("admin_tasks")
        .select("id,title,assigned_to,created_by,created_at,due_at,escalated_at,escalation_note")
        .or(canDecide ? `assigned_to.eq.${selfMemberId},escalated_at.not.is.null` : `assigned_to.eq.${selfMemberId}`)
        .neq("status", "done")
        .gte("updated_at", cutoff)
        .limit(100),
      supabase.from("approval_requests")
        .select("id,title,kind,status,requested_by,decided_by,created_at,decided_at")
        .or(canDecide ? `status.eq.pending,requested_by.eq.${selfMemberId}` : `requested_by.eq.${selfMemberId}`)
        .gte("updated_at", cutoff)
        .limit(100),
      supabase.rpc("list_team_directory"),
    ]);
    if (tasksResult.error) console.error("[getAdminNotifications] tasks:", tasksResult.error);
    if (approvalsResult.error) console.error("[getAdminNotifications] approvals:", approvalsResult.error);
    const names = new Map<string, string>(
      (directoryResult.data ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]),
    );

    for (const row of tasksResult.data ?? []) {
      if (row.assigned_to === selfMemberId && row.created_by !== selfMemberId && row.created_at >= cutoff) {
        const due = row.due_at ? ` · due ${new Date(row.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "";
        events.push({
          key: `task:assigned:${row.id}`,
          title: "New task for you",
          description: `${row.title}${due}`,
          href: "/admin/tasks",
          category: "team",
          createdAt: row.created_at,
          actor: names.get(row.created_by) ?? null,
          read: false,
        });
      }
      if (canDecide && row.escalated_at) {
        events.push({
          key: `task:escalated:${row.id}:${row.escalated_at}`,
          title: "Task escalated to you",
          description: `${row.title}${row.escalation_note ? ` · ${row.escalation_note.slice(0, 160)}` : ""}`,
          href: "/admin/tasks?view=escalated",
          category: "team",
          createdAt: row.escalated_at,
          actor: names.get(row.assigned_to) ?? null,
          read: false,
        });
      }
    }

    // Tasks you handed to someone else that they've finished.
    const [completedResult, teamResult] = await Promise.all([
      supabase.from("admin_tasks")
        .select("id,title,assigned_to,completed_at,due_at")
        .eq("created_by", selfMemberId).neq("assigned_to", selfMemberId)
        .eq("status", "done").gte("completed_at", cutoff)
        .limit(100),
      areas.includes("team_activity") ? supabase.rpc("get_team_activity") : Promise.resolve({ data: [], error: null }),
    ]);
    if (completedResult.error) console.error("[getAdminNotifications] completed tasks:", completedResult.error);
    for (const row of completedResult.data ?? []) {
      if (!row.completed_at) continue;
      const late = row.due_at && new Date(row.completed_at) > new Date(row.due_at);
      events.push({
        key: `task:completed:${row.id}:${row.completed_at}`,
        title: late ? "Task completed late" : "Task completed",
        description: row.title,
        href: "/admin/tasks?view=done",
        category: "team",
        createdAt: row.completed_at,
        actor: names.get(row.assigned_to) ?? null,
        read: false,
      });
    }

    // New team members accepting their invite.
    if (teamResult.error) console.error("[getAdminNotifications] team activity:", teamResult.error);
    for (const row of (teamResult.data ?? []) as Array<{ member_id: string; full_name: string; first_signed_in_at: string | null }>) {
      if (row.member_id === selfMemberId || !row.first_signed_in_at || new Date(row.first_signed_in_at) < new Date(cutoff)) continue;
      events.push({
        key: `team:joined:${row.member_id}`,
        title: "Invite accepted",
        description: `${row.full_name} accepted their invite and signed in for the first time`,
        href: "/admin/team-activity",
        category: "team",
        createdAt: row.first_signed_in_at,
        actor: row.full_name,
        read: false,
      });
    }

    for (const row of approvalsResult.data ?? []) {
      if (canDecide && row.status === "pending" && row.requested_by !== selfMemberId) {
        events.push({
          key: `approval:new:${row.id}`,
          title: row.kind === "payment_correction" ? "Payment correction needs your approval" : "Approval needed",
          description: row.title,
          href: "/admin/approvals",
          category: row.kind === "payment_correction" ? "payment" : "team",
          createdAt: row.created_at,
          actor: names.get(row.requested_by) ?? null,
          read: false,
        });
      }
      if (row.requested_by === selfMemberId && (row.status === "approved" || row.status === "rejected") && row.decided_at) {
        events.push({
          key: `approval:decided:${row.id}`,
          title: row.status === "approved" ? "Your request was approved" : "Your request was not approved",
          description: row.title,
          href: "/admin/approvals",
          category: "team",
          createdAt: row.decided_at,
          actor: names.get(row.decided_by) ?? null,
          read: false,
        });
      }
    }
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
    read: event.read || readKeys.has(event.key),
  }));

  return {
    notifications,
    unreadCount: notifications.filter((event) => !event.read).length,
  };
}

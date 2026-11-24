import "server-only";

import { createClient } from "@/lib/supabase/server";

export type MemberActivity = {
  id: string;
  name: string;
  avatarPath: string | null;
  role: string;
  customRoleKey: string | null;
  status: string;
  invitedAt: string;
  firstSignedInAt: string | null;
  lastSeenAt: string | null;
  lastActiveAt: string | null;
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
  openTasks: number;
  overdueTasks: number;
  done7d: number;
  dueDone30d: number;
  onTime30d: number;
  updates7d: number;
  lastUpdateAt: string | null;
};

export type FeedItem = {
  kind: "update" | "completed";
  at: string;
  memberId: string | null;
  taskId: number;
  taskTitle: string;
  body: string | null;
  dueAt: string | null;
};

/** Everyone on the team with presence, time and task numbers (Team activity section only). */
export async function getTeamActivity(): Promise<MemberActivity[]> {
  const { data, error } = await (await createClient()).rpc("get_team_activity");
  if (error) {
    console.error("[getTeamActivity]", error);
    throw new Error("Team activity could not be loaded. Refresh the page to try again.");
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.member_id as string,
    name: r.full_name as string,
    avatarPath: (r.avatar_path as string | null) ?? null,
    role: r.role as string,
    customRoleKey: (r.custom_role_key as string | null) ?? null,
    status: r.status as string,
    invitedAt: r.invited_at as string,
    firstSignedInAt: (r.first_signed_in_at as string | null) ?? null,
    lastSeenAt: (r.last_seen_at as string | null) ?? null,
    lastActiveAt: (r.last_active_at as string | null) ?? null,
    todaySeconds: Number(r.today_seconds ?? 0),
    weekSeconds: Number(r.week_seconds ?? 0),
    monthSeconds: Number(r.month_seconds ?? 0),
    openTasks: Number(r.open_tasks ?? 0),
    overdueTasks: Number(r.overdue_tasks ?? 0),
    done7d: Number(r.done_7d ?? 0),
    dueDone30d: Number(r.due_done_30d ?? 0),
    onTime30d: Number(r.on_time_30d ?? 0),
    updates7d: Number(r.updates_7d ?? 0),
    lastUpdateAt: (r.last_update_at as string | null) ?? null,
  }));
}

/** Latest task updates and completions across the team. */
export async function getTeamFeed(limit = 60): Promise<FeedItem[]> {
  const { data, error } = await (await createClient()).rpc("get_team_feed", { p_limit: limit });
  if (error) {
    console.error("[getTeamFeed]", error);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    kind: r.kind as FeedItem["kind"],
    at: r.at as string,
    memberId: (r.member_id as string | null) ?? null,
    taskId: Number(r.task_id),
    taskTitle: r.task_title as string,
    body: (r.body as string | null) ?? null,
    dueAt: (r.due_at as string | null) ?? null,
  }));
}

/** The signed-in person's own active time (shown on My account). */
export async function getMyActivity(): Promise<{ today: number; week: number; month: number }> {
  const { data, error } = await (await createClient()).rpc("get_my_activity");
  if (error) console.error("[getMyActivity]", error);
  const row = (data ?? [])[0] as { today_seconds?: number; week_seconds?: number; month_seconds?: number } | undefined;
  return { today: Number(row?.today_seconds ?? 0), week: Number(row?.week_seconds ?? 0), month: Number(row?.month_seconds ?? 0) };
}

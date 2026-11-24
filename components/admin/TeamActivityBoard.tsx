"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, MessageSquareText, Users } from "lucide-react";
import type { FeedItem, MemberActivity } from "@/lib/dashboard/getTeamActivity";
import { formatAgo, formatDuration, presenceOf, type Presence } from "@/lib/team/presence";
import { Avatar } from "@/components/admin/Avatar";
import { Card, EmptyState, StatCard } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const presenceStyle: Record<Presence, { dot: string; label: string; text: string }> = {
  online: { dot: "bg-emerald-500", label: "Online", text: "text-emerald-700" },
  away: { dot: "bg-amber-400", label: "Away", text: "text-amber-700" },
  offline: { dot: "bg-slate-300", label: "Offline", text: "text-slate-500" },
  invited: { dot: "border border-dashed border-slate-400 bg-white", label: "Invited", text: "text-slate-500" },
  inactive: { dot: "bg-slate-200", label: "No access", text: "text-slate-400" },
};

function presenceDetail(member: MemberActivity, presence: Presence, now: number) {
  if (presence === "online") return "Active now";
  if (presence === "away") return `Idle since ${formatAgo(member.lastActiveAt, now)}`;
  if (presence === "offline") return member.lastSeenAt ? `Last seen ${formatAgo(member.lastSeenAt, now)}` : "Not seen since tracking started";
  if (presence === "invited") return `Invited ${formatAgo(member.invitedAt, now)}, hasn't signed in yet`;
  return "Access removed";
}

function onTime(member: { dueDone30d: number; onTime30d: number }) {
  return member.dueDone30d ? Math.round((member.onTime30d / member.dueDone30d) * 100) : null;
}

export default function TeamActivityBoard({
  members,
  feed,
  roleNames,
  meId,
  now,
}: {
  members: MemberActivity[];
  feed: FeedItem[];
  roleNames: Record<string, string>;
  meId: string;
  /** Server time the data was loaded at (keeps "x min ago" consistent). */
  now: number;
}) {
  const router = useRouter();
  // Statuses change minute to minute: refresh quietly while the page is open.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [router]);

  const people = members.filter((m) => m.status !== "removed");
  // You are looking at this page, so you are online (your first heartbeat may land just after the data loads).
  const withPresence = people.map((m) => ({ ...m, presence: m.id === meId ? ("online" as Presence) : presenceOf(m, now) }));
  const order: Record<Presence, number> = { online: 0, away: 1, offline: 2, invited: 3, inactive: 4 };
  withPresence.sort((a, b) => order[a.presence] - order[b.presence] || a.name.localeCompare(b.name));

  const team = withPresence.filter((m) => m.id !== meId);
  const onlineCount = team.filter((m) => m.presence === "online" || m.presence === "away").length;
  const done7d = team.reduce((sum, m) => sum + m.done7d, 0);
  const overdue = team.reduce((sum, m) => sum + m.overdueTasks, 0);
  const due = team.reduce((sum, m) => sum + m.dueDone30d, 0);
  const onTimeAll = due ? Math.round((team.reduce((sum, m) => sum + m.onTime30d, 0) / due) * 100) : null;
  const nameOf = (id: string | null) => (id === meId ? "You" : people.find((p) => p.id === id)?.name ?? "Former team member");
  const roleOf = (m: MemberActivity) =>
    (m.customRoleKey && roleNames[m.customRoleKey]) || (m.role === "owner" ? "Super Admin" : m.role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Online now" value={`${onlineCount} of ${team.length}`} hint="Team members with the dashboard open" icon={Users} tone="green" />
        <StatCard label="Tasks done" value={String(done7d)} hint="Completed in the last 7 days" icon={CheckCircle2} tone="blue" href="/admin/tasks?view=done" />
        <StatCard label="On time" value={onTimeAll === null ? "—" : `${onTimeAll}%`} hint="Tasks with a due date, finished by it (30 days)" icon={Clock3} tone="orange" />
        <StatCard label="Overdue now" value={String(overdue)} hint="Open tasks past their due date" icon={Clock3} tone={overdue ? "red" : "neutral"} href="/admin/tasks?view=all" />
      </div>

      <Card title="Team" description="Updates every minute while this page is open." bodyClassName="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Person</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 text-right font-medium">Today</th>
              <th className="px-3 py-3 text-right font-medium">This week</th>
              <th className="px-3 py-3 text-right font-medium">Open</th>
              <th className="px-3 py-3 text-right font-medium">Overdue</th>
              <th className="px-3 py-3 text-right font-medium">Done (7d)</th>
              <th className="px-3 py-3 text-right font-medium">On time (30d)</th>
              <th className="px-5 py-3 font-medium">Last task update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {withPresence.map((m) => {
              const style = presenceStyle[m.presence];
              const rate = onTime(m);
              return (
                <tr key={m.id} className="align-middle">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative">
                        <Avatar name={m.name} path={m.avatarPath} size="md" />
                        <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white", style.dot)} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-900">{m.name}{m.id === meId ? " (you)" : ""}</span>
                        <span className="block truncate text-xs text-slate-500">{roleOf(m)}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("block font-semibold", style.text)}>{style.label}</span>
                    <span className="block text-xs text-slate-500">{presenceDetail(m, m.presence, now)}</span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{formatDuration(m.todaySeconds)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{formatDuration(m.weekSeconds)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{m.openTasks}</td>
                  <td className={cn("px-3 py-3 text-right tabular-nums", m.overdueTasks ? "font-semibold text-red-600" : "text-slate-700")}>{m.overdueTasks}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{m.done7d}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {rate === null ? <span className="text-slate-400">—</span> : (
                      <span className={cn("font-semibold", rate >= 80 ? "text-emerald-700" : rate >= 50 ? "text-amber-700" : "text-red-600")}>{rate}%</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {m.lastUpdateAt ? formatAgo(m.lastUpdateAt, now) : <span className="text-slate-400">No updates yet</span>}
                    {m.updates7d > 0 && <span className="block text-xs text-slate-400">{m.updates7d} this week</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card
        title="Latest updates"
        description="Progress notes and completed tasks from the whole team."
        action={<Link href="/admin/tasks?view=all" className="text-sm font-semibold text-brand-blue-700 hover:underline">Open tasks</Link>}
        bodyClassName="divide-y divide-slate-100"
      >
        {feed.length ? (
          <ol className="divide-y divide-slate-100">
            {feed.map((item, index) => {
              const person = people.find((p) => p.id === item.memberId);
              const late = item.kind === "completed" && item.dueAt && new Date(item.at) > new Date(item.dueAt);
              return (
                <li key={`${item.kind}-${item.taskId}-${item.at}-${index}`} className="flex gap-3 px-5 py-3">
                  {person ? <Avatar name={person.name} path={person.avatarPath} size="sm" /> : <span className="h-7 w-7 shrink-0 rounded-full bg-slate-100" aria-hidden="true" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">{nameOf(item.memberId)}</span>{" "}
                      {item.kind === "completed" ? "completed" : "updated"}{" "}
                      <span className="font-medium text-slate-900">{item.taskTitle}</span>
                      {item.kind === "completed" && (
                        <span className={cn("ml-2 rounded-full px-2 py-0.5 text-xs font-medium", late ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700")}>
                          {late ? "Late" : item.dueAt ? "On time" : "Done"}
                        </span>
                      )}
                    </p>
                    {item.body && <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">{item.body}</p>}
                    <p className="mt-1 text-xs text-slate-400">{formatAgo(item.at, now)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState icon={MessageSquareText} title="No updates yet" description="When the team posts progress on tasks or completes them, it shows up here." />
        )}
      </Card>

      <p className="text-xs leading-5 text-slate-500">
        Time counts only while the dashboard is open and being used (mouse, keyboard, touch or scroll in the last 5 minutes). Work done outside the dashboard, like calls or WhatsApp, isn&apos;t included,
        so judge results by tasks completed and on time. Team members can see their own time on My account.
      </p>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell, CalendarDays, Check, CheckCheck, ChevronRight, CreditCard,
  FileText, Users, UserRound, CircleDot,
} from "lucide-react";
import type { AdminNotification } from "@/lib/dashboard/getAdminNotifications";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/admin-notifications";

type Filter = "all" | "unread";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZone: "Africa/Accra",
  }).format(new Date(value));
}

export default function NotificationList({
  notifications,
  unreadCount,
}: {
  notifications: AdminNotification[];
  unreadCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(
    () => filter === "unread" ? notifications.filter((item) => !item.read) : notifications,
    [filter, notifications],
  );

  const categoryIcon = (category: AdminNotification["category"]) => {
    if (category === "payment") return CreditCard;
    if (category === "community") return Users;
    if (category === "booking") return CalendarDays;
    return FileText;
  };

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.025]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#c85f16]"><Bell className="h-[18px] w-[18px]" /></span>
            <div><h2 className="text-sm font-bold text-slate-950">Your notifications</h2><p className="mt-0.5 text-xs text-slate-500">{unreadCount} unread · Last 30 days</p></div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button type="button" onClick={() => setFilter("all")} aria-pressed={filter === "all"} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>All</button>
            <button type="button" onClick={() => setFilter("unread")} aria-pressed={filter === "unread"} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${filter === "unread" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Unread</button>
          </div>
          {unreadCount > 0 && <form action={markAllNotificationsRead}><button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1a3a9c]"><CheckCheck className="h-4 w-4" /> Mark all read</button></form>}
        </div>
      </div>

      {visible.length ? (
        <div className="divide-y divide-slate-100">
          {visible.map((item) => {
            const Icon = categoryIcon(item.category);
            return (
              <article key={item.key} className={`flex gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:gap-4 sm:px-6 ${item.read ? "bg-white" : "bg-[#fffdfa]"}`}>
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.category === "payment" ? "bg-emerald-50 text-emerald-700" : item.category === "community" ? "bg-violet-50 text-violet-700" : item.category === "booking" ? "bg-blue-50 text-[#1a3a9c]" : "bg-orange-50 text-[#c85f16]"}`}><Icon className="h-[18px] w-[18px]" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`text-sm ${item.read ? "font-semibold text-slate-700" : "font-bold text-slate-950"}`}>{item.title}</p>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-[#f47b20]" aria-label="Unread" />}
                  </div>
                  <p className="mt-1 text-xs leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                    <span>{formatDate(item.createdAt)}</span>
                    {item.actor && <span className="inline-flex items-center gap-1"><UserRound className="h-3 w-3" /> {item.actor}</span>}
                    <span className="capitalize">{item.category}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                  <Link href={item.href} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-[#1a3a9c] transition hover:bg-blue-50">Open <ChevronRight className="h-3.5 w-3.5" /></Link>
                  {!item.read && <form action={markNotificationRead}><input type="hidden" name="notificationKey" value={item.key} /><button type="submit" aria-label={`Mark ${item.title} as read`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><Check className="h-3 w-3" /> Read</button></form>}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><CircleDot className="h-5 w-5" /></span>
          <p className="mt-4 text-sm font-bold text-slate-800">{filter === "unread" ? "You’re all caught up" : "No notifications yet"}</p>
          <p className="mt-1 text-xs text-slate-400">{filter === "unread" ? "You have read all recent notifications." : "New booking, payment and team activity will appear here."}</p>
        </div>
      )}
      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6"><p className="text-[10px] text-slate-400">Notifications are generated from real TransVista records. Read status is private to your team account.</p></div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, CreditCard, MessageSquareText, CalendarDays, CalendarPlus,
  Users, Star, MessageSquareHeart, BarChart3, Settings, Menu, X, LogOut, Bell, Compass, ChevronRight,
  type LucideIcon,
  Sun, Moon, Monitor, ScrollText,
} from "lucide-react";
import { signOut } from "@/app/actions/signout";
import type { AdminArea } from "@/lib/auth/permissions";
import { Avatar } from "@/components/admin/Avatar";
import { setMyTheme } from "@/app/actions/account";
import { ADMIN_THEME_EVENT, isAdminTheme, type AdminTheme } from "@/lib/admin/theme";

type NavItem = { label: string; href: string; icon: LucideIcon; area: AdminArea };
type NavSection = { title: string | null; items: NavItem[] };

/**
 * The admin information architecture: five clear sections instead of a
 * flat list of twelve. Labels here are also the page titles and breadcrumbs.
 */
const sections: NavSection[] = [
  { title: null, items: [{ label: "Overview", href: "/admin", icon: LayoutDashboard, area: "dashboard" }] },
  {
    title: "Bookings",
    items: [
      { label: "Requests", href: "/admin/requests", icon: ClipboardList, area: "requests" },
      { label: "Payments", href: "/admin/payments", icon: CreditCard, area: "payments" },
      { label: "Messages", href: "/admin/messages", icon: MessageSquareText, area: "messages" },
    ],
  },
  {
    title: "Trips",
    items: [
      { label: "Departures", href: "/admin/trips", icon: CalendarDays, area: "departures" },
      { label: "Events", href: "/admin/events", icon: CalendarPlus, area: "events" },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "Community", href: "/admin/community", icon: Users, area: "community" },
      { label: "Reviews", href: "/admin/reviews", icon: Star, area: "reviews" },
      { label: "Feedback", href: "/admin/event-feedback", icon: MessageSquareHeart, area: "feedback" },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Reports", href: "/admin/analytics", icon: BarChart3, area: "analytics" },
      { label: "Audit log", href: "/admin/audit", icon: ScrollText, area: "audit" },
    ],
  },
];

const settingsItem: NavItem = { label: "Settings", href: "/admin/settings", icon: Settings, area: "settings" };

/** Pages reachable outside the sidebar (e.g. from the bell). */
const extraCrumbs: Record<string, { section: string | null; label: string }> = {
  "/admin/notifications": { section: null, label: "Notifications" },
  "/admin/account": { section: null, label: "My account" },
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

function breadcrumbFor(pathname: string): { section: string | null; label: string } {
  for (const section of sections) {
    const item = section.items.find((entry) => isActive(pathname, entry.href));
    if (item) return { section: section.title, label: item.label };
  }
  if (isActive(pathname, settingsItem.href)) return { section: null, label: settingsItem.label };
  const extra = Object.entries(extraCrumbs).find(([path]) => isActive(pathname, path));
  return extra?.[1] ?? { section: null, label: "Admin" };
}

export default function AdminShell({ roleLabel, areas, children, unreadCount = 0, me, theme: savedTheme = "system" }: Readonly<{ roleLabel: string; areas: AdminArea[]; children: React.ReactNode; unreadCount?: number; me: { name: string; avatarPath: string | null }; theme?: AdminTheme }>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const crumb = breadcrumbFor(pathname);
  const visibleSections = sections
    .map((section) => ({ ...section, items: section.items.filter((item) => areas.includes(item.area)) }))
    .filter((section) => section.items.length > 0);
  const canSeeSettings = areas.includes(settingsItem.area);

  // Theme: the saved preference, updated instantly when changed here or in My account.
  const [themeOverride, setThemeOverride] = useState<AdminTheme | null>(null);
  const theme = themeOverride ?? savedTheme;
  useEffect(() => {
    const onTheme = (event: Event) => {
      const value = (event as CustomEvent).detail;
      if (isAdminTheme(value)) setThemeOverride(value);
    };
    window.addEventListener(ADMIN_THEME_EVENT, onTheme);
    return () => window.removeEventListener(ADMIN_THEME_EVENT, onTheme);
  }, []);
  const nextTheme: Record<AdminTheme, AdminTheme> = { light: "dark", dark: "system", system: "light" };
  const themeLabels: Record<AdminTheme, string> = { light: "Light", dark: "Dark", system: "Match my device" };
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  function cycleTheme() {
    const value = nextTheme[theme];
    setThemeOverride(value);
    void setMyTheme(value);
  }

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const navLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active ? "bg-white/[0.12] text-white" : "text-brand-blue-100/70 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        {active && <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand-orange-500" />}
        <Icon aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${active ? "text-brand-orange-400" : "text-brand-blue-200/60 group-hover:text-white"}`} />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <button type="button" className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-blue-950 text-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange-600 text-white">
              <Compass className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-tight">TransVista</span>
              <span className="block text-xs text-brand-blue-200/60">Admin</span>
            </span>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-brand-blue-100/70 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2" aria-label="Primary">
          {visibleSections.map((section) => (
            <div key={section.title ?? "home"}>
              {section.title && (
                <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-brand-blue-200/40">{section.title}</p>
              )}
              <div className="space-y-0.5">{section.items.map(navLink)}</div>
            </div>
          ))}
        </nav>

        <div className="space-y-0.5 border-t border-white/10 px-3 py-3">
          {canSeeSettings && navLink(settingsItem)}
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-blue-100/70 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-400">
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Theme applies to the content area; the sidebar is always dark. */}
      <div className="admin-theme min-h-screen bg-slate-50 lg:pl-64" data-theme={theme}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
              {crumb.section && (
                <>
                  <span className="hidden text-slate-500 sm:inline">{crumb.section}</span>
                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" aria-hidden="true" />
                </>
              )}
              <span className="truncate font-semibold text-slate-900">{crumb.label}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${themeLabels[theme]} (click for ${themeLabels[nextTheme[theme]]})`}
              aria-label={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme[theme]]}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ThemeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <Link
              href="/admin/notifications"
              aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                isActive(pathname, "/admin/notifications") ? "border-brand-blue-200 bg-brand-blue-50 text-brand-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-brand-orange-600 px-1 text-[11px] font-bold leading-none text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/account"
              aria-label={`My account: ${me.name}, ${roleLabel}`}
              className={`flex items-center gap-2 rounded-lg border py-1 pl-1 pr-1 transition-colors sm:pr-3 ${
                isActive(pathname, "/admin/account") ? "border-brand-blue-200 bg-brand-blue-50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Avatar name={me.name} path={me.avatarPath} size="sm" />
              <span className="hidden min-w-0 text-left leading-tight sm:block">
                <span className="block max-w-[140px] truncate text-xs font-semibold text-slate-800">{me.name}</span>
                <span className="block text-xs text-slate-500">{roleLabel}</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

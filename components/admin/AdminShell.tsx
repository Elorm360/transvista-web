"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, CreditCard, MessageSquareText,
  BarChart3, Settings, Menu, X, LogOut, ChevronRight, Compass,
} from "lucide-react";
import { signOut } from "@/app/actions/signout";
import { canAccess, formatAdminRole, type AdminArea, type AdminRole } from "@/lib/auth/permissions";

const sidebarItems: { label: string; href: string; icon: typeof LayoutDashboard; area: AdminArea; group: string }[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, area: "dashboard", group: "WORKSPACE" },
  { label: "Booking requests", href: "/admin/requests", icon: ClipboardList, area: "requests", group: "OPERATIONS" },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, area: "payments", group: "OPERATIONS" },
  { label: "Messages", href: "/admin/messages", icon: MessageSquareText, area: "requests", group: "OPERATIONS" },
  { label: "Community", href: "/admin/community", icon: Users, area: "community", group: "PEOPLE" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, area: "analytics", group: "INSIGHTS" },
  { label: "Settings", href: "/admin/settings", icon: Settings, area: "settings", group: "PREFERENCES" },
];

const pageNames: Record<string, string> = {
  "/admin": "Overview",
  "/admin/requests": "Booking requests",
  "/admin/payments": "Payments",
  "/admin/messages": "Messages",
  "/admin/community": "Community",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export default function AdminShell({ role, children }: Readonly<{ role: AdminRole; children: React.ReactNode }>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const visibleItems = sidebarItems.filter((item) => canAccess(role, item.area));
  const currentPage = Object.entries(pageNames).find(([path]) => path === "/admin" ? pathname === path : pathname === path || pathname.startsWith(path + "/"))?.[1] ?? "Workspace";
  const groupedItems = [...new Set(visibleItems.map((item) => item.group))];

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-slate-900">
      {sidebarOpen && <button type="button" className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-white/10 bg-[#111c36] text-white shadow-2xl shadow-slate-950/10 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f47b20] text-white shadow-sm"><Compass className="h-5 w-5" /><span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-[#101d3e] bg-white" /></span>
            <span><span className="block text-[15px] font-bold tracking-tight text-white">TransVista</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/70">Africa · Admin</span></span>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-blue-100/70 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Primary navigation">
          {groupedItems.map((group) => (
            <div key={group} className="mb-7">
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-blue-200/45">{group}</p>
              <div className="space-y-1">
                {visibleItems.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(item.href + "/");
                  return <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${active ? "bg-white text-[#142b65] shadow-lg shadow-slate-950/10" : "text-blue-50/75 hover:bg-white/[0.08] hover:text-white"}`}>
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#f47b20]" : "text-blue-200/65 group-hover:text-white"}`} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight className="h-4 w-4 text-[#f47b20]" />}
                  </Link>;
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-[11px] font-semibold text-blue-50/90">Team workspace</span></div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-blue-100/45">Secure access based on your assigned role.</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-blue-100/70 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
              <LogOut className="h-[18px] w-[18px]" /> Sign out
            </button>
          </form>
          <p className="mt-3 px-3 text-[10px] text-blue-100/35">TransVista Africa · Admin workspace</p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-[#fffefa]/95 px-4 backdrop-blur-md sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">TransVista Africa</p><h1 className="mt-0.5 truncate text-[15px] font-bold tracking-tight text-slate-900 sm:text-base">{currentPage}</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-xs font-semibold text-slate-800">{formatAdminRole(role)}</p><p className="mt-0.5 text-[10px] text-slate-400">Access level</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-sm font-bold text-[#c85f16]">{formatAdminRole(role).charAt(0)}</div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-76px)] px-4 py-7 sm:px-7 sm:py-8 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}

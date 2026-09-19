"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CarFront,
  MessageSquareText,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/actions/signout";
import {
  canAccess,
  formatAdminRole,
  type AdminArea,
  type AdminRole,
} from "@/lib/auth/permissions";

const sidebarItems: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  area: AdminArea;
}[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, area: "dashboard" },
  { label: "Community", href: "/admin/community", icon: Users, area: "community" },
  { label: "Requests", href: "/admin/requests", icon: ClipboardList, area: "requests" },
  { label: "Drivers", href: "/admin/driver-applications", icon: CarFront, area: "requests" },
  { label: "Messages", href: "/admin/messages", icon: MessageSquareText, area: "requests" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, area: "analytics" },
  { label: "Settings", href: "/admin/settings", icon: Settings, area: "settings" },
];

/**
 * AdminShell
 *
 * Client-side admin chrome — sidebar navigation, top bar, responsive
 * mobile drawer, and the sign-out action. This is rendered only after
 * the server-side guard in `app/admin/layout.tsx` has confirmed the
 * user is an active team member. Menu items are filtered by role;
 * each page still enforces the same rule on the server.
 */
export default function AdminShell({
  role,
  children,
}: Readonly<{
  role: AdminRole;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const visibleItems = sidebarItems.filter((item) =>
    canAccess(role, item.area),
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin Navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/admin" className="text-lg font-bold text-slate-900">
            TransVista Admin
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Primary Navigation">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-slate-200 px-6 py-4">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-200 ease-out hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
          <p className="text-xs text-slate-400">
            TransVista Admin v0.1.0
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-900">
              TransVista Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {formatAdminRole(role).charAt(0)}
            </div>
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              {formatAdminRole(role)}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

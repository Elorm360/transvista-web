"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/actions/signout";
import type { AdminRole } from "@/lib/auth/isAdmin";

const sidebarItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["owner", "admin", "community_manager", "support"] as AdminRole[],
  },
  {
    label: "Community",
    href: "/admin/community",
    icon: Users,
    roles: ["owner", "admin", "community_manager", "support"] as AdminRole[],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["owner", "admin"] as AdminRole[],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["owner"] as AdminRole[],
  },
];

/**
 * AdminShell
 *
 * Client-side admin chrome — sidebar navigation, top bar, responsive
 * mobile drawer, and the sign-out action. This is rendered only after
 * the server-side guard in `app/admin/layout.tsx` has confirmed the
 * user is authenticated AND authorized.
 */
export default function AdminShell({
  children,
  role,
}: Readonly<{
  children: React.ReactNode;
  role: AdminRole;
}>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin Navigation"
      >
        {/* Logo / Brand */}
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

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Primary Navigation">
          {sidebarItems
            .filter((item) => item.roles.includes(role))
            .map((item) => {
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

        {/* Footer */}
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

      {/* ── Main Area ── */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
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
              A
            </div>
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              Administrator
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}


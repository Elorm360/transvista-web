import { LayoutDashboard, Users, Globe, Tags, CalendarDays } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import RecentMembers from "@/components/admin/RecentMembers";
import { getDashboardStats, getRecentMembers } from "@/lib/dashboard/getDashboardStats";

// Always fetch fresh data from Supabase — never serve a statically
// generated snapshot of the dashboard.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentMembers] = await Promise.all([
    getDashboardStats(),
    getRecentMembers(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={LayoutDashboard}
        title="Welcome back 👋"
        description="Community Overview"
      />

      {/* Stat Cards Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Members"
          value={stats.totalMembers}
        />
        <StatCard
          icon={Globe}
          title="Countries"
          value={stats.distinctCountries}
        />
        <StatCard
          icon={Tags}
          title="Interest Categories"
          value={stats.distinctInterests}
        />
        <StatCard
          icon={CalendarDays}
          title="Joined This Week"
          value={stats.joinedThisWeek}
        />
      </div>

      {/* Recent Members */}
      <RecentMembers members={recentMembers} />
    </div>
  );
}

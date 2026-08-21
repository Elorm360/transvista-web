import { BarChart3, Users, Globe, TrendingUp } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import {
  getGrowthData,
  getCountryDistribution,
  getInterestBreakdown,
  getAnalyticsKpis,
} from "@/lib/dashboard/getAnalytics";
import ChartCard from "@/components/admin/ChartCard";
import KpiCard from "@/components/admin/KpiCard";
import GrowthChart from "@/components/admin/charts/GrowthChart";
import CountryDistributionChart from "@/components/admin/charts/CountryDistributionChart";
import InterestBreakdownChart from "@/components/admin/charts/InterestBreakdownChart";
import { requireAdminAccess } from "@/lib/auth/requireAdminAccess";

// Always fetch fresh data — analytics should never be stale.
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdminAccess("analytics");

  const [growthData, countries, interests, kpis] = await Promise.all([
    getGrowthData(30),
    getCountryDistribution(5),
    getInterestBreakdown(),
    getAnalyticsKpis(30),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={BarChart3}
        title="Analytics"
        description="Track community growth, sign-up trends, and geographic insights."
      />

      {/* KPI Summary Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <KpiCard
          label="New Members (30 Days)"
          value={kpis.newMembers30d}
          icon={Users}
        />
        <KpiCard
          label="Fastest Growing Country"
          value={kpis.fastestGrowingCountry}
          icon={Globe}
        />
        <KpiCard
          label="Most Common Interest"
          value={kpis.mostCommonInterest}
          icon={TrendingUp}
        />
      </div>

      {/* Charts — Desktop: 2-col grid, Mobile: stacked */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Members Growth" subtitle="Daily sign-ups (last 30 days)">
          <GrowthChart data={growthData} />
        </ChartCard>

        <ChartCard title="Country Distribution" subtitle="Top countries by member count">
          <CountryDistributionChart data={countries} />
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Interest Breakdown" subtitle="Members grouped by interest">
          <InterestBreakdownChart data={interests} />
        </ChartCard>
      </div>
    </div>
  );
}

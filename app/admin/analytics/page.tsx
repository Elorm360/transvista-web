import { BarChart3, Users, Globe, TrendingUp, ClipboardList, Clock3, CreditCard, Wallet } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/server";
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
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";
const money=(amount:number)=>new Intl.NumberFormat("en-GH",{style:"currency",currency:"GHS",maximumFractionDigits:2}).format(amount);

export default async function AdminAnalyticsPage() {
  await requireAdminArea("analytics");
  const supabase=await createClient();
  const [growthData,countries,interests,kpis,operations]=await Promise.all([
    getGrowthData(30),getCountryDistribution(5),getInterestBreakdown(),getAnalyticsKpis(30),
    supabase.rpc("get_admin_operations_summary")
  ]);
  if(operations.error) console.error("[AdminAnalytics] Operations summary unavailable:",operations.error);
  const ops=operations.data?.[0];

  return <div className="mx-auto max-w-6xl">
    <PageHeader icon={BarChart3} title="Analytics" description="Understand community growth alongside bookings and payment performance." />
    <section className="mb-8">
      <div className="mb-4"><h2 className="text-base font-bold text-slate-950">Travel operations</h2><p className="mt-1 text-sm text-slate-500">Live booking and Ghana cedi payment totals across group and custom trip requests.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total booking requests" value={ops?ops.total_requests:"—"} icon={ClipboardList}/>
        <KpiCard label="Needs team attention" value={ops?ops.attention_requests:"—"} icon={Clock3}/>
        <KpiCard label="GHS payments received" value={ops?money(Number(ops.ghs_received)):"—"} icon={CreditCard}/>
        <KpiCard label="GHS outstanding balance" value={ops?money(Number(ops.ghs_outstanding)):"—"} icon={Wallet}/>
      </div>
      {operations.error?<p className="mt-3 text-xs text-amber-700">Operational totals are temporarily unavailable. Please use the Payments and Requests workspaces to review records.</p>:null}
    </section>
    <section>
      <div className="mb-4"><h2 className="text-base font-bold text-slate-950">Community growth</h2><p className="mt-1 text-sm text-slate-500">Sign-up trends, geographic reach and member interests.</p></div>
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <KpiCard label="New Members (30 Days)" value={kpis.newMembers30d} icon={Users}/>
        <KpiCard label="Fastest Growing Country" value={kpis.fastestGrowingCountry} icon={Globe}/>
        <KpiCard label="Most Common Interest" value={kpis.mostCommonInterest} icon={TrendingUp}/>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Members Growth" subtitle="Daily sign-ups (last 30 days)"><GrowthChart data={growthData}/></ChartCard>
        <ChartCard title="Country Distribution" subtitle="Top countries by member count"><CountryDistributionChart data={countries}/></ChartCard>
      </div>
      <div className="mt-6"><ChartCard title="Interest Breakdown" subtitle="Members grouped by interest"><InterestBreakdownChart data={interests}/></ChartCard></div>
    </section>
  </div>;
}

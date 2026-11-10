import { BarChart3, Users, Globe, TrendingUp, ClipboardList, Clock3, Percent, CalendarCheck, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { getGrowthData, getCountryDistribution, getInterestBreakdown, getAnalyticsKpis } from "@/lib/dashboard/getAnalytics";
import { getBusinessIntelligence } from "@/lib/dashboard/getBusinessIntelligence";
import { BookingTrendChart, BusinessBarChart } from "@/components/admin/BusinessIntelligenceCharts";
import ChartCard from "@/components/admin/ChartCard";
import KpiCard from "@/components/admin/KpiCard";
import GrowthChart from "@/components/admin/charts/GrowthChart";
import CountryDistributionChart from "@/components/admin/charts/CountryDistributionChart";
import InterestBreakdownChart from "@/components/admin/charts/InterestBreakdownChart";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";
const money = (currency: string, amount: number) => {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-GH", { maximumFractionDigits: 2 })}`;
  }
};

const rangeOptions = [
  { value: "7", label: "7 days", days: 7 },
  { value: "30", label: "30 days", days: 30 },
  { value: "90", label: "90 days", days: 90 },
  { value: "365", label: "12 months", days: 365 },
  { value: "all", label: "All time", days: null },
] as const;

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdminArea("analytics");
  const params = await searchParams;
  const selectedRange = rangeOptions.find((option) => option.value === params.range) ?? rangeOptions[1];
  const days = selectedRange.days;

  const [business, growthData, countries, interests, kpis] = await Promise.all([
    getBusinessIntelligence(days),
    getGrowthData(30),
    getCountryDistribution(5),
    getInterestBreakdown(),
    getAnalyticsKpis(30),
  ]);

  const firstResponse = business.averageFirstResponseHours === null
    ? "—"
    : business.averageFirstResponseHours < 1
      ? `${Math.round(business.averageFirstResponseHours * 60)} min`
      : `${business.averageFirstResponseHours.toFixed(1)} hrs`;

  return <div className="mx-auto max-w-7xl">
    <PageHeader icon={BarChart3} title="Business Intelligence" description="Understand booking performance, payment position, trip demand and team workload using TransVista's recorded data." />

    <form method="get" action="/admin/analytics" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div><p className="text-sm font-bold text-slate-900">Reporting period</p><p className="mt-1 text-xs text-slate-500">Booking and operational metrics use the selected booking creation date range.</p></div>
      <div className="flex items-center gap-2">
        <select name="range" defaultValue={selectedRange.value} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
          {rangeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button type="submit" className="h-10 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800">Apply</button>
      </div>
    </form>

    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="text-base font-bold text-slate-950">Booking performance</h2><p className="mt-1 text-sm text-slate-500">{business.rangeLabel} · excludes archived records</p></div>
        <span className="text-xs text-slate-400">Based on actual booking records</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Booking requests" value={business.totalBookings} icon={ClipboardList}/>
        <KpiCard label="Confirmed bookings" value={business.confirmedBookings} icon={CalendarCheck}/>
        <KpiCard label="Booking conversion" value={`${business.conversionRate.toFixed(1)}%`} icon={Percent}/>
        <KpiCard label="Cancelled bookings" value={business.cancelledBookings} icon={Clock3}/>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Cancellation rate" value={`${business.cancellationRate.toFixed(1)}%`} icon={TrendingUp}/>
        <KpiCard label="Average first team action" value={firstResponse} icon={Clock3}/>
        <KpiCard label="Upcoming confirmed trips" value={business.upcomingTrips} icon={CalendarCheck}/>
        <KpiCard label="Trips marked ready" value={business.tripsReady} icon={CheckCircle2}/>
      </div>
    </section>

    <section className="mb-8 grid gap-6 xl:grid-cols-2">
      <ChartCard title="Booking trend" subtitle="Requests received compared with bookings confirmed">
        <BookingTrendChart data={business.trend}/>
      </ChartCard>
      <ChartCard title="Booking status" subtitle="Current booking status within the selected period">
        <BusinessBarChart data={business.statuses}/>
      </ChartCard>
      <ChartCard title="Most requested trips" subtitle="Group-trip packages and custom-trip destinations">
        <BusinessBarChart data={business.topTrips}/>
      </ChartCard>
      <ChartCard title="Booking source" subtitle="Group-trip reservations compared with custom trip requests">
        <BusinessBarChart data={business.sources}/>
      </ChartCard>
    </section>

    <section className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <ChartCard title="Payment position by currency" subtitle="Cancelled and closed bookings are excluded from the outstanding balance.">
        {business.currencies.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400"><th className="pb-3">Currency</th><th className="pb-3 text-right">Quoted</th><th className="pb-3 text-right">Received</th><th className="pb-3 text-right">Outstanding</th><th className="pb-3 text-right">Bookings</th></tr></thead>
              <tbody>{business.currencies.map((item) => <tr key={item.currency} className="border-b border-slate-50 last:border-0"><td className="py-3 font-bold text-slate-800">{item.currency}</td><td className="py-3 text-right text-slate-600">{money(item.currency,item.quoted)}</td><td className="py-3 text-right font-semibold text-emerald-700">{money(item.currency,item.received)}</td><td className="py-3 text-right font-semibold text-amber-700">{money(item.currency,item.outstanding)}</td><td className="py-3 text-right text-slate-600">{item.bookings}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="py-12 text-center text-sm text-slate-400">No quoted booking values are available for this period.</p>}
      </ChartCard>
      <ChartCard title="Trip preparation" subtitle="Upcoming confirmed trips based on their recorded travel dates">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Needs preparation</p><p className="mt-2 text-2xl font-bold text-amber-700">{business.tripsNeedingPreparation}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Ready / underway</p><p className="mt-2 text-2xl font-bold text-emerald-700">{business.tripsReady}</p></div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">A trip is counted as ready when its operations record is marked Ready or Underway. This does not imply that a driver or vehicle has been assigned.</p>
        <p className="mt-3 text-xs text-slate-500">Response-time coverage: {business.responseCoverage.toFixed(0)}% of bookings have a recorded first team action.</p>
      </ChartCard>
    </section>

    <section className="mb-8">
      <ChartCard title="Group-trip payment reconciliation" subtitle="Compares booking-level amount received with verified ledger entries for the same group-trip bookings.">
        {business.paymentReconciliation.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="pb-3">Currency</th><th className="pb-3 text-right">Booking records</th><th className="pb-3 text-right">Verified ledger</th><th className="pb-3 text-right">New payments</th><th className="pb-3 text-right">Opening balances</th><th className="pb-3 text-right">Adjustments</th><th className="pb-3 text-right">Difference</th>
              </tr></thead>
              <tbody>{business.paymentReconciliation.map((item) => <tr key={item.currency} className="border-b border-slate-50 last:border-0">
                <td className="py-3 font-bold text-slate-800">{item.currency}</td>
                <td className="py-3 text-right text-slate-600">{money(item.currency,item.bookingAmountPaid)}</td>
                <td className="py-3 text-right font-semibold text-slate-800">{money(item.currency,item.verifiedLedgerTotal)}</td>
                <td className="py-3 text-right text-slate-600">{money(item.currency,item.paymentEntries)}</td>
                <td className="py-3 text-right text-slate-600">{money(item.currency,item.openingBalances)}</td>
                <td className="py-3 text-right text-slate-600">{money(item.currency,item.adjustments)}</td>
                <td className={`py-3 text-right font-bold ${Math.abs(item.difference) > 0.01 ? "text-amber-700" : "text-emerald-700"}`}>{money(item.currency,item.difference)}</td>
              </tr>)}</tbody>
            </table>
            <p className="mt-3 text-xs leading-5 text-slate-500">Verified ledger totals include payment entries, opening balances and adjustments. Differences are flagged for review only; this report never changes booking or ledger amounts. Custom-trip payments are not included in this group-trip ledger comparison.</p>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-900">Bookings requiring reconciliation</h3><span className="text-xs font-semibold text-slate-500">{business.paymentMismatches.length} difference{business.paymentMismatches.length === 1 ? "" : "s"}</span></div>
              {business.paymentMismatches.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[580px] text-left text-xs">
                    <thead><tr className="border-b border-slate-100 uppercase tracking-wide text-slate-400"><th className="pb-2">Booking reference</th><th className="pb-2 text-right">Booking record</th><th className="pb-2 text-right">Verified ledger</th><th className="pb-2 text-right">Difference</th></tr></thead>
                    <tbody>{business.paymentMismatches.map((item) => <tr key={item.reference} className="border-b border-slate-50 last:border-0"><td className="py-3 font-semibold text-blue-700">{item.reference}<span className="ml-2 font-normal text-slate-400">{item.ledgerEntries} ledger entries</span></td><td className="py-3 text-right text-slate-600">{money(item.currency,item.bookingAmountPaid)}</td><td className="py-3 text-right text-slate-600">{money(item.currency,item.verifiedLedgerTotal)}</td><td className="py-3 text-right font-bold text-amber-700">{money(item.currency,item.difference)}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : <p className="rounded-lg bg-emerald-50 px-3 py-3 text-xs font-medium text-emerald-800">No booking-to-ledger differences were found in this period.</p>}
            </div>
          </div>
        ) : <p className="py-10 text-center text-sm text-slate-400">No group-trip payment ledger entries are available for this reporting period.</p>}
      </ChartCard>
    </section>

    <section className="mb-10">
      <ChartCard title="Team workload" subtitle="Booking ownership and confirmed bookings in the selected period">
        {business.teamWorkload.length ? <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400"><th className="pb-3">Team member</th><th className="pb-3 text-right">Bookings</th><th className="pb-3 text-right">Confirmed</th></tr></thead><tbody>{business.teamWorkload.map((item) => <tr key={item.name} className="border-b border-slate-50 last:border-0"><td className="py-3 font-semibold text-slate-800">{item.name}</td><td className="py-3 text-right text-slate-600">{item.bookings}</td><td className="py-3 text-right text-slate-600">{item.confirmedBookings}</td></tr>)}</tbody></table></div> : <p className="py-10 text-center text-sm text-slate-400">No booking ownership data is available.</p>}
      </ChartCard>
    </section>

    <section>
      <div className="mb-4"><h2 className="text-base font-bold text-slate-950">Community growth</h2><p className="mt-1 text-sm text-slate-500">Waitlist sign-ups, geographic reach and member interests.</p></div>
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <KpiCard label="New Members (30 Days)" value={kpis.newMembers30d} icon={Users}/>
        <KpiCard label="Leading member country" value={kpis.fastestGrowingCountry} icon={Globe}/>
        <KpiCard label="Most common interest" value={kpis.mostCommonInterest} icon={TrendingUp}/>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Members Growth" subtitle="Daily sign-ups (last 30 days)"><GrowthChart data={growthData}/></ChartCard>
        <ChartCard title="Country Distribution" subtitle="Top countries by member count"><CountryDistributionChart data={countries}/></ChartCard>
      </div>
      <div className="mt-6"><ChartCard title="Interest Breakdown" subtitle="Members grouped by interest"><InterestBreakdownChart data={interests}/></ChartCard></div>
    </section>
  </div>;
}


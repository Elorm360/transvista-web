import Link from "next/link";
import {
  ClipboardList, CreditCard, Users, Clock3, Wallet, CalendarDays, ChevronRight, CircleAlert,
  AlertTriangle, UserRoundPlus, BellRing, ArrowRight, CalendarClock, BadgeCheck,
} from "lucide-react";
import { buttonClass, Card, EmptyState, StatCard, StatusBadge } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { canAccess } from "@/lib/auth/permissions";
import { loadTravelRequests, type TravelRequestRecord } from "@/lib/dashboard/getTravelRequests";
import { attentionReasons, balanceDue, bookingTotals, RESPONSE_WINDOW_MS } from "@/lib/admin/bookingHealth";

export const dynamic = "force-dynamic";
const money = (amount: number) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(amount);

type RecentBooking = { id: string; reference: string; full_name: string; description: string; amount_paid: number; currency: string; status: string; created_at: string };
type LeadRow = { id: number; full_name: string; interest: string | null; created_at: string };
type ActionItem = {
  key: string; reference: string; name: string; description: string; reason: string;
  href: string; severity: "urgent" | "attention" | "normal"; dueAt: string;
  action: string; icon: typeof AlertTriangle;
};
type ActionSummary = { urgent: number; paymentOverdue: number; unassigned: number; total: number };

const ACTION_LIMIT = 8;

/** One queue entry per reason a booking needs attention (rules live in lib/admin/bookingHealth). */
function buildActionItems(records: TravelRequestRecord[], now: Date): { items: ActionItem[]; summary: ActionSummary } {
  const items: ActionItem[] = [];
  const nowMs = now.getTime();

  for (const r of records) {
    const reasons = attentionReasons(r, now);
    if (!reasons.length) continue;
    const base = { reference: r.reference, name: r.fullName, description: r.summary, href: `/admin/requests?open=${encodeURIComponent(r.id)}` };
    const pastWindow = nowMs - new Date(r.createdAt).getTime() > RESPONSE_WINDOW_MS;

    for (const reason of reasons) {
      if (reason === "unassigned") {
        items.push({ ...base, key: `${r.id}-assign`, reason: pastWindow ? "Unassigned · response window exceeded" : "Waiting for a team owner", severity: pastWindow ? "urgent" : "normal", dueAt: r.createdAt, action: "Assign request", icon: UserRoundPlus });
      } else if (reason === "no-response") {
        items.push({ ...base, key: `${r.id}-sla`, reason: "Still awaiting a response after 48 hours", severity: "urgent", dueAt: r.createdAt, action: "Review request", icon: BellRing });
      } else if (reason === "follow-up-overdue") {
        items.push({ ...base, key: `${r.id}-followup`, reason: "Scheduled follow-up is overdue", severity: "urgent", dueAt: r.followUpAt ?? r.createdAt, action: "Follow up", icon: CalendarClock });
      } else if (reason === "payment-overdue") {
        items.push({ ...base, key: `${r.id}-payment`, reason: `Payment deadline passed · ${r.quoteCurrency ?? "GHS"} ${balanceDue(r).toFixed(2)} outstanding`, severity: "attention", dueAt: r.paymentDueAt ?? r.createdAt, action: "Review payment", icon: CreditCard });
      }
    }
  }

  // Count from the full list, before trimming to what fits on screen.
  const summary: ActionSummary = {
    urgent: items.filter((i) => i.severity === "urgent").length,
    paymentOverdue: items.filter((i) => i.key.endsWith("-payment")).length,
    unassigned: items.filter((i) => i.key.endsWith("-assign")).length,
    total: items.length,
  };

  const rank = { urgent: 0, attention: 1, normal: 2 };
  items.sort((a, b) => rank[a.severity] - rank[b.severity] || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  return { items: items.slice(0, ACTION_LIMIT), summary };
}

export default async function AdminDashboardPage() {
  const { role } = await requireAdminArea("dashboard");
  const canSeeOperations = canAccess(role, "requests");
  const canSeeCommunity = canAccess(role, "community");
  const canSeeAnalytics = canAccess(role, "analytics");
  const supabase = await createClient();
  let totals: ReturnType<typeof bookingTotals> | null = null;
  let latest: RecentBooking[] = [];
  let recentLeads: LeadRow[] = [];
  let actionItems: ActionItem[] = [];
  let actionSummary: ActionSummary = { urgent: 0, paymentOverdue: 0, unassigned: 0, total: 0 };
  let loadError = false;

  if (canSeeOperations) {
    const now = new Date();
    const { requests, loadError: failed } = await loadTravelRequests();
    loadError = failed;
    if (!failed) totals = bookingTotals(requests, now);
    ({ items: actionItems, summary: actionSummary } = buildActionItems(requests, now));
    latest = requests
      .filter((r) => !r.archivedAt)
      .slice(0, 6)
      .map((r) => ({ id: r.id, reference: r.reference, full_name: r.fullName, description: r.summary, amount_paid: r.amountPaid, currency: r.quoteCurrency ?? "GHS", status: r.status, created_at: r.createdAt }));
  }

  if (canSeeCommunity) {
    const { data, error } = await supabase.from("leads").select("id,full_name,interest,created_at").order("created_at", { ascending: false }).limit(5);
    if (error) console.error("[AdminDashboard] Community sign-ups unavailable:", error);
    recentLeads = (data ?? []) as LeadRow[];
  }

  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Accra" }).format(new Date());
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Africa/Accra" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const taskLine = actionSummary.total
    ? `${actionSummary.total} task${actionSummary.total === 1 ? " needs" : "s need"} attention`
    : "Nothing needs attention right now";

  return <div className="mx-auto max-w-[1400px] space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{greeting}</h1>
        <p className="mt-1 text-sm text-slate-500">{today}{canSeeOperations ? ` · ${taskLine}` : ""}</p>
      </div>
      {canSeeOperations && <Link href="/admin/requests" className={buttonClass("primary")}>Open requests <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
    </div>

    {loadError && <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Bookings could not be loaded right now, so these totals are unavailable. Refresh the page to try again.</div>}
    {totals && totals.stalePastTrips > 0 && <Link href="/admin/requests?view=past-open" className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" /><span><strong className="font-semibold text-slate-900">{totals.stalePastTrips} booking{totals.stalePastTrips === 1 ? " is" : "s are"} still open for trips that have already happened.</strong> Mark them completed or cancelled so they stop affecting your numbers. <span className="font-semibold text-brand-blue-700">Review them →</span></span></Link>}

    {canSeeOperations && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Needs attention" value={totals ? String(totals.needsAttention) : "—"} hint="Upcoming bookings with an open task" icon={Clock3} tone="orange" href="/admin/requests?view=attention" />
      <StatCard label="Upcoming trips" value={totals ? String(totals.open) : "—"} hint="Open bookings not yet travelled" icon={CalendarDays} tone="blue" href="/admin/requests" />
      <StatCard label="Received" value={totals ? money(totals.receivedGhs) : "—"} hint="Recorded on bookings (GHS)" icon={Wallet} tone="green" href="/admin/payments" />
      <StatCard label="Outstanding" value={totals ? money(totals.outstandingGhs) : "—"} hint="Still owed on upcoming trips" icon={CreditCard} tone="neutral" />
    </div>}

    <div className={canSeeOperations ? "grid gap-6 lg:grid-cols-3" : "grid gap-6 lg:grid-cols-2"}>
      {canSeeOperations && <div className="lg:col-span-2"><TaskList items={actionItems} summary={actionSummary} loadError={loadError} /></div>}

      <div className="space-y-6">
        {canSeeOperations && <Card title="Latest bookings" action={<Link href="/admin/requests" className={buttonClass("ghost", "px-2 py-1")}>View all</Link>} bodyClassName="divide-y divide-slate-100">
          {latest.map((b) => <Link key={b.id} href={`/admin/requests?open=${encodeURIComponent(b.id)}`} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
            <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{b.full_name}</span><span className="block truncate text-xs text-slate-500">{b.description} · {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></span>
            <StatusBadge status={b.status} />
          </Link>)}
          {!latest.length && <EmptyState icon={ClipboardList} title="No bookings yet" description="New trip requests and group bookings will appear here." />}
        </Card>}

        {canSeeCommunity && <Card title="New community members" action={<Link href="/admin/community" className={buttonClass("ghost", "px-2 py-1")}>View all</Link>} bodyClassName="divide-y divide-slate-100">
          {recentLeads.map((l) => <div key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange-50 text-xs font-semibold text-brand-orange-800">{l.full_name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{l.full_name}</span><span className="block truncate text-xs text-slate-500">{l.interest ?? "Community member"}</span></span></div>
            <span className="shrink-0 text-xs text-slate-500">{new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
          </div>)}
          {!recentLeads.length && <EmptyState icon={Users} title="No recent sign-ups" />}
        </Card>}

        {canSeeAnalytics && <Link href="/admin/analytics" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">View reports <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" /></Link>}
      </div>
    </div>
  </div>;
}

/** "Needs attention" list: the most urgent tasks first, each linking to its booking. */
function TaskList({ items, summary, loadError }: { items: ActionItem[]; summary: ActionSummary; loadError: boolean }) {
  return <Card
    title="Needs attention"
    description={summary.total > items.length ? `Showing the ${items.length} most urgent of ${summary.total}` : "Follow-ups, unassigned requests and missed payment deadlines"}
    action={summary.total > items.length ? <Link href="/admin/requests?view=attention" className={buttonClass("ghost", "px-2 py-1")}>See all {summary.total}</Link> : undefined}
    bodyClassName="divide-y divide-slate-100"
  >
    {summary.total > 0 && <div className="flex flex-wrap gap-2 px-5 py-3">
      <SummaryChip label="Urgent" value={summary.urgent} tone="red" />
      <SummaryChip label="Payment overdue" value={summary.paymentOverdue} tone="orange" />
      <SummaryChip label="Unassigned" value={summary.unassigned} tone="blue" />
    </div>}
    {loadError ? <div role="status" className="flex items-center gap-3 px-5 py-8 text-sm text-amber-800"><CircleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />Tasks could not be loaded. Refresh the page to try again.</div>
      : items.length ? items.map((item) => {
        const Icon = item.icon;
        const tone = item.severity === "urgent" ? "bg-red-50 text-red-700" : item.severity === "attention" ? "bg-brand-orange-50 text-brand-orange-800" : "bg-brand-blue-50 text-brand-blue-700";
        return <Link key={item.key} href={item.href} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-2"><span className="text-sm font-medium text-slate-900">{item.name}</span><span className="text-xs text-slate-500">{item.reference}</span></span>
            <span className="block truncate text-sm text-slate-600">{item.reason}</span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-blue-700 sm:inline-flex">{item.action}<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
        </Link>;
      })
      : <EmptyState icon={BadgeCheck} title="You’re all caught up" description="No unassigned requests, overdue follow-ups or missed payment deadlines on upcoming trips." />}
  </Card>;
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone: "red" | "orange" | "blue" }) {
  const styles = { red: "bg-red-50 text-red-700", orange: "bg-brand-orange-50 text-brand-orange-800", blue: "bg-brand-blue-50 text-brand-blue-700" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}><span className="font-semibold">{value}</span> {label}</span>;
}

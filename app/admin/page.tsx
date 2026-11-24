import Link from "next/link";
import {
  LayoutDashboard, ClipboardList, CreditCard, Users, ArrowUpRight, Clock3,
  Wallet, Compass, CalendarDays, ChevronRight, CircleAlert, AlertTriangle,
  UserRoundPlus, BellRing, ArrowRight, CalendarClock, BadgeCheck,
} from "lucide-react";
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

  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Accra" }).format(new Date());
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Africa/Accra" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return <div className="mx-auto max-w-[1540px]">
    <section className="relative mb-8 overflow-hidden rounded-[22px] border border-[#dfe4ed] bg-[#142b65] px-6 py-7 text-white shadow-[0_12px_32px_rgba(17,28,54,0.08)] sm:px-8 sm:py-8">
      <div className="absolute inset-y-0 left-0 w-1 bg-[#f47b20]" />
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.19em] text-orange-200"><Compass className="h-3.5 w-3.5" /> TransVista operations</div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-[30px]">{greeting}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/75">Here’s your operational snapshot. Keep an eye on new requests, payment follow-ups and the traveller experience.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-sm">
          <CalendarDays className="h-5 w-5 text-orange-300" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-100/55">Today</p><p className="mt-0.5 text-sm font-semibold text-white">{today}</p></div>
        </div>
      </div>
    </section>

    {canSeeOperations ? <>
      {loadError && <div role="status" className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />Bookings could not be loaded right now, so these totals are unavailable. Refresh the page, or open Booking requests to try again.</div>}
      {totals && totals.stalePastTrips > 0 && <Link href="/admin/requests?view=past-open" className="mb-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" /><span><strong className="font-semibold text-slate-900">{totals.stalePastTrips} booking{totals.stalePastTrips === 1 ? " is" : "s are"} still open for trips that have already happened.</strong> Mark them completed or cancelled so they stop affecting your numbers. <span className="font-semibold text-brand-blue-700">Review them →</span></span></Link>}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Metric label="Active bookings" value={String(totals?.active ?? "—")} hint="Not archived" icon={ClipboardList} tone="blue" />
        <Metric label="Needs attention" value={String(totals?.needsAttention ?? "—")} hint="Upcoming bookings with an open task" icon={Clock3} tone="orange" />
        <Metric label="Payments received" value={totals ? money(totals.receivedGhs) : "—"} hint="Recorded on bookings, in Ghana cedis" icon={Wallet} tone="green" />
        <Metric label="Outstanding balance" value={totals ? money(totals.outstandingGhs) : "—"} hint="Still owed on upcoming bookings" icon={CreditCard} tone="violet" />
      </div>
    </> : null}

    {canSeeOperations && <ActionCentre items={actionItems} summary={actionSummary} loadError={loadError} />}

    <div className={canSeeOperations ? "grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.85fr)]" : "grid gap-6"}>
      {canSeeOperations ? <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.025]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f47b20]" /><h3 className="text-[15px] font-bold tracking-tight text-slate-950">Recent booking activity</h3></div><p className="mt-1.5 text-xs text-slate-500">Latest traveller requests received by TransVista.</p></div>
          <Link href="/admin/requests" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-[#1a3a9c] transition hover:bg-blue-50">View all requests <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="divide-y divide-slate-100">
          {latest.map((b) => <div key={b.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a9c]"><Compass className="h-[18px] w-[18px]" /></div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{b.full_name}</p><p className="mt-1 truncate text-xs text-slate-500">{b.reference} <span className="px-1 text-slate-300">·</span> {b.description}</p></div>
            </div>
            <div className="ml-[52px] flex items-center gap-4 sm:ml-0">
              <div className="text-right"><p className="text-xs font-semibold text-slate-800">{b.currency} {Number(b.amount_paid ?? 0).toFixed(2)} paid</p><p className="mt-1 text-[10px] text-slate-400">{new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div>
              <StatusPill status={b.status} />
            </div>
          </div>)}
          {!latest.length && <div className="px-6 py-14 text-center"><ClipboardList className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No booking requests yet</p><p className="mt-1 text-xs text-slate-400">New traveller submissions will appear here.</p></div>}
        </div>
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-6"><Link href="/admin/requests" className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-[#1a3a9c]">Open booking operations <ChevronRight className="h-4 w-4" /></Link></div>
      </section> : null}

      <section className="space-y-6">
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] sm:p-6">
          <div className="mb-4"><h3 className="text-[15px] font-bold tracking-tight text-slate-950">Quick access</h3><p className="mt-1 text-xs text-slate-500">Go straight to the work that matters.</p></div>
          <div className="space-y-2">
            {canSeeOperations && <><QuickLink href="/admin/requests" title="Booking operations" detail="Review requests, assign and follow up" icon={ClipboardList} /><QuickLink href="/admin/payments" title="Payments & receipts" detail="Record payments and review balances" icon={CreditCard} /></>}
            {canSeeCommunity && <QuickLink href="/admin/community" title="Community members" detail="Manage traveller sign-ups and interests" icon={Users} />}
            {canSeeAnalytics && <QuickLink href="/admin/analytics" title="Performance insights" detail="Explore growth and operational metrics" icon={LayoutDashboard} />}
          </div>
        </div>

        {canSeeCommunity && <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h3 className="text-[15px] font-bold tracking-tight text-slate-950">New community members</h3><p className="mt-1 text-xs text-slate-500">Most recent sign-ups.</p></div><Link href="/admin/community" aria-label="View community members" className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-[#1a3a9c]"><ArrowUpRight className="h-4 w-4" /></Link></div>
          <div className="mt-4 space-y-4">
            {recentLeads.map((l) => <div key={l.id} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-[#c85f16]">{l.full_name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{l.full_name}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{l.interest ?? "Community member"}</p></div></div><span className="shrink-0 text-[10px] text-slate-400">{new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></div>)}
            {!recentLeads.length && <p className="py-5 text-center text-xs text-slate-400">No recent sign-ups.</p>}
          </div>
        </div>}
      </section>
    </div>
  </div>;
}

function Metric({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: typeof ClipboardList; tone: "blue" | "orange" | "green" | "violet" }) {
  const tones = { blue: "bg-blue-50 text-[#1a3a9c]", orange: "bg-orange-50 text-[#c85f16]", green: "bg-emerald-50 text-emerald-700", violet: "bg-violet-50 text-violet-700" };
  return <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold text-slate-500">{label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-[18px] w-[18px]" /></span></div>
    <p className="mt-4 text-[26px] font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1.5 text-[10px] text-slate-400">{hint}</p>
  </div>;
}

function StatusPill({ status }: { status: string }) {
  const value = status.toLowerCase();
  const tone = ["paid", "confirmed", "completed"].includes(value) ? "bg-emerald-50 text-emerald-700" : ["cancelled", "rejected"].includes(value) ? "bg-rose-50 text-rose-700" : ["pending", "new", "awaiting_payment"].includes(value) ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${tone}`}>{value.replaceAll("_", " ").replaceAll("-", " ")}</span>;
}

function QuickLink({ href, title, detail, icon: Icon }: { href: string; title: string; detail: string; icon: typeof ClipboardList }) {
  return <Link href={href} className="group flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-100 hover:bg-blue-50/60">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-white group-hover:text-[#1a3a9c]"><Icon className="h-[17px] w-[17px]" /></span>
    <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{title}</span><span className="mt-1 block text-[10px] text-slate-400">{detail}</span></span>
    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#1a3a9c]" />
  </Link>;
}


function ActionCentre({ items, summary, loadError }: { items: ActionItem[]; summary: ActionSummary; loadError: boolean }) {
  const { urgent, paymentOverdue: attention, unassigned } = summary;
  return <section className="mb-8 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.025]">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
      <div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#c85f16]"><ClipboardList className="h-4 w-4" /></span><h3 className="text-[15px] font-bold tracking-tight text-slate-950">Team action queue</h3></div><p className="mt-2 text-xs text-slate-500">A live queue of requests and follow-ups that may need your team’s attention.</p></div>
      <Link href="/admin/requests" className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#1a3a9c] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#152f80] sm:self-auto">Open booking operations <ArrowRight className="h-3.5 w-3.5" /></Link>
    </div>
    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
      <ActionStat label="Urgent" value={String(urgent)} tone="red" />
      <ActionStat label="Payment deadlines" value={String(attention)} tone="orange" />
      <ActionStat label="Unassigned" value={String(unassigned)} tone="blue" />
    </div>
    {loadError ? <div role="status" className="flex items-center gap-3 px-6 py-8 text-sm text-amber-800"><CircleAlert className="h-5 w-5 shrink-0" />Some action items could not be loaded. Open Booking Operations to review your records.</div> : items.length ? <div className="divide-y divide-slate-100">
      {items.map((item) => {
        const Icon = item.icon;
        const severity = item.severity === "urgent" ? "bg-rose-50 text-rose-700" : item.severity === "attention" ? "bg-orange-50 text-[#b45309]" : "bg-blue-50 text-[#1a3a9c]";
        return <div key={item.key} className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${severity}`}><Icon className="h-[18px] w-[18px]" /></span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-slate-900">{item.name}</p><span className="text-[10px] text-slate-400">{item.reference}</span></div><p className="mt-1 truncate text-xs text-slate-500">{item.reason}</p><p className="mt-1 truncate text-[10px] text-slate-400">{item.description}</p></div>
          <div className="ml-[52px] flex w-full items-center justify-between gap-3 sm:ml-0 sm:w-auto sm:justify-end"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${severity}`}>{item.severity === "urgent" ? "Urgent" : item.severity === "attention" ? "Attention" : "To assign"}</span><Link href={item.href} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-[#1a3a9c] transition hover:bg-blue-50">{item.action}<ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
        </div>;
      })}
    </div> : <div className="px-6 py-10 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><BadgeCheck className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold text-slate-800">You’re all caught up</p><p className="mt-1 text-xs text-slate-400">No unassigned requests, overdue follow-ups or missed payment deadlines were found.</p></div>}
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6"><p className="text-[10px] text-slate-400">Based on live booking records and scheduled deadlines.</p><p className="text-[10px] font-medium text-slate-500">{summary.total > items.length ? `Showing the ${items.length} most urgent of ${summary.total} items` : `${summary.total} item${summary.total === 1 ? "" : "s"}`}</p></div>
  </section>;
}

function ActionStat({ label, value, tone }: { label: string; value: string; tone: "red" | "orange" | "blue" }) {
  const colors = { red: "text-rose-700", orange: "text-[#c85f16]", blue: "text-[#1a3a9c]" };
  return <div className="px-4 py-3.5 sm:px-6"><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className={`mt-1 text-xl font-bold tracking-tight ${colors[tone]}`}>{value}</p></div>;
}

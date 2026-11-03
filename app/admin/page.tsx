import Link from "next/link";
import { LayoutDashboard, ClipboardList, CreditCard, Users, ArrowUpRight, Clock3 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";

export const dynamic = "force-dynamic";

const money=(amount:number)=>new Intl.NumberFormat("en-GH",{style:"currency",currency:"GHS",maximumFractionDigits:2}).format(amount);

export default async function AdminDashboardPage() {
  const {role}=await requireAdminArea("dashboard");
  const supabase=await createClient();
  const [packages,custom,leads]=await Promise.all([
    supabase.from("package_reservations").select("id,reference,full_name,package_title,travellers,total_price,amount_paid,currency,payment_status,status,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("trip_requests").select("id,reference,full_name,destinations,adults,children,quoted_amount,amount_paid,quote_currency,budget_currency,payment_status,status,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("leads").select("id,full_name,email,interest,created_at").order("created_at",{ascending:false}).limit(5)
  ]);
  const groupBookings=packages.data??[];
  const customRequests=custom.data??[];
  const allBookings=[...groupBookings,...customRequests];
  const collected=groupBookings.filter(b=>b.currency==="GHS").reduce((sum,b)=>sum+Number(b.amount_paid??0),0)+customRequests.filter(b=>(b.quote_currency??b.budget_currency)==="GHS").reduce((sum,b)=>sum+Number(b.amount_paid??0),0);
  const expected=groupBookings.filter(b=>b.currency==="GHS").reduce((sum,b)=>sum+Number(b.total_price??0),0)+customRequests.filter(b=>(b.quote_currency??b.budget_currency)==="GHS").reduce((sum,b)=>sum+Number(b.quoted_amount??0),0);
  const outstanding=Math.max(0,expected-collected);
  const attention=allBookings.filter(b=>["pending-review","new","reviewing","confirmed-awaiting-deposit","payment-requested","deposit-requested"].includes(b.status)||["payment-requested","deposit-requested","not-requested"].includes(b.payment_status)).length;
  const latest=allBookings.slice(0,6);
  return <div className="mx-auto max-w-[1500px]">
    <PageHeader icon={LayoutDashboard} title="Operations overview" description="A live view of bookings, payments and the work that needs your team's attention." />
    <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="All booking requests" value={String(allBookings.length)} icon={<ClipboardList className="h-5 w-5"/>} />
      <Metric label="Needs attention" value={String(attention)} icon={<Clock3 className="h-5 w-5"/>} />
      <Metric label="GHS payments recorded" value={money(collected)} icon={<CreditCard className="h-5 w-5"/>} />
      <Metric label="Outstanding (quoted / group)" value={money(outstanding)} icon={<ArrowUpRight className="h-5 w-5"/>} />
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-bold text-slate-950">Recent booking activity</h2><p className="mt-1 text-sm text-slate-500">Latest group and custom trip requests.</p></div><Link href="/admin/requests" className="text-sm font-bold text-blue-700 hover:underline">View all</Link></div>
        <div className="divide-y divide-slate-100">
          {latest.map((b)=>{const isGroup="package_title" in b;return <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="font-semibold text-slate-900">{b.full_name}</p><p className="mt-1 truncate text-xs text-slate-500">{b.reference} · {isGroup?b.package_title:(b.destinations??[]).join(", ")||"Custom trip"}</p></div><div className="text-right"><p className="text-sm font-semibold text-slate-900">{money(Number(b.amount_paid??0))} received</p><p className="mt-1 text-xs capitalize text-slate-500">{String(b.status).replaceAll("-"," ")}</p></div></div>})}
          {!latest.length?<p className="px-5 py-10 text-center text-sm text-slate-500">No booking requests yet.</p>:null}
        </div>
      </section>
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-950">Quick actions</h2><div className="mt-4 grid gap-2"><QuickLink href="/admin/requests" title="Manage bookings" detail="Review, assign and follow up" /><QuickLink href="/admin/payments" title="Payments & receipts" detail="Record transactions and issue receipts" />{["owner","admin","community_manager"].includes(role) ? <QuickLink href="/admin/community" title="Community members" detail="Manage your traveller community" /> : null}{role === "owner" ? <QuickLink href="/admin/settings" title="Team access" detail="Invite and manage staff accounts" /> : null}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-slate-500"/><h2 className="font-bold text-slate-950">Latest community sign-ups</h2></div><div className="mt-4 space-y-3">{(leads.data??[]).map(l=><div key={l.id} className="flex justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{l.full_name}</p><p className="text-xs text-slate-500">{l.interest}</p></div><span className="text-xs text-slate-400">{new Date(l.created_at).toLocaleDateString("en-GB")}</span></div>)}{!leads.data?.length?<p className="text-sm text-slate-500">No recent sign-ups.</p>:null}</div></div>
      </section>
    </div>
  </div>;
}
function Metric({label,value,icon}:{label:string;value:string;icon:React.ReactNode}){return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between text-slate-500"><span className="text-sm">{label}</span>{icon}</div><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p></div>}
function QuickLink({href,title,detail}:{href:string;title:string;detail:string}){return <Link href={href} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50"><span><span className="block text-sm font-semibold text-slate-900">{title}</span><span className="mt-0.5 block text-xs text-slate-500">{detail}</span></span><ArrowUpRight className="h-4 w-4 text-slate-400"/></Link>}

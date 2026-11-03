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
  const [summary,packages,custom,leads]=await Promise.all([
    supabase.rpc("get_admin_operations_summary"),
    supabase.from("package_reservations").select("id,reference,full_name,package_title,travellers,amount_paid,currency,status,created_at").order("created_at",{ascending:false}).limit(3),
    supabase.from("trip_requests").select("id,reference,full_name,destinations,amount_paid,quote_currency,budget_currency,status,created_at").order("created_at",{ascending:false}).limit(3),
    supabase.from("leads").select("id,full_name,email,interest,created_at").order("created_at",{ascending:false}).limit(5)
  ]);
  if(summary.error) console.error("[AdminDashboard] Summary unavailable:",summary.error);
  const totals=summary.data?.[0];
  const latest=[
    ...(packages.data??[]).map(b=>({...b,kind:"group" as const,description:b.package_title})),
    ...(custom.data??[]).map(b=>({...b,kind:"custom" as const,description:(b.destinations??[]).join(", ")||"Custom trip"}))
  ].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,6);
  return <div className="mx-auto max-w-[1500px]">
    <PageHeader icon={LayoutDashboard} title="Operations overview" description="A live view of bookings, payments and the work that needs your team's attention." />
    {summary.error?<div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Some dashboard totals are temporarily unavailable. Open the relevant workspace to review the full records.</div>:null}
    <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Total booking requests" value={String(totals?.total_requests??"—")} icon={<ClipboardList className="h-5 w-5"/>} />
      <Metric label="Requests needing attention" value={String(totals?.attention_requests??"—")} icon={<Clock3 className="h-5 w-5"/>} />
      <Metric label="GHS payments received" value={totals?money(Number(totals.ghs_received)): "—"} icon={<CreditCard className="h-5 w-5"/>} />
      <Metric label="GHS outstanding balance" value={totals?money(Number(totals.ghs_outstanding)): "—"} icon={<ArrowUpRight className="h-5 w-5"/>} />
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-bold text-slate-950">Recent booking activity</h2><p className="mt-1 text-sm text-slate-500">The six most recently submitted group and custom trip requests.</p></div><Link href="/admin/requests" className="text-sm font-bold text-blue-700 hover:underline">View all</Link></div>
        <div className="divide-y divide-slate-100">
          {latest.map(b=><div key={b.kind+"-"+b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="font-semibold text-slate-900">{b.full_name}</p><p className="mt-1 truncate text-xs text-slate-500">{b.reference} · {b.description}</p></div><div className="text-right"><p className="text-sm font-semibold text-slate-900">{b.currency??b.quote_currency??b.budget_currency??"GHS"} {Number(b.amount_paid??0).toFixed(2)} received</p><p className="mt-1 text-xs capitalize text-slate-500">{String(b.status).replaceAll("-"," ")}</p></div></div>)}
          {!latest.length?<p className="px-5 py-10 text-center text-sm text-slate-500">No booking requests yet.</p>:null}
        </div>
      </section>
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-950">Quick actions</h2><div className="mt-4 grid gap-2"><QuickLink href="/admin/requests" title="Manage bookings" detail="Review, assign and follow up" /><QuickLink href="/admin/payments" title="Payments & receipts" detail="Record transactions and issue receipts" />{["owner","admin","community_manager"].includes(role)?<QuickLink href="/admin/community" title="Community members" detail="Manage your traveller community"/>:null}{role==="owner"?<QuickLink href="/admin/settings" title="Team access" detail="Invite and manage staff accounts"/>:null}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-slate-500"/><h2 className="font-bold text-slate-950">Latest community sign-ups</h2></div><div className="mt-4 space-y-3">{(leads.data??[]).map(l=><div key={l.id} className="flex justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{l.full_name}</p><p className="text-xs text-slate-500">{l.interest}</p></div><span className="text-xs text-slate-400">{new Date(l.created_at).toLocaleDateString("en-GB")}</span></div>)}{!leads.data?.length?<p className="text-sm text-slate-500">No recent sign-ups.</p>:null}</div></div>
      </section>
    </div>
  </div>;
}
function Metric({label,value,icon}:{label:string;value:string;icon:React.ReactNode}){return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between text-slate-500"><span className="text-sm">{label}</span>{icon}</div><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p></div>}
function QuickLink({href,title,detail}:{href:string;title:string;detail:string}){return <Link href={href} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50"><span><span className="block text-sm font-semibold text-slate-900">{title}</span><span className="mt-0.5 block text-xs text-slate-500">{detail}</span></span><ArrowUpRight className="h-4 w-4 text-slate-400"/></Link>}

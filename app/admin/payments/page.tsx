import Link from "next/link";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/admin/PageHeader";
import { CreditCard, FileText } from "lucide-react";
import RecordPaymentForm from "@/components/admin/RecordPaymentForm";
import PaymentAdjustmentForm from "@/components/admin/PaymentAdjustmentForm";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const { role } = await requireAdminArea("payments");
  const supabase = await createClient();
  const [{data:transactions,error}, {data:bookings}] = await Promise.all([
    supabase.from("package_payment_transactions").select("id,receipt_number,booking_reference,amount,currency,payment_method,payment_date,status,transaction_type,notes").order("payment_date",{ascending:false}).limit(200),
    supabase.from("package_reservations").select("id,reference,full_name,email,travellers,total_price,amount_paid,currency").order("created_at",{ascending:false}).limit(200),
  ]);
  if (error) console.error("[AdminPaymentsPage]",error);
  const bookingMap = new Map((bookings ?? []).map((b)=>[b.reference,b]));
  const verified = (transactions ?? []).filter(t=>t.status==="verified");
  const total = verified.filter(t=>t.currency==="GHS").reduce((sum,t)=>sum+(t.transaction_type==="adjustment" ? -Number(t.amount) : ["payment","opening_balance"].includes(t.transaction_type) ? Number(t.amount) : 0),0);
  const bookingOptions=(bookings ?? []).map(b=>({id:b.id,reference:b.reference,name:b.full_name,travellers:b.travellers,total:Number(b.total_price),paid:Number(b.amount_paid),currency:b.currency}));

  return <div className="mx-auto max-w-[1500px]">
    <PageHeader icon={CreditCard} title="Payments & receipts" description="Record verified payments, correct mistakes transparently and keep a complete history for group bookings." />
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <Metric label="Transactions shown" value={String(transactions?.length ?? 0)} />
      <Metric label="Verified entries" value={verified.length.toString()} />
      <Metric label="Net verified received (GHS)" value={new Intl.NumberFormat("en-GH",{style:"currency",currency:"GHS"}).format(total)} />
    </div>
    {["owner","admin","support"].includes(role) ? <RecordPaymentForm bookings={bookingOptions} /> : null}
    {["owner","admin"].includes(role) ? <PaymentAdjustmentForm bookings={bookingOptions} /> : null}
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-900">Recent payment activity</h2><p className="mt-1 text-sm text-slate-500">Corrections remain visible in the audit history. Only actual payments have customer receipts.</p></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Reference","Booking","Entry","Amount","Method","Date","Status",""].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {(transactions ?? []).map(t=>{const b=bookingMap.get(t.booking_reference);const correction=t.transaction_type==="adjustment";return <tr key={t.id} className={correction?"bg-amber-50/40":""}>
              <td className="px-4 py-4 font-semibold text-blue-700">{correction?"Adjustment":t.receipt_number}</td>
              <td className="px-4 py-4"><p className="font-semibold text-slate-900">{b?.full_name ?? t.booking_reference}</p><p className="text-xs text-slate-500">{t.booking_reference}{b ? ` · ${b.travellers} travellers` : ""}</p></td>
              <td className="px-4 py-4"><p className="font-semibold text-slate-800">{correction?"Payment correction":t.transaction_type==="opening_balance"?"Opening balance":t.transaction_type==="refund"?"Refund":"Payment"}</p>{t.notes?<p className="mt-1 max-w-[260px] text-xs text-slate-500">{t.notes}</p>:null}</td>
              <td className={`px-4 py-4 font-semibold ${correction?"text-amber-800":"text-slate-900"}`}>{correction?"− ":""}{t.currency} {Number(t.amount).toFixed(2)}</td>
              <td className="px-4 py-4 capitalize text-slate-600">{t.payment_method?.replaceAll("-"," ") ?? "Not supplied"}</td>
              <td className="px-4 py-4 text-slate-600">{new Date(t.payment_date).toLocaleString("en-GB",{timeZone:"Africa/Accra"})}</td>
              <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${correction?"bg-amber-100 text-amber-800":"bg-emerald-50 text-emerald-700"}`}>{correction?"adjusted":t.status}</span></td>
              <td className="px-4 py-4 text-right">{!correction && t.transaction_type!=="refund" ? <Link className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-semibold hover:bg-slate-50" href={`/admin/payments/${t.id}/receipt`}><FileText className="h-4 w-4"/> View receipt</Link> : <span className="text-xs text-slate-400">Internal record</span>}</td>
            </tr>})}
            {!transactions?.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No payment transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}

function Metric({label,value}:{label:string;value:string}) {
 return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div>;
}

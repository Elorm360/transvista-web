import { notFound } from "next/navigation";
import PrintReceiptButton from "@/components/admin/PrintReceiptButton";
import { sendPackagePaymentReceipt } from "@/app/actions/payment-receipts";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PaymentReceiptPage({params}:{params:Promise<{id:string}>}) {
 await requireAdminArea("payments");
 const {id}=await params;
 const supabase=await createClient();
 const {data:t,error}=await supabase.from("package_payment_transactions").select("id,receipt_number,booking_reference,amount,currency,payment_method,external_reference,payment_date,status,transaction_type,notes,receipt_sent_at,receipt_sent_to").eq("id",id).maybeSingle();
 if(error || !t) notFound();
 const {data:b}=await supabase.from("package_reservations").select("full_name,email,phone,travellers,package_title,total_price,amount_paid,currency").eq("reference",t.booking_reference).maybeSingle();
 if(!b) notFound();
 const balance=Math.max(0,Number(b.total_price)-Number(b.amount_paid));
 return <main className="mx-auto max-w-3xl">
  <div className="mb-5 flex justify-end gap-3 print:hidden"><a href="/admin/payments" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Back to payments</a><form action={sendPackagePaymentReceipt}><input type="hidden" name="transactionId" value={t.id}/><button type="submit" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">Send receipt by email</button></form><PrintReceiptButton /></div>
  {t.receipt_sent_at ? <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden">Receipt emailed to {t.receipt_sent_to} on {new Date(t.receipt_sent_at).toLocaleString("en-GB",{timeZone:"Africa/Accra"})}.</p> : null}
  <article className="receipt-paper rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
   <header className="flex items-start justify-between border-b-2 border-slate-900 pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">TransVista Africa</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Payment receipt</h1><p className="mt-1 text-sm text-slate-500">Official payment acknowledgement</p></div><div className="text-right"><p className="text-xs uppercase tracking-wide text-slate-500">Receipt no.</p><p className="mt-1 font-bold">{t.receipt_number}</p><p className="mt-3 text-xs text-slate-500">Booking reference</p><p className="font-semibold">{t.booking_reference}</p></div></header>
   <section className="grid gap-6 py-7 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-slate-500">Received from</p><p className="mt-1 text-lg font-bold">{b.full_name}</p><p className="text-sm text-slate-600">{b.email}</p><p className="text-sm text-slate-600">{b.phone}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Payment date</p><p className="mt-1 font-semibold">{new Date(t.payment_date).toLocaleString("en-GB",{timeZone:"Africa/Accra",dateStyle:"long",timeStyle:"short"})}</p><p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Payment method</p><p className="mt-1 font-semibold capitalize">{t.payment_method?.replaceAll("-"," ") ?? "Not supplied"}</p></div></section>
   <section className="rounded-xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Amount received for this transaction</p><p className="mt-1 text-3xl font-bold text-slate-950">{t.currency} {Number(t.amount).toFixed(2)}</p><p className="mt-2 text-xs text-slate-500">Status: {t.status==="verified"?"Verified":"Pending verification"}</p></section>
   <section className="mt-7"><h2 className="font-bold">Booking summary</h2><dl className="mt-3 divide-y divide-slate-100 border-y border-slate-100"><Row label="Trip" value={b.package_title}/><Row label="Travellers" value={String(b.travellers)}/><Row label="Total booking value" value={`${b.currency} ${Number(b.total_price).toFixed(2)}`}/><Row label="Total amount received" value={`${b.currency} ${Number(b.amount_paid).toFixed(2)}`}/><Row label="Outstanding balance" value={`${b.currency} ${balance.toFixed(2)}`}/>{t.external_reference?<Row label="Transaction reference" value={t.external_reference}/>:null}</dl></section>
   {t.notes?<p className="mt-5 text-sm text-slate-600">Note: {t.notes}</p>:null}
   <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs leading-6 text-slate-500">Thank you for choosing TransVista Africa.<br/>This receipt acknowledges the individual transaction listed above. Keep it for your records.</footer>
  </article>
  <style>{`@media print { body { background: white !important; } aside, header, nav, .print\\:hidden { display:none !important; } main { max-width:none !important; margin:0 !important; } .receipt-paper { border:0 !important; box-shadow:none !important; padding:0 !important; } }`}</style>
 </main>;
}
function Row({label,value}:{label:string;value:string}){return <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-900">{value}</dd></div>}

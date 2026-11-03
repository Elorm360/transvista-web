"use client";
import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordPackagePayment, type RecordPaymentState } from "@/app/actions/payment-transactions";

type Booking={id:number;reference:string;name:string;travellers:number;total:number;paid:number;currency:string};
const initial:RecordPaymentState={success:false,message:""};
export default function RecordPaymentForm({bookings}:{bookings:Booking[]}) {
 const router=useRouter();
 const [state,action,pending]=useActionState(recordPackagePayment,initial);
 useEffect(()=>{if(state.success) router.refresh()},[router,state.success]);
 return <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
  <h2 className="font-bold text-slate-950">Record a payment</h2><p className="mt-1 text-sm text-slate-500">Add each new payment as its own transaction. The system recalculates the booking balance and creates a receipt number.</p>
  <form action={action} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   <label className="text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-1">Booking<select required name="reservationId" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal"><option value="">Choose booking</option>{bookings.map(b=><option key={b.id} value={b.id}>{b.reference} · {b.name} · {b.travellers} people · {b.currency} {b.total}</option>)}</select></label>
   <label className="text-sm font-semibold text-slate-700">Amount received<input required name="amount" type="number" min="0.01" step="0.01" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal" placeholder="e.g. 400.00"/></label>
   <label className="text-sm font-semibold text-slate-700">Payment method<select name="paymentMethod" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal"><option value="">Not supplied</option><option value="mobile-money">Mobile Money</option><option value="bank-transfer">Bank transfer</option><option value="cash">Cash</option><option value="card">Card</option></select></label>
   <label className="text-sm font-semibold text-slate-700">Payment date<input name="paymentDate" type="datetime-local" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal"/></label>
   <label className="text-sm font-semibold text-slate-700">External transaction reference<input name="externalReference" maxLength={160} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal" placeholder="Optional"/></label>
   <label className="text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-1">Internal note<input name="notes" maxLength={1000} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal" placeholder="Optional"/></label>
   <div className="flex items-end"><button disabled={pending} className="h-11 w-full rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50">{pending?"Recording…":"Record payment & create receipt"}</button></div>
   {state.message?<p aria-live="polite" className={`md:col-span-2 xl:col-span-3 rounded-xl px-4 py-3 text-sm font-semibold ${state.success?"bg-emerald-50 text-emerald-800":"bg-rose-50 text-rose-800"}`}>{state.message}</p>:null}
  </form>
 </section>;
}

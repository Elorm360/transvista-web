"use client";
import {useActionState,useEffect} from "react";
import {useRouter} from "next/navigation";
import {adjustPackagePayment,type PaymentAdjustmentState} from "@/app/actions/payment-adjustments";
type Booking={id:number;reference:string;name:string;travellers:number;total:number;paid:number;currency:string};
const initial:PaymentAdjustmentState={success:false,message:""};
export default function PaymentAdjustmentForm({bookings}:{bookings:Booking[]}) {
 const router=useRouter();
 const [state,action,pending]=useActionState(adjustPackagePayment,initial);
 useEffect(()=>{if(state.success)router.refresh()},[router,state.success]);
 return <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
  <h2 className="font-bold text-slate-950">Correct a payment total</h2>
  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Owner/admin only. This records a separate correction with a reason; it never edits or deletes the original transaction.</p>
  <form action={action} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
   <label className="text-sm font-semibold text-slate-700">Booking<select required name="reservationId" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal"><option value="">Choose booking</option>{bookings.map(b=><option key={b.id} value={b.id}>{b.reference} · {b.name} · {b.currency} {b.paid.toFixed(2)} received</option>)}</select></label>
   <label className="text-sm font-semibold text-slate-700">Amount to subtract<input required name="amount" type="number" min="0.01" step="0.01" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal" placeholder="e.g. 400.00"/></label>
   <label className="text-sm font-semibold text-slate-700">Correction date<input name="adjustmentDate" type="datetime-local" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal"/></label>
   <label className="text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-3">Reason for correction<input required minLength={8} maxLength={1000} name="reason" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal" placeholder="Explain what was incorrect and what the verified total should be."/></label>
   <div className="flex items-end"><button disabled={pending} className="h-11 w-full rounded-xl bg-amber-700 px-5 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-50">{pending?"Saving correction…":"Save payment correction"}</button></div>
   {state.message?<p aria-live="polite" className={`md:col-span-2 xl:col-span-4 rounded-xl px-4 py-3 text-sm font-semibold ${state.success?"bg-emerald-50 text-emerald-800":"bg-rose-50 text-rose-800"}`}>{state.message}</p>:null}
  </form>
 </section>;
}

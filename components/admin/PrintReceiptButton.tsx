"use client";
export default function PrintReceiptButton(){return <button type="button" onClick={()=>window.print()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Print / Save as PDF</button>}

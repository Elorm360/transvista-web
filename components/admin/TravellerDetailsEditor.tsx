"use client";
import {useActionState,useEffect} from "react";
import {useRouter} from "next/navigation";
import {Pencil,Save} from "lucide-react";
import {updateTravellerSubmittedDetails,type TravellerDetailsState} from "@/app/actions/traveller-details";

type Props={request: {source:"custom"|"package";sourceId:number;fullName:string;email:string;phone:string;submitted:Record<string,string>}};
const initial:TravellerDetailsState={success:false,message:""};
const input="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const area="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-sm font-semibold text-slate-700">{label}{children}</label>}
export default function TravellerDetailsEditor({request}:Props){
 const router=useRouter();
 const [state,action,pending]=useActionState(updateTravellerSubmittedDetails,initial);
 useEffect(()=>{if(state.success&&state.completedAt)router.refresh()},[router,state.success,state.completedAt]);
 const v=request.submitted;
 return <details className="overflow-hidden rounded-2xl border border-blue-200 bg-white">
  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-blue-50/60 px-5 py-4">
   <span><span className="flex items-center gap-2 font-bold text-slate-900"><Pencil className="h-4 w-4 text-blue-700"/> Edit traveller-submitted information</span><span className="mt-1 block text-xs font-normal text-slate-600">Correct names, contacts, number of people and trip details.</span></span>
   <span className="text-xs font-semibold text-blue-700">Edit details</span>
  </summary>
  <form action={action} className="space-y-5 p-5">
   <input type="hidden" name="requestKind" value={request.source}/><input type="hidden" name="requestId" value={request.sourceId}/>
   <div><h4 className="text-sm font-bold text-slate-900">Primary traveller</h4><div className="mt-3 grid gap-4 sm:grid-cols-2">
    <Field label="Full name"><input required name="fullName" defaultValue={request.fullName} maxLength={120} className={input}/></Field>
    <Field label="Email address"><input required type="email" name="email" defaultValue={request.email} maxLength={254} className={input}/></Field>
    <Field label="Phone number"><input required name="phone" defaultValue={request.phone} maxLength={40} className={input}/></Field>
    {request.source==="package"?<Field label="City / pickup city"><input name="city" defaultValue={v.city} maxLength={120} className={input}/></Field>:<Field label="Country"><input required name="country" defaultValue={v.country} maxLength={100} className={input}/></Field>}
   </div></div>
   {request.source==="package"?<>
    <div><h4 className="text-sm font-bold text-slate-900">Group booking details</h4><div className="mt-3 grid gap-4 sm:grid-cols-2">
     <Field label="Number of travellers"><input required type="number" name="travellers" min="1" max="200" step="1" defaultValue={v.travellers} className={input}/></Field>
     <Field label="Trip date"><input type="date" name="packageDate" defaultValue={v.packageDate} className={input}/></Field>
     <Field label="Emergency contact name"><input required name="emergencyContactName" defaultValue={v.emergencyContactName} maxLength={120} className={input}/></Field>
     <Field label="Emergency contact phone"><input required name="emergencyContactPhone" defaultValue={v.emergencyContactPhone} maxLength={40} className={input}/></Field>
    </div></div>
    <Field label="Dietary requirements"><textarea name="dietaryRequirements" rows={2} defaultValue={v.dietaryRequirements} maxLength={2000} className={area}/></Field>
    <Field label="Accessibility requirements"><textarea name="accessibilityRequirements" rows={2} defaultValue={v.accessibilityRequirements} maxLength={2000} className={area}/></Field>
   </>:<>
    <div><h4 className="text-sm font-bold text-slate-900">Travellers and travel dates</h4><div className="mt-3 grid gap-4 sm:grid-cols-2">
     <Field label="Adults"><input required type="number" name="adults" min="1" max="200" step="1" defaultValue={v.adults} className={input}/></Field>
     <Field label="Children"><input required type="number" name="children" min="0" max="200" step="1" defaultValue={v.children} className={input}/></Field>
     <Field label="Departure date"><input type="date" name="travelStart" defaultValue={v.travelStart} className={input}/></Field>
     <Field label="Return date"><input type="date" name="travelEnd" defaultValue={v.travelEnd} className={input}/></Field>
     <Field label="Date flexibility"><input name="dateFlexibility" defaultValue={v.dateFlexibility} maxLength={120} className={input}/></Field>
     <Field label="Accommodation style"><input name="accommodationStyle" defaultValue={v.accommodationStyle} maxLength={120} className={input}/></Field>
    </div></div>
    <Field label="Destinations (one per line)"><textarea name="destinations" rows={3} defaultValue={v.destinations} className={area}/></Field>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Services requested (one per line)"><textarea name="services" rows={3} defaultValue={v.services} className={area}/></Field><Field label="Interests (one per line)"><textarea name="interests" rows={3} defaultValue={v.interests} className={area}/></Field></div>
    <div><h4 className="text-sm font-bold text-slate-900">Budget information</h4><div className="mt-3 grid gap-4 sm:grid-cols-3">
     <Field label="Currency"><select name="budgetCurrency" defaultValue={v.budgetCurrency} className={input}><option value="GHS">GHS</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="EUR">EUR</option></select></Field>
     <Field label="Budget basis"><select name="budgetBasis" defaultValue={v.budgetBasis} className={input}><option value="per-person">Per person</option><option value="total-trip">Total trip</option></select></Field>
     <Field label="Budget range"><input required name="budgetRange" defaultValue={v.budgetRange} maxLength={100} className={input}/></Field>
    </div></div>
    <Field label="Transport details"><textarea name="transportDetails" rows={2} defaultValue={v.transportDetails} maxLength={1000} className={area}/></Field>
   </>}
   <Field label="Additional notes from traveller"><textarea name="travellerNotes" rows={3} defaultValue={v.notes} maxLength={4000} className={area}/></Field>
   <Field label="Reason for correction (required)"><input required name="correctionReason" minLength={5} maxLength={500} placeholder="e.g. Traveller confirmed the correct group size is one person." className={input}/></Field>
   {state.message?<p aria-live="polite" className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${state.success?"bg-emerald-50 text-emerald-800":"bg-rose-50 text-rose-800"}`}>{state.message}</p>:null}
   <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"><Save className="h-4 w-4"/>{pending?"Saving corrected details…":"Save corrected traveller details"}</button>
   <p className="text-xs leading-5 text-slate-500">Every correction is recorded in the booking activity history. Group-trip pricing is recalculated using the package's existing per-person rates. Verified payments already received are not changed.</p>
  </form>
 </details>;
}

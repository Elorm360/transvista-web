"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TravellerDetailsState={success:boolean;message:string;completedAt?:string};

function field(formData:FormData,key:string,max=200){return String(formData.get(key)??"").trim().slice(0,max);}
function optionalDate(value:string){if(!value)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value+"T12:00:00Z")))throw new Error("Enter a valid date.");return value;}
function list(value:string){return value.split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean).slice(0,30);}

export async function updateTravellerSubmittedDetails(_previous:TravellerDetailsState,formData:FormData):Promise<TravellerDetailsState>{
 try{
  const kind=field(formData,"requestKind",20),id=Number(field(formData,"requestId",20));
  if(!["custom","package"].includes(kind)||!Number.isInteger(id)||id<1)return{success:false,message:"This booking could not be identified."};
  const fullName=field(formData,"fullName",120),email=field(formData,"email",254).toLowerCase(),phone=field(formData,"phone",40),reason=field(formData,"correctionReason",500);
  if(fullName.length<2)return{success:false,message:"Enter the traveller's full name."};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return{success:false,message:"Enter a valid email address."};
  if(phone.length<7)return{success:false,message:"Enter a valid phone number."};
  if(reason.length<5)return{success:false,message:"Please explain why these details are being corrected."};
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return{success:false,message:"Your session has expired. Sign in again."};
  const {data:member,error:memberError}=await supabase.from("admin_team_members").select("id,role,status").eq("user_id",user.id).maybeSingle();
  if(memberError||!member||member.status!=="active"||!["owner","admin","support"].includes(member.role))return{success:false,message:"You do not have permission to edit traveller details."};
  const table=kind==="custom"?"trip_requests":"package_reservations";
  const {data:current,error:lookupError}=await supabase.from(table).select("*").eq("id",id).maybeSingle();
  if(lookupError||!current)return{success:false,message:"The booking could not be loaded. Refresh and try again."};
  let updates:Record<string,unknown>;
  if(kind==="package"){
   const travellers=Number(field(formData,"travellers",4));
   if(!Number.isInteger(travellers)||travellers<1||travellers>200)return{success:false,message:"Number of travellers must be between 1 and 200."};
   const packageDate=optionalDate(field(formData,"packageDate",10));
   const pricePerPerson=Number(current.price_per_person),depositPerPerson=Number(current.deposit_per_person);
   const totalPrice=pricePerPerson*travellers,depositDue=depositPerPerson*travellers;
   updates={
    full_name:fullName,email,phone,city:field(formData,"city",120)||null,package_date:packageDate,
    emergency_contact_name:field(formData,"emergencyContactName",120),
    emergency_contact_phone:field(formData,"emergencyContactPhone",40),
    travellers,dietary_requirements:field(formData,"dietaryRequirements",2000)||null,
    accessibility_requirements:field(formData,"accessibilityRequirements",2000)||null,
    notes:field(formData,"travellerNotes",4000)||null,
    total_price:totalPrice,deposit_due:depositDue,balance_per_person:Math.max(0,pricePerPerson-depositPerPerson),
    quoted_amount:totalPrice,quote_currency:current.currency,deposit_amount:depositDue,
    payment_status:Number(current.amount_paid??0)>=totalPrice?"paid":Number(current.amount_paid??0)>0?"deposit-paid":current.payment_status,
    updated_by:member.id,updated_at:new Date().toISOString()
   };
  }else{
   const adults=Number(field(formData,"adults",4)),children=Number(field(formData,"children",4));
   if(!Number.isInteger(adults)||adults<1||adults>200||!Number.isInteger(children)||children<0||children>200||adults+children>200)return{success:false,message:"Enter at least 1 adult and no more than 200 travellers in total."};
   const travelStart=optionalDate(field(formData,"travelStart",10)),travelEnd=optionalDate(field(formData,"travelEnd",10));
   if(travelStart&&travelEnd&&travelEnd<travelStart)return{success:false,message:"The return date cannot be before the departure date."};
   const budgetCurrency=field(formData,"budgetCurrency",10);
   if(!["GHS","USD","GBP","EUR"].includes(budgetCurrency))return{success:false,message:"Choose a valid budget currency."};
   const budgetBasis=field(formData,"budgetBasis",20);
   if(!["per-person","total-trip"].includes(budgetBasis))return{success:false,message:"Choose a valid budget basis."};
   updates={
    full_name:fullName,email,phone,country:field(formData,"country",100),
    destinations:list(field(formData,"destinations",2000)),services:list(field(formData,"services",2000)),interests:list(field(formData,"interests",2000)),
    travel_start:travelStart,travel_end:travelEnd,date_flexibility:field(formData,"dateFlexibility",120)||null,
    adults,children,budget_currency:budgetCurrency,budget_basis:budgetBasis,
    budget_range:field(formData,"budgetRange",100),accommodation_style:field(formData,"accommodationStyle",120)||null,
    transport_details:field(formData,"transportDetails",1000)||null,notes:field(formData,"travellerNotes",4000)||null,
    updated_by:member.id,updated_at:new Date().toISOString()
   };
   if(!updates.country||String(updates.budget_range).length<1)return{success:false,message:"Country and budget range are required."};
  }
  const {error:updateError}=await supabase.from(table).update(updates).eq("id",id);
  if(updateError){console.error("[updateTravellerSubmittedDetails]",updateError);return{success:false,message:"The corrected traveller details could not be saved."};}
  const before=kind==="package"
   ? `Travellers: ${current.travellers}; contact: ${current.full_name} / ${current.email} / ${current.phone}`
   : `Travellers: ${current.adults} adults, ${current.children} children; contact: ${current.full_name} / ${current.email} / ${current.phone}`;
  const after=kind==="package"
   ? `Travellers: ${updates.travellers}; contact: ${updates.full_name} / ${updates.email} / ${updates.phone}`
   : `Travellers: ${updates.adults} adults, ${updates.children} children; contact: ${updates.full_name} / ${updates.email} / ${updates.phone}`;
  const {error:activityError}=await supabase.from("request_activity").insert({
   request_kind:kind,request_id:id,reference:current.reference,activity_type:"details-corrected",
   summary:`Traveller-submitted information corrected. ${before}. Updated to: ${after}. Reason: ${reason}`,
   from_status:current.status,to_status:current.status,author_member_id:member.id
  });
  if(activityError)console.error("[updateTravellerSubmittedDetails] Activity insert failed",activityError);
  const completedAt=new Date().toISOString();
  revalidatePath("/admin/requests");revalidatePath("/admin/payments");revalidatePath("/admin");
  const priorRequestNote=kind==="package"&&current.payment_request_sent_at?" A payment request had previously been sent; review it and send an updated request if the amount changed.":"";
  return{success:true,message:kind==="package"?"Traveller details saved. Package price and deposit were recalculated from the updated headcount; payments already received were preserved."+priorRequestNote:"Traveller details saved and the corrected traveller count is reflected in the booking.",completedAt};
 }catch(error){console.error("[updateTravellerSubmittedDetails] Unexpected error",error);return{success:false,message:error instanceof Error?error.message:"The traveller details could not be saved."};}
}

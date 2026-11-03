"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentReceiptEmail } from "@/lib/email/sendPaymentReceiptEmail";

export async function sendPackagePaymentReceipt(formData: FormData) {
  const transactionId=String(formData.get("transactionId")??"").trim();
  if(!transactionId) throw new Error("Receipt transaction is missing.");
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) throw new Error("Sign in to send this receipt.");
  const {data:member}=await supabase.from("admin_team_members").select("id,role,status").eq("user_id",user.id).maybeSingle();
  if(!member || member.status!=="active" || !["owner","admin"].includes(member.role)) throw new Error("Only an active owner or admin can send receipts.");
  const {data:t,error:transactionError}=await supabase.from("package_payment_transactions").select("*").eq("id",transactionId).maybeSingle();
  if(transactionError || !t) throw new Error("The payment transaction could not be found.");
  if(t.status!=="verified") throw new Error("Only verified transactions can receive an official receipt.");
  const {data:b,error:bookingError}=await supabase.from("package_reservations").select("full_name,email,package_title,travellers,currency,total_price,amount_paid").eq("id",t.reservation_id).maybeSingle();
  if(bookingError || !b?.email) throw new Error("The traveller email address is unavailable.");
  const sent=await sendPaymentReceiptEmail({
    email:b.email,receiptNumber:t.receipt_number,reference:t.booking_reference,
    fullName:b.full_name,packageTitle:b.package_title,travellers:b.travellers,
    currency:t.currency,amount:Number(t.amount),totalPaid:Number(b.amount_paid),
    bookingTotal:Number(b.total_price),
    paymentDate:new Date(t.payment_date).toLocaleString("en-GB",{timeZone:"Africa/Accra"}),
    paymentMethod:t.payment_method?.replaceAll("-"," ")??"Not supplied",
    externalReference:t.external_reference,
  });
  if(!sent.success) throw new Error("Receipt email could not be delivered. Please retry from the receipt page.");
  await supabase.from("package_payment_transactions").update({receipt_sent_at:new Date().toISOString(),receipt_sent_to:b.email}).eq("id",t.id);
  revalidatePath("/admin/payments");
  revalidatePath("/admin/payments/"+t.id+"/receipt");
  return {success:true,email:b.email};
}

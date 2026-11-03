"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PaymentAdjustmentState = { success: boolean; message: string };

export async function adjustPackagePayment(
  _previous: PaymentAdjustmentState,
  formData: FormData,
): Promise<PaymentAdjustmentState> {
  const reservationId = Number(String(formData.get("reservationId") ?? ""));
  const amount = Number(String(formData.get("amount") ?? ""));
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  const dateInput = String(formData.get("adjustmentDate") ?? "").trim();
  if (!Number.isInteger(reservationId) || reservationId < 1) return {success:false,message:"Choose a valid booking."};
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) return {success:false,message:"Enter a valid adjustment amount."};
  if (reason.length < 8) return {success:false,message:"Explain why this payment total needs correcting."};
  const adjustmentDate = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return {success:false,message:"Your session has expired. Sign in again."};
  const {data:member} = await supabase.from("admin_team_members").select("id,role,status").eq("user_id",user.id).maybeSingle();
  if (!member || member.status !== "active" || !["owner","admin"].includes(member.role)) return {success:false,message:"Only an active owner or admin can correct payment totals."};
  const {error} = await supabase.rpc("adjust_package_payment",{
    p_reservation_id:reservationId,p_amount:amount,p_reason:reason,p_adjustment_date:adjustmentDate
  });
  if (error) {
    console.error("[adjustPackagePayment]",error);
    return {success:false,message:error.message || "The correction could not be saved."};
  }
  revalidatePath("/admin/payments");
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  return {success:true,message:"Payment total corrected. The original entries remain in the audit history."};
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RecordPaymentState = { success: boolean; message: string };

export async function recordPackagePayment(
  _previous: RecordPaymentState,
  formData: FormData,
): Promise<RecordPaymentState> {
  const reservationId = Number(String(formData.get("reservationId") ?? ""));
  const amount = Number(String(formData.get("amount") ?? ""));
  const method = String(formData.get("paymentMethod") ?? "").trim() || null;
  const externalReference = String(formData.get("externalReference") ?? "").trim().slice(0,160) || null;
  const paymentDateInput = String(formData.get("paymentDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim().slice(0,1000) || null;

  if (!Number.isInteger(reservationId) || reservationId < 1) return { success:false, message:"Select a valid booking." };
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) return { success:false, message:"Enter a valid amount greater than zero." };
  if (method && !["mobile-money","card","bank-transfer","cash"].includes(method)) return { success:false, message:"Choose a valid payment method." };
  const paymentDate = paymentDateInput ? new Date(paymentDateInput).toISOString() : new Date().toISOString();
  if (!Number.isFinite(Date.parse(paymentDate))) return { success:false, message:"Enter a valid payment date." };

  const supabase = await createClient();
  const { data:{user} } = await supabase.auth.getUser();
  if (!user) return { success:false, message:"Your session has expired. Sign in again." };

  const { data:member } = await supabase.from("admin_team_members")
    .select("id,role,status").eq("user_id",user.id).maybeSingle();
  if (!member || member.status !== "active" || !["owner","admin"].includes(member.role)) {
    return { success:false, message:"Only an active owner or admin can record a verified payment." };
  }

  const { data, error } = await supabase.rpc("record_package_payment", {
    p_reservation_id: reservationId,
    p_amount: amount,
    p_payment_method: method,
    p_external_reference: externalReference,
    p_payment_date: paymentDate,
    p_notes: notes,
  });

  if (error || !data?.length) {
    console.error("[recordPackagePayment]",error);
    return { success:false, message:error?.message ?? "The payment could not be recorded." };
  }
  revalidatePath("/admin/payments");
  revalidatePath("/admin/requests");
  return { success:true, message:"Payment recorded and receipt created." };
}

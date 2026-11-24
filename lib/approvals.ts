import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveAdminAccess } from "@/lib/auth/access";
import { logAudit } from "@/lib/audit";
import { CURRENCIES } from "@/lib/tasks/shared";

/** What a payment correction needs to run once approved. */
export type PaymentCorrectionPayload = {
  reservationId: number;
  amount: number;
  reason: string;
  adjustmentDate: string;
};

/**
 * Used by the Payments page when someone without approval rights corrects a total.
 * Server-only (not a server action), so the booking details shown to the
 * approver always come from the database lookup in payment-adjustments.
 */
export async function requestPaymentCorrectionApproval(payload: PaymentCorrectionPayload, booking: { reference: string; currency: string; name: string }) {
  const result = await resolveAdminAccess();
  if (result.status !== "ok") return null;
  const me = result.access;
  const { data, error } = await (await createClient())
    .from("approval_requests")
    .insert({
      kind: "payment_correction",
      title: `Correct payment total on ${booking.reference}`,
      details: `${booking.name}. Reduce the recorded total by ${booking.currency} ${payload.amount.toFixed(2)}.\nReason: ${payload.reason}`,
      amount: payload.amount,
      currency: (CURRENCIES as readonly string[]).includes(booking.currency) ? booking.currency : null,
      payload,
      requested_by: me.memberId,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[requestPaymentCorrectionApproval]", error);
    return null;
  }
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  await logAudit("approval.requested", `Asked for approval to correct the payment total on ${booking.reference}`, { type: "approval", id: data.id }, {
    kind: "payment_correction",
    amount: `${booking.currency} ${payload.amount.toFixed(2)}`,
  });
  return data.id as number;
}

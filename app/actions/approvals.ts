"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasAdminArea, NO_ACCESS_MESSAGE, resolveAdminAccess } from "@/lib/auth/access";
import { toActionResult } from "@/lib/actions/result";
import { logAudit } from "@/lib/audit";
import { CURRENCIES } from "@/lib/tasks/shared";
import type { PaymentCorrectionPayload } from "@/lib/approvals";

export type ApprovalInput = {
  kind: string;
  title: string;
  details: string;
  /** Empty when there's no amount. */
  amount: string;
  currency: string;
};

async function currentMember() {
  if (!(await hasAdminArea("tasks"))) throw new Error(NO_ACCESS_MESSAGE);
  const result = await resolveAdminAccess();
  if (result.status !== "ok") throw new Error(NO_ACCESS_MESSAGE);
  return result.access;
}

function refresh() {
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
}

function validId(id: unknown): number {
  const value = Number(id);
  if (!Number.isInteger(value) || value < 1) throw new Error("This request could not be found. Refresh the page.");
  return value;
}

async function submitApprovalUnsafe(input: ApprovalInput) {
  const me = await currentMember();
  if (!["expense", "operational", "other"].includes(input.kind)) throw new Error("Choose what kind of request this is.");
  const title = input.title.trim();
  const details = input.details.trim();
  if (title.length < 3 || title.length > 160) throw new Error("Give the request a short title (3–160 characters).");
  if (details.length > 4000) throw new Error("Keep the details under 4,000 characters.");

  let amount: number | null = null;
  let currency: string | null = null;
  if (input.amount.trim()) {
    amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) throw new Error("Enter a valid amount.");
    amount = Math.round(amount * 100) / 100;
    if (!(CURRENCIES as readonly string[]).includes(input.currency)) throw new Error("Choose the currency.");
    currency = input.currency;
  }
  if (input.kind === "expense" && amount === null) throw new Error("An expense needs an amount.");

  const { data, error } = await (await createClient())
    .from("approval_requests")
    .insert({ kind: input.kind, title, details: details || null, amount, currency, requested_by: me.memberId })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[submitApproval]", error);
    throw new Error("The request could not be sent.");
  }
  refresh();
  await logAudit("approval.requested", `Asked for approval: "${title}"`, { type: "approval", id: data.id }, {
    kind: input.kind,
    amount: amount !== null ? `${currency} ${amount.toFixed(2)}` : "none",
  });
  return { id: data.id as number };
}

async function cancelApprovalUnsafe(requestId: number) {
  const me = await currentMember();
  const id = validId(requestId);
  const { data, error } = await (await createClient())
    .from("approval_requests")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("requested_by", me.memberId)
    .eq("status", "pending")
    .select("id, title")
    .maybeSingle();
  if (error || !data) throw new Error("Only your own requests that are still waiting can be cancelled.");
  refresh();
  await logAudit("approval.cancelled", `Cancelled request "${data.title}"`, { type: "approval", id });
  return { id };
}

async function decideApprovalUnsafe(requestId: number, decision: "approve" | "reject", note: string) {
  if (!(await hasAdminArea("approvals"))) throw new Error("Only the CEO, or someone approving on their behalf, can decide requests.");
  const me = await currentMember();
  const id = validId(requestId);
  const decisionNote = note.trim();
  if (decisionNote.length > 1000) throw new Error("Keep the note under 1,000 characters.");
  if (decision === "reject" && decisionNote.length < 3) throw new Error("Say briefly why you're rejecting it, so they know what to change.");

  const supabase = await createClient();
  // Claim the decision first (only succeeds while still pending), so a
  // double click can never apply a payment correction twice.
  const { data: request, error } = await supabase
    .from("approval_requests")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      decided_by: me.memberId,
      decided_at: new Date().toISOString(),
      decision_note: decisionNote || null,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id, kind, title, payload, requested_by")
    .maybeSingle();
  if (error || !request) {
    console.error("[decideApproval]", error);
    const ownRequest = error?.message?.includes("own request");
    throw new Error(ownRequest ? "You can't decide your own request." : "This request has already been decided or cancelled. Refresh the page.");
  }

  await logAudit(decision === "approve" ? "approval.approved" : "approval.rejected", `${decision === "approve" ? "Approved" : "Rejected"} "${request.title}"`, { type: "approval", id }, {
    kind: request.kind,
    note: decisionNote.slice(0, 200) || "none",
  });

  let message = decision === "approve" ? "Approved." : "Rejected. They'll see your note.";

  if (decision === "approve" && request.kind === "payment_correction") {
    const payload = request.payload as PaymentCorrectionPayload;
    const { error: runError } = await supabase.rpc("adjust_package_payment", {
      p_reservation_id: payload.reservationId,
      p_amount: payload.amount,
      p_reason: `${payload.reason} (approved request #${id})`,
      p_adjustment_date: payload.adjustmentDate,
    });
    if (runError) {
      console.error("[decideApproval] correction:", runError);
      await supabase
        .from("approval_requests")
        .update({ decision_note: `${decisionNote ? `${decisionNote}\n` : ""}Approved, but the correction could not be applied automatically: ${runError.message}` })
        .eq("id", id);
      refresh();
      throw new Error(`Approved, but the correction could not be applied: ${runError.message}. Apply it from the Payments page.`);
    }
    await supabase.from("approval_requests").update({ executed_at: new Date().toISOString() }).eq("id", id);
    await logAudit("payment.corrected", `Corrected a payment total (approved request #${id})`, { type: "package_reservation", id: payload.reservationId }, {
      amount: String(payload.amount),
      reason: payload.reason.slice(0, 200),
    });
    revalidatePath("/admin/payments");
    revalidatePath("/admin/requests");
    revalidatePath("/admin/analytics");
    message = "Approved and applied. The payment total has been corrected.";
  }

  refresh();
  return { id, message };
}

export async function submitApproval(input: ApprovalInput) {
  return toActionResult(() => submitApprovalUnsafe(input));
}
export async function cancelApproval(requestId: number) {
  return toActionResult(() => cancelApprovalUnsafe(requestId));
}
export async function decideApproval(requestId: number, decision: "approve" | "reject", note: string) {
  return toActionResult(() => decideApprovalUnsafe(requestId, decision, note));
}

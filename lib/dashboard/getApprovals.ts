import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ApprovalKind, ApprovalStatus } from "@/lib/tasks/shared";

export type ApprovalRecord = {
  id: number;
  kind: ApprovalKind;
  title: string;
  details: string | null;
  amount: number | null;
  currency: string | null;
  requestedBy: string | null;
  status: ApprovalStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  executedAt: string | null;
  createdAt: string;
};

/** Requests the signed-in person may see: their own, or all of them for approvers (row-level security). */
export async function getApprovals(): Promise<ApprovalRecord[]> {
  const { data, error } = await (await createClient())
    .from("approval_requests")
    .select("id, kind, title, details, amount, currency, requested_by, status, decided_by, decided_at, decision_note, executed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error("[getApprovals]", error);
    throw new Error("Approval requests could not be loaded. Refresh the page to try again.");
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    details: row.details,
    amount: row.amount === null ? null : Number(row.amount),
    currency: row.currency,
    requestedBy: row.requested_by,
    status: row.status,
    decidedBy: row.decided_by,
    decidedAt: row.decided_at,
    decisionNote: row.decision_note,
    executedAt: row.executed_at,
    createdAt: row.created_at,
  }));
}

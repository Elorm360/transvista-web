"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Inbox, Plus, Stamp, X, XCircle } from "lucide-react";
import { cancelApproval, decideApproval, submitApproval } from "@/app/actions/approvals";
import { unwrapActionResult } from "@/lib/actions/result";
import type { ApprovalRecord } from "@/lib/dashboard/getApprovals";
import type { TeamPerson } from "@/lib/dashboard/getTasks";
import { APPROVAL_KINDS, CURRENCIES, labelFor } from "@/lib/tasks/shared";
import { Avatar } from "@/components/admin/Avatar";
import { buttonClass, Card, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-600/20";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};
const statusText: Record<string, string> = { pending: "Waiting", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" };

function money(amount: number | null, currency: string | null) {
  if (amount === null) return null;
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency: currency ?? "GHS", maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency ?? ""} ${amount.toFixed(2)}`;
  }
}

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" });
}

export default function ApprovalsPanel({
  requests,
  people,
  meId,
  canDecide,
}: {
  requests: ApprovalRecord[];
  people: TeamPerson[];
  meId: string;
  canDecide: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<{ kind: string; title: string; details: string; amount: string; currency: string } | null>(null);
  const [deciding, setDeciding] = useState<{ id: number; decision: "approve" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const person = (id: string | null) => (id ? people.find((p) => p.id === id) ?? null : null);
  const name = (id: string | null) => (id === meId ? "You" : person(id)?.name ?? "Former team member");

  const waiting = requests.filter((r) => r.status === "pending" && r.requestedBy !== meId);
  const mine = requests.filter((r) => r.requestedBy === meId);
  const decided = requests.filter((r) => r.status !== "pending" && r.requestedBy !== meId).slice(0, 50);

  async function run(work: () => Promise<string | void>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const message = await work();
      if (message) setNotice(message);
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function RequestRow({ request, actions }: { request: ApprovalRecord; actions?: React.ReactNode }) {
    const requester = person(request.requestedBy);
    const amount = money(request.amount, request.currency);
    return (
      <li className="px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            {requester ? <Avatar name={requester.name} path={requester.avatarPath} size="sm" /> : <span className="h-7 w-7 shrink-0 rounded-full bg-slate-100" aria-hidden="true" />}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{request.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {labelFor(APPROVAL_KINDS, request.kind)} · {name(request.requestedBy)} · {when(request.createdAt)}
              </p>
              {request.details && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.details}</p>}
              {request.decisionNote && (
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span className="font-semibold">{name(request.decidedBy)}:</span> {request.decisionNote}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-row items-center gap-3 pl-10 sm:flex-col sm:items-end sm:pl-0">
            {amount && <span className="text-base font-semibold text-slate-900">{amount}</span>}
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyle[request.status])}>{statusText[request.status]}</span>
          </div>
        </div>
        {actions && <div className="mt-3 flex flex-wrap justify-end gap-2">{actions}</div>}
      </li>
    );
  }

  const selectedKind = APPROVAL_KINDS.find((k) => k.value === form?.kind);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {canDecide ? `${waiting.length} request${waiting.length === 1 ? "" : "s"} waiting for your decision.` : "Ask the CEO to approve spending or a decision. You'll see the answer here."}
        </p>
        <button type="button" className={buttonClass("primary")} onClick={() => { setError(null); setForm({ kind: "expense", title: "", details: "", amount: "", currency: "GHS" }); }}>
          <Plus className="h-4 w-4" aria-hidden="true" />New request
        </button>
      </div>

      {notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{notice}</p>}
      {error && !form && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {canDecide && (
        <Card title="Waiting for your decision" bodyClassName="divide-y divide-slate-100">
          {waiting.length ? (
            <ul className="divide-y divide-slate-100">
              {waiting.map((r) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  actions={deciding?.id === r.id ? (
                    <div className="w-full rounded-lg border border-slate-200 p-3">
                      <label className="block text-sm font-medium text-slate-700">
                        {deciding.decision === "approve" ? "Note (optional)" : "Why are you rejecting it?"}
                        <textarea rows={2} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} className={inputClass} />
                      </label>
                      {r.kind === "payment_correction" && deciding.decision === "approve" && (
                        <p className="mt-2 text-xs text-slate-500">Approving applies the correction to the booking&apos;s payment total straight away.</p>
                      )}
                      <div className="mt-3 flex justify-end gap-2">
                        <button type="button" className={buttonClass("ghost")} onClick={() => setDeciding(null)}>Cancel</button>
                        <button
                          type="button"
                          disabled={busy || (deciding.decision === "reject" && note.trim().length < 3)}
                          className={buttonClass(deciding.decision === "approve" ? "primary" : "danger")}
                          onClick={async () => {
                            const ok = await run(async () => unwrapActionResult(await decideApproval(r.id, deciding.decision, note)).message);
                            if (ok) { setDeciding(null); setNote(""); }
                          }}
                        >
                          {busy ? "Saving…" : deciding.decision === "approve" ? "Confirm approval" : "Confirm rejection"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button type="button" className={buttonClass("danger")} onClick={() => { setDeciding({ id: r.id, decision: "reject" }); setNote(""); }}>
                        <XCircle className="h-4 w-4" aria-hidden="true" />Reject
                      </button>
                      <button type="button" className={buttonClass("primary")} onClick={() => { setDeciding({ id: r.id, decision: "approve" }); setNote(""); }}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />Approve
                      </button>
                    </>
                  )}
                />
              ))}
            </ul>
          ) : <EmptyState icon={Stamp} title="All caught up" description="New requests from the team will appear here." />}
        </Card>
      )}

      <Card title="My requests" bodyClassName="divide-y divide-slate-100">
        {mine.length ? (
          <ul className="divide-y divide-slate-100">
            {mine.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                actions={r.status === "pending" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={buttonClass("ghost")}
                    onClick={() => {
                      if (!window.confirm(`Cancel your request "${r.title}"?`)) return;
                      void run(async () => { unwrapActionResult(await cancelApproval(r.id)); return "Request cancelled."; });
                    }}
                  >
                    Cancel request
                  </button>
                ) : undefined}
              />
            ))}
          </ul>
        ) : <EmptyState icon={Inbox} title="No requests yet" description="Use New request to ask for approval of an expense or a decision." />}
      </Card>

      {canDecide && decided.length > 0 && (
        <Card title="Decided" description="The most recent 50 decisions." bodyClassName="divide-y divide-slate-100">
          <ul className="divide-y divide-slate-100">
            {decided.map((r) => <RequestRow key={r.id} request={r} />)}
          </ul>
        </Card>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="approval-form-title">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="approval-form-title" className="text-lg font-semibold text-slate-900">Ask for approval</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <fieldset>
                <legend className="text-sm font-medium text-slate-700">What is it?</legend>
                <div className="mt-2 grid gap-2">
                  {APPROVAL_KINDS.filter((k) => k.value !== "payment_correction").map((k) => (
                    <label key={k.value} className={cn("flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5", form.kind === k.value ? "border-brand-blue-500 bg-brand-blue-50/50" : "border-slate-200")}>
                      <input type="radio" name="approval-kind" value={k.value} checked={form.kind === k.value} onChange={() => setForm({ ...form, kind: k.value })} className="mt-1" />
                      <span><span className="block text-sm font-semibold text-slate-900">{k.label}</span><span className="block text-xs text-slate-500">{k.hint}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-medium text-slate-700">Title
                <input value={form.title} maxLength={160} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.kind === "expense" ? "e.g. Fuel advance for the Mole trip" : "e.g. Switch to a new bus company"} className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-slate-700">Details
                <textarea rows={3} value={form.details} maxLength={4000} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="What, why, and by when. Add the supplier or booking if relevant." className={inputClass} />
              </label>
              <div className="grid grid-cols-[1fr_7rem] gap-3">
                <label className="block text-sm font-medium text-slate-700">Amount {form.kind !== "expense" && <span className="font-normal text-slate-400">(optional)</span>}
                  <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
                </label>
                <label className="block text-sm font-medium text-slate-700">Currency
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputClass}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              {selectedKind && <p className="text-xs text-slate-500">The CEO is notified, and you&apos;ll see their decision under My requests.</p>}
            </div>
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className={buttonClass("secondary")} onClick={() => setForm(null)}>Cancel</button>
              <button
                type="button"
                className={buttonClass("primary")}
                disabled={busy || form.title.trim().length < 3}
                onClick={async () => {
                  const ok = await run(async () => { unwrapActionResult(await submitApproval(form)); return "Request sent to the CEO."; });
                  if (ok) setForm(null);
                }}
              >
                {busy ? "Sending…" : "Send request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, Flag, Plus, Search, Trash2, X } from "lucide-react";
import { addTaskNote, clearEscalation, deleteTask, escalateTask, saveTask, setTaskStatus } from "@/app/actions/tasks";
import { unwrapActionResult } from "@/lib/actions/result";
import type { TaskRecord, TeamPerson } from "@/lib/dashboard/getTasks";
import { isOverdue, labelFor, TASK_DEPARTMENTS, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/tasks/shared";
import { Avatar } from "@/components/admin/Avatar";
import { buttonClass, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type View = "mine" | "delegated" | "all" | "escalated" | "done";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-600/20";

const priorityStyle: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-brand-orange-500",
  normal: "bg-brand-blue-400",
  low: "bg-slate-300",
};

const statusStyle: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-brand-blue-50 text-brand-blue-800",
  blocked: "bg-amber-50 text-amber-800",
  done: "bg-emerald-50 text-emerald-700",
};

function dueLabel(task: TaskRecord) {
  if (!task.dueAt) return null;
  const date = new Date(task.dueAt);
  const text = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Accra" });
  return isOverdue(task) ? `Overdue · ${text}` : `Due ${text}`;
}

function toDateInput(iso: string | null) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : "";
}

type Draft = {
  id?: number;
  title: string;
  details: string;
  department: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  bookingReference: string;
};

export default function TasksBoard({
  tasks,
  people,
  meId,
  canSeeAll,
  canDecide,
  initialView,
}: {
  tasks: TaskRecord[];
  people: TeamPerson[];
  meId: string;
  /** COO / Super Admin: everyone's tasks. */
  canSeeAll: boolean;
  /** CEO / approver: can close escalations. */
  canDecide: boolean;
  initialView?: string;
}) {
  const router = useRouter();
  const views: Array<{ value: View; label: string; count: number }> = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done");
    const list: Array<{ value: View; label: string; count: number }> = [
      { value: "mine", label: "My tasks", count: open.filter((t) => t.assignedTo === meId).length },
      { value: "delegated", label: "Assigned by me", count: open.filter((t) => t.createdBy === meId && t.assignedTo !== meId).length },
    ];
    if (canSeeAll) list.push({ value: "all", label: "Whole team", count: open.length });
    if (canSeeAll || canDecide) list.push({ value: "escalated", label: "Escalated", count: open.filter((t) => t.escalatedAt).length });
    list.push({ value: "done", label: "Done", count: tasks.length - open.length });
    return list;
  }, [tasks, meId, canSeeAll, canDecide]);

  const [view, setView] = useState<View>(() => (views.some((v) => v.value === initialView) ? (initialView as View) : "mine"));
  const [department, setDepartment] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personName = (id: string | null) => (id ? people.find((p) => p.id === id)?.name ?? "Former team member" : "Unassigned");
  const person = (id: string | null) => (id ? people.find((p) => p.id === id) ?? null : null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank = { urgent: 0, high: 1, normal: 2, low: 3 } as Record<string, number>;
    return tasks
      .filter((t) => {
        if (view === "done") return t.status === "done";
        if (t.status === "done") return false;
        if (view === "mine") return t.assignedTo === meId;
        if (view === "delegated") return t.createdBy === meId && t.assignedTo !== meId;
        if (view === "escalated") return Boolean(t.escalatedAt);
        return true;
      })
      .filter((t) => !department || t.department === department)
      .filter((t) => !q || `${t.title} ${t.details ?? ""} ${t.bookingReference ?? ""} ${personName(t.assignedTo)}`.toLowerCase().includes(q))
      .sort((a, b) => {
        if (view === "done") return (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
        const overdue = Number(isOverdue(b)) - Number(isOverdue(a));
        if (overdue) return overdue;
        const due = (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999");
        return due || rank[a.priority] - rank[b.priority];
      });
    // personName depends on people only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, view, department, query, meId, people]);

  const openTask = tasks.find((t) => t.id === openId) ?? null;

  async function run<T>(work: () => Promise<T>, after?: (value: T) => void) {
    setBusy(true);
    setError(null);
    try {
      const value = await work();
      after?.(value);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function newDraft(): Draft {
    return { title: "", details: "", department: "general", priority: "normal", assignedTo: meId, dueDate: "", bookingReference: "" };
  }

  function editDraft(task: TaskRecord): Draft {
    return {
      id: task.id,
      title: task.title,
      details: task.details ?? "",
      department: task.department,
      priority: task.priority,
      assignedTo: task.assignedTo ?? "",
      dueDate: toDateInput(task.dueAt),
      bookingReference: task.bookingReference ?? "",
    };
  }

  function submitDraft() {
    if (!draft) return;
    void run(
      async () => unwrapActionResult(await saveTask({
        id: draft.id,
        title: draft.title,
        details: draft.details,
        department: draft.department,
        priority: draft.priority,
        assignedTo: draft.assignedTo || null,
        // End of the chosen day in Ghana (UTC+0).
        dueAt: draft.dueDate ? `${draft.dueDate}T17:00:00Z` : "",
        bookingReference: draft.bookingReference,
      })),
      () => setDraft(null),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none]" role="tablist" aria-label="Task views">
          {views.map((v) => (
            <button
              key={v.value}
              type="button"
              role="tab"
              aria-selected={view === v.value}
              onClick={() => setView(v.value)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
                view === v.value ? "border-brand-blue-600 text-brand-blue-700" : "border-transparent text-slate-500 hover:text-slate-800",
              )}
            >
              {v.label}
              <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{v.count}</span>
            </button>
          ))}
        </div>
        <button type="button" className={buttonClass("primary")} onClick={() => { setError(null); setDraft(newDraft()); }}>
          <Plus className="h-4 w-4" aria-hidden="true" />New task
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search tasks</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, person or booking reference" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-blue-500" />
        </label>
        <label className="sm:w-56">
          <span className="sr-only">Department</span>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="">All departments</option>
            {TASK_DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </label>
      </div>

      {error && !draft && !openTask && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {visible.length ? (
          <ul className="divide-y divide-slate-100">
            {visible.map((task) => {
              const assignee = person(task.assignedTo);
              const due = dueLabel(task);
              return (
                <li key={task.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => { setError(null); setOpenId(task.id); }} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                    <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", priorityStyle[task.priority])} title={`${labelFor(TASK_PRIORITIES, task.priority)} priority`} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-blue-700">{task.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>{labelFor(TASK_DEPARTMENTS, task.department)}</span>
                        {due && <span className={cn("inline-flex items-center gap-1", isOverdue(task) && "font-semibold text-red-600")}><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />{due}</span>}
                        {task.bookingReference && <span>{task.bookingReference}</span>}
                        {task.escalatedAt && <span className="inline-flex items-center gap-1 font-semibold text-brand-orange-700"><Flag className="h-3.5 w-3.5" aria-hidden="true" />Escalated</span>}
                        {task.notes.length > 0 && <span>{task.notes.length} update{task.notes.length === 1 ? "" : "s"}</span>}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-3 pl-5 sm:pl-0">
                    <span className="flex min-w-0 items-center gap-2 text-xs text-slate-600 sm:w-40">
                      {assignee ? <Avatar name={assignee.name} path={assignee.avatarPath} size="sm" /> : <span className="h-7 w-7 rounded-full border border-dashed border-slate-300" aria-hidden="true" />}
                      <span className="truncate">{task.assignedTo === meId ? "You" : personName(task.assignedTo)}</span>
                    </span>
                    <label>
                      <span className="sr-only">Status of {task.title}</span>
                      <select
                        value={task.status}
                        disabled={busy}
                        onChange={(e) => void run(async () => unwrapActionResult(await setTaskStatus(task.id, e.target.value)))}
                        className={cn("h-8 rounded-full border-0 px-3 text-xs font-semibold", statusStyle[task.status])}
                      >
                        {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={view === "done" ? CheckCircle2 : ClipboardCheck}
            title={view === "mine" ? "Nothing on your list" : view === "escalated" ? "No escalations" : "No tasks here"}
            description={view === "mine" ? "Tasks assigned to you will show up here. Create one to plan your own work." : "Try another view or department."}
          />
        )}
      </div>

      {/* New / edit task */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="task-form-title" className="text-lg font-semibold text-slate-900">{draft.id ? "Edit task" : "New task"}</h2>
              <button type="button" onClick={() => setDraft(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-slate-700">What needs doing?
                <input autoFocus value={draft.title} maxLength={160} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Confirm bus for the Volta trip" className={inputClass} />
              </label>
              <label className="block text-sm font-medium text-slate-700">Details <span className="font-normal text-slate-400">(optional)</span>
                <textarea rows={3} value={draft.details} maxLength={4000} onChange={(e) => setDraft({ ...draft, details: e.target.value })} className={inputClass} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">Assign to
                  <select value={draft.assignedTo} onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })} className={inputClass}>
                    <option value="">Unassigned</option>
                    {people.map((p) => <option key={p.id} value={p.id}>{p.id === meId ? `${p.name} (you)` : p.name}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">Due date
                  <input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} className={inputClass} />
                </label>
                <label className="block text-sm font-medium text-slate-700">Department
                  <select value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} className={inputClass}>
                    {TASK_DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">Priority
                  <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className={inputClass}>
                    {TASK_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">Booking reference <span className="font-normal text-slate-400">(optional)</span>
                <input value={draft.bookingReference} maxLength={40} onChange={(e) => setDraft({ ...draft, bookingReference: e.target.value })} placeholder="e.g. TV-2026-0142" className={inputClass} />
              </label>
              {draft.assignedTo && draft.assignedTo !== meId && !canSeeAll && (
                <p className="text-xs text-slate-500">Both you and {personName(draft.assignedTo)} will be able to see and update this task.</p>
              )}
            </div>
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className={buttonClass("secondary")} onClick={() => setDraft(null)}>Cancel</button>
              <button type="button" className={buttonClass("primary")} disabled={busy || draft.title.trim().length < 3} onClick={submitDraft}>
                {busy ? "Saving…" : draft.id ? "Save changes" : "Create task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task details */}
      {openTask && !draft && (
        <TaskDrawer
          task={openTask}
          meId={meId}
          canSeeAll={canSeeAll}
          canDecide={canDecide}
          personName={personName}
          busy={busy}
          error={error}
          onClose={() => { setOpenId(null); setError(null); }}
          onEdit={() => { setError(null); setDraft(editDraft(openTask)); }}
          onNote={(body, done) => void run(async () => unwrapActionResult(await addTaskNote(openTask.id, body)), done)}
          onEscalate={(reason, done) => void run(async () => unwrapActionResult(await escalateTask(openTask.id, reason)), done)}
          onClearEscalation={() => void run(async () => unwrapActionResult(await clearEscalation(openTask.id)))}
          onDelete={() => {
            if (!window.confirm(`Delete the task "${openTask.title}"? This can't be undone.`)) return;
            void run(async () => unwrapActionResult(await deleteTask(openTask.id)), () => setOpenId(null));
          }}
        />
      )}
    </div>
  );
}

function TaskDrawer({
  task, meId, canSeeAll, canDecide, personName, busy, error, onClose, onEdit, onNote, onEscalate, onClearEscalation, onDelete,
}: {
  task: TaskRecord;
  meId: string;
  canSeeAll: boolean;
  canDecide: boolean;
  personName: (id: string | null) => string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onEdit: () => void;
  onNote: (body: string, done: () => void) => void;
  onEscalate: (reason: string, done: () => void) => void;
  onClearEscalation: () => void;
  onDelete: () => void;
}) {
  const [note, setNote] = useState("");
  const [escalating, setEscalating] = useState(false);
  const [reason, setReason] = useState("");
  const canDelete = canSeeAll || task.createdBy === meId;
  const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45" role="dialog" aria-modal="true" aria-labelledby="task-drawer-title">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close task" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{labelFor(TASK_DEPARTMENTS, task.department)} · {labelFor(TASK_PRIORITIES, task.priority)} priority</p>
            <h2 id="task-drawer-title" className="mt-1 text-lg font-semibold text-slate-900">{task.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs text-slate-500">Assigned to</dt><dd className="mt-0.5 font-medium text-slate-900">{task.assignedTo === meId ? "You" : personName(task.assignedTo)}</dd></div>
            <div><dt className="text-xs text-slate-500">Created by</dt><dd className="mt-0.5 font-medium text-slate-900">{task.createdBy === meId ? "You" : personName(task.createdBy)}</dd></div>
            <div><dt className="text-xs text-slate-500">Due</dt><dd className={cn("mt-0.5 font-medium", isOverdue(task) ? "text-red-600" : "text-slate-900")}>{task.dueAt ? new Date(task.dueAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "No due date"}</dd></div>
            <div><dt className="text-xs text-slate-500">Status</dt><dd className="mt-0.5 font-medium text-slate-900">{labelFor(TASK_STATUSES, task.status)}</dd></div>
            {task.bookingReference && <div className="col-span-2"><dt className="text-xs text-slate-500">Booking</dt><dd className="mt-0.5 font-medium text-slate-900">{task.bookingReference}</dd></div>}
          </dl>

          {task.details && <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{task.details}</p>}

          {task.escalatedAt && (
            <div className="rounded-lg border border-brand-orange-200 bg-brand-orange-50 px-4 py-3 text-sm text-brand-orange-900">
              <p className="flex items-center gap-2 font-semibold"><Flag className="h-4 w-4" aria-hidden="true" />Escalated to the CEO · {when(task.escalatedAt)}</p>
              {task.escalationNote && <p className="mt-1">{task.escalationNote}</p>}
              {canDecide && <button type="button" disabled={busy} onClick={onClearEscalation} className="mt-2 text-sm font-semibold underline-offset-2 hover:underline">Mark as handled</button>}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass("secondary")} onClick={onEdit}>Edit</button>
            {!task.escalatedAt && task.status !== "done" && (
              <button type="button" className={buttonClass("secondary")} onClick={() => setEscalating((v) => !v)}>
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />Escalate to CEO
              </button>
            )}
            {canDelete && <button type="button" className={buttonClass("danger")} disabled={busy} onClick={onDelete}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>}
          </div>

          {escalating && (
            <div className="rounded-lg border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700">Why does this need the CEO?
                <textarea rows={2} value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="e.g. Supplier wants payment upfront and it's over budget" />
              </label>
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" className={buttonClass("ghost")} onClick={() => setEscalating(false)}>Cancel</button>
                <button type="button" className={buttonClass("primary")} disabled={busy || reason.trim().length < 5} onClick={() => onEscalate(reason, () => { setEscalating(false); setReason(""); })}>Escalate</button>
              </div>
            </div>
          )}

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Updates</h3>
            {task.notes.length ? (
              <ol className="mt-3 space-y-3">
                {task.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-slate-100 px-3 py-2">
                    <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">{n.authorId === meId ? "You" : personName(n.authorId)}</span> · {when(n.createdAt)}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{n.body}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-2 text-sm text-slate-500">No updates yet.</p>}
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700"><span className="sr-only">Add an update</span>
                <textarea rows={2} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} placeholder="Add a progress update…" className={inputClass} />
              </label>
              <div className="mt-2 flex justify-end">
                <button type="button" className={buttonClass("primary")} disabled={busy || !note.trim()} onClick={() => onNote(note, () => setNote(""))}>Post update</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

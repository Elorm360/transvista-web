"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasAdminArea, NO_ACCESS_MESSAGE, resolveAdminAccess } from "@/lib/auth/access";
import { toActionResult } from "@/lib/actions/result";
import { logAudit } from "@/lib/audit";
import { TASK_DEPARTMENTS, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/tasks/shared";

export type TaskInput = {
  /** Omit to create a new task. */
  id?: number;
  title: string;
  details: string;
  department: string;
  priority: string;
  assignedTo: string | null;
  /** ISO date-time or empty. */
  dueAt: string;
  bookingReference: string;
};

async function currentMember() {
  if (!(await hasAdminArea("tasks"))) throw new Error(NO_ACCESS_MESSAGE);
  const result = await resolveAdminAccess();
  if (result.status !== "ok") throw new Error(NO_ACCESS_MESSAGE);
  return result.access;
}

function refresh() {
  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
}

function validId(id: unknown): number {
  const value = Number(id);
  if (!Number.isInteger(value) || value < 1) throw new Error("This task could not be found. Refresh the page.");
  return value;
}

async function saveTaskUnsafe(input: TaskInput) {
  const me = await currentMember();
  const title = input.title.trim();
  const details = input.details.trim();
  const bookingReference = input.bookingReference.trim().toUpperCase();
  if (title.length < 3 || title.length > 160) throw new Error("Give the task a short title (3–160 characters).");
  if (details.length > 4000) throw new Error("Keep the details under 4,000 characters.");
  if (bookingReference.length > 40) throw new Error("That booking reference looks too long.");
  if (!TASK_DEPARTMENTS.some((d) => d.value === input.department)) throw new Error("Choose a department.");
  if (!TASK_PRIORITIES.some((p) => p.value === input.priority)) throw new Error("Choose a priority.");

  let dueAt: string | null = null;
  if (input.dueAt) {
    const parsed = new Date(input.dueAt);
    if (Number.isNaN(parsed.getTime())) throw new Error("Choose a valid due date.");
    dueAt = parsed.toISOString();
  }

  const supabase = await createClient();
  if (input.assignedTo) {
    const { data: team } = await supabase.rpc("list_team_directory");
    if (!(team ?? []).some((person: { id: string }) => person.id === input.assignedTo)) {
      throw new Error("Choose someone who is active on the team.");
    }
  }

  const fields = {
    title,
    details: details || null,
    department: input.department,
    priority: input.priority,
    assigned_to: input.assignedTo || null,
    due_at: dueAt,
    booking_reference: bookingReference || null,
  };

  if (input.id) {
    const id = validId(input.id);
    const { data, error } = await supabase.from("admin_tasks").update(fields).eq("id", id).select("id").maybeSingle();
    if (error || !data) {
      console.error("[saveTask] update:", error);
      throw new Error("The task could not be saved. Only its creator, the person it's assigned to, or a team lead can change it.");
    }
    refresh();
    return { id, created: false };
  }

  const { data, error } = await supabase
    .from("admin_tasks")
    .insert({ ...fields, created_by: me.memberId })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[saveTask] insert:", error);
    throw new Error("The task could not be created.");
  }
  refresh();
  await logAudit("task.created", `Created task "${title}"`, { type: "task", id: data.id }, {
    assignedTo: input.assignedTo ?? "unassigned",
    priority: input.priority,
    due: dueAt ?? "none",
  });
  return { id: data.id as number, created: true };
}

async function setTaskStatusUnsafe(taskId: number, status: string) {
  await currentMember();
  const id = validId(taskId);
  if (!TASK_STATUSES.some((s) => s.value === status)) throw new Error("Choose a valid status.");
  const { data, error } = await (await createClient())
    .from("admin_tasks").update({ status }).eq("id", id).select("id").maybeSingle();
  if (error || !data) throw new Error("The status could not be changed.");
  refresh();
  return { id, status };
}

async function addTaskNoteUnsafe(taskId: number, body: string) {
  const me = await currentMember();
  const id = validId(taskId);
  const text = body.trim();
  if (!text) throw new Error("Write an update first.");
  if (text.length > 2000) throw new Error("Keep updates under 2,000 characters.");
  const { error } = await (await createClient())
    .from("admin_task_notes").insert({ task_id: id, author_member_id: me.memberId, body: text });
  if (error) {
    console.error("[addTaskNote]", error);
    throw new Error("The update could not be added.");
  }
  refresh();
  return { id };
}

async function escalateTaskUnsafe(taskId: number, reason: string) {
  const me = await currentMember();
  const id = validId(taskId);
  const note = reason.trim();
  if (note.length < 5) throw new Error("Say briefly why this needs the CEO.");
  if (note.length > 1000) throw new Error("Keep the reason under 1,000 characters.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_tasks")
    .update({ escalated_at: new Date().toISOString(), escalation_note: note })
    .eq("id", id)
    .select("id, title")
    .maybeSingle();
  if (error || !data) throw new Error("The task could not be escalated.");
  await supabase.from("admin_task_notes").insert({ task_id: id, author_member_id: me.memberId, body: `Escalated to the CEO: ${note}` });
  refresh();
  await logAudit("task.escalated", `Escalated task "${data.title}" to the CEO`, { type: "task", id }, { reason: note.slice(0, 200) });
  return { id };
}

async function clearEscalationUnsafe(taskId: number) {
  const me = await currentMember();
  if (!(await hasAdminArea("approvals"))) throw new Error("Only the CEO (or someone who approves on their behalf) can close an escalation.");
  const id = validId(taskId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_tasks").update({ escalated_at: null, escalation_note: null }).eq("id", id).select("id").maybeSingle();
  if (error || !data) throw new Error("The escalation could not be closed.");
  await supabase.from("admin_task_notes").insert({ task_id: id, author_member_id: me.memberId, body: "Escalation handled by the CEO." });
  refresh();
  return { id };
}

async function deleteTaskUnsafe(taskId: number) {
  await currentMember();
  const id = validId(taskId);
  const { data, error } = await (await createClient())
    .from("admin_tasks").delete().eq("id", id).select("id, title").maybeSingle();
  if (error || !data) throw new Error("Only the person who created this task, or a team lead, can delete it.");
  refresh();
  await logAudit("task.deleted", `Deleted task "${data.title}"`, { type: "task", id });
  return { id };
}

export async function saveTask(input: TaskInput) {
  return toActionResult(() => saveTaskUnsafe(input));
}
export async function setTaskStatus(taskId: number, status: string) {
  return toActionResult(() => setTaskStatusUnsafe(taskId, status));
}
export async function addTaskNote(taskId: number, body: string) {
  return toActionResult(() => addTaskNoteUnsafe(taskId, body));
}
export async function escalateTask(taskId: number, reason: string) {
  return toActionResult(() => escalateTaskUnsafe(taskId, reason));
}
export async function clearEscalation(taskId: number) {
  return toActionResult(() => clearEscalationUnsafe(taskId));
}
export async function deleteTask(taskId: number) {
  return toActionResult(() => deleteTaskUnsafe(taskId));
}

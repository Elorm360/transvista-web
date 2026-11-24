import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { TaskDepartment, TaskPriority, TaskStatus } from "@/lib/tasks/shared";

export type TeamPerson = { id: string; name: string; avatarPath: string | null };

export type TaskNote = { id: number; authorId: string | null; body: string; createdAt: string };

export type TaskRecord = {
  id: number;
  title: string;
  details: string | null;
  department: TaskDepartment;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string | null;
  createdBy: string | null;
  dueAt: string | null;
  bookingReference: string | null;
  escalatedAt: string | null;
  escalationNote: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes: TaskNote[];
};

/** Everyone active on the team (names and photos), for assigning tasks. */
export async function getTeamDirectory(): Promise<TeamPerson[]> {
  const { data, error } = await (await createClient()).rpc("list_team_directory");
  if (error) {
    console.error("[getTeamDirectory]", error);
    return [];
  }
  return ((data ?? []) as Array<{ id: string; full_name: string; avatar_path: string | null }>).map((row) => ({
    id: row.id,
    name: row.full_name,
    avatarPath: row.avatar_path,
  }));
}

/**
 * Tasks the signed-in person may see (row-level security decides: their own,
 * ones they created, or everyone's for the COO / Super Admin), with notes.
 */
export async function getTasks(): Promise<TaskRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_tasks")
    .select("id, title, details, department, priority, status, assigned_to, created_by, due_at, booking_reference, escalated_at, escalation_note, completed_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[getTasks]", error);
    throw new Error("Tasks could not be loaded. Refresh the page to try again.");
  }

  const ids = (data ?? []).map((row) => row.id);
  const notesByTask = new Map<number, TaskNote[]>();
  if (ids.length) {
    const { data: notes, error: notesError } = await supabase
      .from("admin_task_notes")
      .select("id, task_id, author_member_id, body, created_at")
      .in("task_id", ids)
      .order("created_at", { ascending: true })
      .limit(2000);
    if (notesError) console.error("[getTasks] notes:", notesError);
    for (const note of notes ?? []) {
      const list = notesByTask.get(note.task_id) ?? [];
      list.push({ id: note.id, authorId: note.author_member_id, body: note.body, createdAt: note.created_at });
      notesByTask.set(note.task_id, list);
    }
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    details: row.details,
    department: row.department,
    priority: row.priority,
    status: row.status,
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    dueAt: row.due_at,
    bookingReference: row.booking_reference,
    escalatedAt: row.escalated_at,
    escalationNote: row.escalation_note,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: notesByTask.get(row.id) ?? [],
  }));
}

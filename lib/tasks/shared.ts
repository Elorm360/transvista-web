/** Task and approval options shared by the server and the browser. */

export const TASK_DEPARTMENTS = [
  { value: "operations", label: "Travel operations" },
  { value: "community", label: "Community & comms" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance & admin" },
  { value: "technology", label: "Technology" },
  { value: "general", label: "General" },
] as const;

export const TASK_PRIORITIES = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
] as const;

export const TASK_STATUSES = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
] as const;

export type TaskDepartment = (typeof TASK_DEPARTMENTS)[number]["value"];
export type TaskPriority = (typeof TASK_PRIORITIES)[number]["value"];
export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export const APPROVAL_KINDS = [
  { value: "expense", label: "Expense", hint: "Spending money: supplies, transport, venue, subscriptions" },
  { value: "operational", label: "Operational request", hint: "A decision you need sign-off on: new supplier, schedule change, discount" },
  { value: "other", label: "Other", hint: "Anything else that needs the CEO's approval" },
  { value: "payment_correction", label: "Payment correction", hint: "Created automatically from the Payments page" },
] as const;

export type ApprovalKind = (typeof APPROVAL_KINDS)[number]["value"];
export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export const CURRENCIES = ["GHS", "USD", "GBP", "EUR"] as const;

export function labelFor<T extends { value: string; label: string }>(list: readonly T[], value: string): string {
  return list.find((item) => item.value === value)?.label ?? value;
}

/** A task is overdue when it has a due date in the past and isn't done. */
export function isOverdue(task: { dueAt: string | null; status: string }, now = Date.now()): boolean {
  return Boolean(task.dueAt && task.status !== "done" && new Date(task.dueAt).getTime() < now);
}

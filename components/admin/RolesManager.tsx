"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Pencil, Plus, Trash2, X } from "lucide-react";
import { buttonClass, Card, EmptyState } from "@/components/admin/ui";
import { deleteCustomRole, saveCustomRole } from "@/app/actions/roles";
import { unwrapActionResult } from "@/lib/actions/result";
import { BASE_ROLE_AREAS, CUSTOM_ROLE_BASES, GRANTABLE_AREAS, type AdminArea } from "@/lib/auth/permissions";
import type { CustomRole } from "@/lib/dashboard/getRoles";

type Draft = { key?: string; name: string; description: string; baseRole: string; permissions: string[] };

const emptyDraft: Draft = { name: "", description: "", baseRole: "support", permissions: [] };

const baseLabel = (role: string) => CUSTOM_ROLE_BASES.find((b) => b.role === role)?.label ?? role;
const areaLabel = (area: string) => GRANTABLE_AREAS.find((a) => a.area === area)?.label ?? area;

/** Owner-only: create and edit custom roles (e.g. COO, Finance Manager). */
export default function RolesManager({ roles }: { roles: CustomRole[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const allowedForBase = (base: string) =>
    GRANTABLE_AREAS.filter((entry) => BASE_ROLE_AREAS[base as keyof typeof BASE_ROLE_AREAS]?.includes(entry.area as AdminArea));

  function open(role?: CustomRole) {
    setError(null);
    setNotice(null);
    setDraft(
      role
        ? { key: role.key, name: role.name, description: role.description ?? "", baseRole: role.baseRole, permissions: role.permissions }
        : { ...emptyDraft, permissions: allowedForBase(emptyDraft.baseRole).map((entry) => entry.area) },
    );
  }

  function setBase(baseRole: string) {
    if (!draft) return;
    const allowed = new Set(allowedForBase(baseRole).map((entry) => entry.area as string));
    // Keep only sections the new base allows.
    setDraft({ ...draft, baseRole, permissions: draft.permissions.filter((area) => allowed.has(area)) });
  }

  function toggle(area: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      permissions: draft.permissions.includes(area) ? draft.permissions.filter((a) => a !== area) : [...draft.permissions, area],
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const result = unwrapActionResult(await saveCustomRole(draft));
      setNotice(`${result.created ? "Created" : "Saved"} "${result.name}".`);
      setDraft(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The role could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(role: CustomRole) {
    const warning = role.memberCount
      ? `Delete "${role.name}"? ${role.memberCount} team member${role.memberCount === 1 ? "" : "s"} will keep the ${baseLabel(role.baseRole)} access level.`
      : `Delete "${role.name}"?`;
    if (!window.confirm(warning)) return;
    setError(null);
    try {
      const result = unwrapActionResult(await deleteCustomRole(role.key));
      setNotice(`Deleted "${result.name}".`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The role could not be deleted.");
    }
  }

  return (
    <Card
      title={<span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />Roles</span>}
      description="Create roles like COO or Finance Manager. Each is built on an access level and limited to the sections you choose."
      action={<button type="button" onClick={() => open()} className={buttonClass("primary")}><Plus className="h-4 w-4" aria-hidden="true" /> New role</button>}
    >
      {notice && <p role="status" className="mx-5 mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}
      {error && !draft && <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      {roles.length ? (
        <ul className="divide-y divide-slate-100">
          {roles.map((role) => (
            <li key={role.key} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {role.name}
                  <span className="ml-2 text-xs font-normal text-slate-500">built on {baseLabel(role.baseRole)} · {role.memberCount} member{role.memberCount === 1 ? "" : "s"}</span>
                </p>
                {role.description && <p className="mt-0.5 text-sm text-slate-500">{role.description}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {role.permissions.map((area) => (
                    <span key={area} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{areaLabel(area)}</span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => open(role)} className={buttonClass("ghost", "px-2.5 py-1.5")}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</button>
                <button type="button" onClick={() => remove(role)} className={buttonClass("ghost", "px-2.5 py-1.5 text-red-700 hover:bg-red-50")}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={KeyRound} title="No custom roles yet" description="Team members use the four standard levels until you create roles." />
      )}

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="role-dialog-title">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="role-dialog-title" className="text-lg font-semibold text-slate-900">{draft.key ? "Edit role" : "New role"}</h2>
              <button type="button" onClick={() => setDraft(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Name
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required minLength={2} maxLength={60} placeholder="e.g. Finance Manager"
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100" />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={300} placeholder="What this person is responsible for"
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100" />
            </label>

            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-slate-700">Access level</legend>
              <p className="mt-0.5 text-xs text-slate-500">The most this role can ever do. Sections below can only narrow it.</p>
              <div className="mt-2 space-y-2">
                {CUSTOM_ROLE_BASES.map((base) => (
                  <label key={base.role} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${draft.baseRole === base.role ? "border-brand-blue-600 bg-brand-blue-50" : "border-slate-200"}`}>
                    <input type="radio" name="baseRole" value={base.role} checked={draft.baseRole === base.role} onChange={() => setBase(base.role)} className="mt-1" />
                    <span><span className="block text-sm font-medium text-slate-900">{base.label}</span><span className="block text-xs text-slate-500">{base.description}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-slate-700">Sections this role can use</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {allowedForBase(draft.baseRole).map((entry) => (
                  <label key={entry.area} className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 px-3 py-2">
                    <input type="checkbox" checked={draft.permissions.includes(entry.area)} onChange={() => toggle(entry.area)} className="mt-0.5" />
                    <span><span className="block text-sm font-medium text-slate-900">{entry.label}</span><span className="block text-xs text-slate-500">{entry.description}</span></span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Everyone can see the Overview. Settings and the audit log stay with the owner.</p>
            </fieldset>

            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className={buttonClass("secondary")}>Cancel</button>
              <button type="submit" disabled={saving} className={buttonClass("primary")}>{saving ? "Saving…" : draft.key ? "Save role" : "Create role"}</button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}

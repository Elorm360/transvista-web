"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Mail,
  CheckCircle2,
  Plus,
  X,
  Users,
  Trash2,
  Pencil,
  Send,
  UserX,
} from "lucide-react";
import {
  inviteTeamMember,
  removeTeamMember,
  reactivateTeamMember,
  resendTeamInvite,
  resetTeamMemberTwoFactor,
  deleteTeamMemberPermanently,
  updateTeamMemberDetails,
} from "@/app/actions/team-members";
import { unwrapActionResult } from "@/lib/actions/result";
import type { TeamMember } from "@/lib/dashboard/getTeamMembers";
import type { CustomRole } from "@/lib/dashboard/getRoles";
import { StatusBadge } from "@/components/admin/ui";
import { Avatar } from "@/components/admin/Avatar";
import { effectiveAreas, GRANTABLE_AREAS } from "@/lib/auth/permissions";

interface TeamMembersTableProps {
  members: TeamMember[];
  roles: CustomRole[];
}

type BaseRole = "admin" | "community_manager" | "support";

function formatRole(role: string): string {
  if (role === "owner") return "Super Admin";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TeamMembersTable({ members, roles }: TeamMembersTableProps) {
  // A role choice is a base level ("support") or a custom role ("custom:finance_manager").
  const decodeRole = (choice: string): { role: BaseRole; customRoleKey: string | null } => {
    if (choice.startsWith("custom:")) {
      const custom = roles.find((r) => r.key === choice.slice(7));
      if (custom) return { role: custom.baseRole, customRoleKey: custom.key };
    }
    return { role: choice as BaseRole, customRoleKey: null };
  };
  const roleLabelFor = (member: TeamMember) =>
    (member.customRoleKey && roles.find((r) => r.key === member.customRoleKey)?.name) || formatRole(member.role);
  const customOptions = roles.length ? (
    <optgroup label="Team roles">
      {roles.map((r) => <option key={r.key} value={`custom:${r.key}`}>{r.name}</option>)}
    </optgroup>
  ) : null;
  /** Plain-language summary of what a role choice can open, shown under the role picker. */
  const accessPreview = (choice: string) => {
    const custom = choice.startsWith("custom:") ? roles.find((r) => r.key === choice.slice(7)) : undefined;
    const areas = custom ? effectiveAreas(custom.baseRole, custom.permissions) : effectiveAreas(choice as BaseRole, null);
    const sections = GRANTABLE_AREAS.filter((item) => areas.includes(item.area));
    return (
      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600">
        {custom?.description && <p className="mb-2 text-slate-700">{custom.description}</p>}
        <p className="font-semibold text-slate-800">They&apos;ll be able to open:</p>
        <ul className="mt-1 space-y-0.5">
          <li>Overview</li>
          {sections.map((item) => <li key={item.area}><span className="font-medium text-slate-800">{item.label}</span> · {item.description}</li>)}
        </ul>
        {!areas.includes("payments") && <p className="mt-2 text-slate-500">Money figures and the payment ledger stay hidden.</p>}
      </div>
    );
  };
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const defaultRoleChoice = roles.length ? `custom:${roles[0].key}` : "community_manager";
  const [role, setRole] = useState<string>(defaultRoleChoice);

  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  // Errors from the inline Reactivate button (not shown inside the remove dialog).
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  // Permanent delete (separate from Remove access).
  const [permanentTarget, setPermanentTarget] = useState<TeamMember | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [permanentError, setPermanentError] = useState<string | null>(null);
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<string>("support");
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  async function handleInvite() {
    setInviteError(null);
    setInviteSuccess(null);

    if (!fullName.trim()) {
      setInviteError("Please enter the team member's full name.");
      return;
    }

    if (!email.trim()) {
      setInviteError("Please enter the team member's email address.");
      return;
    }

    setIsInviting(true);

    try {
      unwrapActionResult(
        await inviteTeamMember({
          fullName,
          email,
          ...decodeRole(role),
        }),
      );

      setInviteSuccess(
        `Invitation sent successfully to ${email.trim().toLowerCase()}.`,
      );

      setFullName("");
      setEmail("");
      setRole(defaultRoleChoice);
      router.refresh();
    } catch (error) {
      setInviteError(
        error instanceof Error
          ? error.message
          : "Failed to send the invitation.",
      );
    } finally {
      setIsInviting(false);
    }
  }

  function openEdit(member: TeamMember) {
    setEditTarget(member); setEditName(member.fullName); setEditRole(member.customRoleKey ? `custom:${member.customRoleKey}` : member.role); setEditError(null);
  }

  async function saveEdit() {
    if (!editTarget || isSavingEdit) return;
    setIsSavingEdit(true); setEditError(null);
    try {
      unwrapActionResult(await updateTeamMemberDetails({memberId:editTarget.id,fullName:editName,...decodeRole(editRole)}));
      setEditTarget(null); router.refresh();
    } catch(error) { setEditError(error instanceof Error ? error.message : "Could not save team member details."); }
    finally { setIsSavingEdit(false); }
  }

  async function confirmRemove() {
    if (!deleteTarget || isRemoving) return;

    setIsRemoving(true);
    setRemoveError(null);

    try {
      unwrapActionResult(await removeTeamMember(deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      setRemoveError(
        error instanceof Error
          ? error.message
          : "Failed to remove this team member.",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-50">
              <Shield className="h-5 w-5 text-brand-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Team Members
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                People who have administrative access to TransVista.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Add Team Member
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the details of the person you want to invite.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                aria-label="Close add team member form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="team-member-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="team-member-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Lydia Tornyi"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="team-member-email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="team-member-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@transvistaafrica.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-600/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="team-member-role"
                  className="text-sm font-medium text-slate-700"
                >
                  Role
                </label>

                <select
                  id="team-member-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-600/20"
                >
                  {customOptions}
                  <optgroup label="General access levels">
                    <option value="admin">Admin</option>
                    <option value="support">Support</option>
                    <option value="community_manager">Community Manager</option>
                  </optgroup>
                </select>
                {accessPreview(role)}
              </div>
            </div>

            {inviteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {inviteSuccess}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleInvite}
                disabled={isInviting}
                className="rounded-xl bg-brand-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isInviting ? "Sending…" : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            No team members yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Team members will appear here once they are added.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {statusNotice && (
            <p role="status" className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {statusNotice}
            </p>
          )}
          {statusError && (
            <p role="alert" className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {statusError}
            </p>
          )}
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Member
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Added
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.fullName} path={member.avatarPath} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {member.fullName}
                        </p>

                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />

                          <span className="truncate text-xs text-slate-500">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-brand-blue-50 px-3 py-1 text-xs font-semibold text-brand-blue-700">
                      {roleLabelFor(member)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={member.status} />
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(member.createdAt)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {member.role === "owner" ? (
                      <span className="text-xs text-slate-400">Protected</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => openEdit(member)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        {member.status === "active" && (
                          <button
                            type="button"
                            disabled={resendingId === member.id}
                            onClick={async () => {
                              setStatusError(null); setStatusNotice(null); setResendingId(member.id);
                              try {
                                const result = unwrapActionResult(await resendTeamInvite(member.id));
                                setStatusNotice(`A new sign-in link was emailed to ${result.email}.`);
                              } catch (error) {
                                setStatusError(error instanceof Error ? error.message : "Could not resend the invitation.");
                              } finally {
                                setResendingId(null);
                              }
                            }}
                            aria-label={`Resend invitation to ${member.fullName}`}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-blue-700 transition-colors hover:bg-brand-blue-50 disabled:opacity-60"
                          >
                            <Send className="h-4 w-4" /> {resendingId === member.id ? "Sending…" : "Resend invite"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => { if (member.status === "inactive") { setStatusError(null); try { unwrapActionResult(await reactivateTeamMember(member.id)); router.refresh(); } catch (error) { setStatusError(error instanceof Error ? error.message : "Could not reactivate this team member."); } } else { setRemoveError(null); setDeleteTarget(member); } }}
                          aria-label={`${member.status === "active" ? "Remove access for" : "Restore access for"} ${member.fullName}`}
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${member.status === "active" ? "text-slate-700 hover:bg-slate-100" : "text-brand-blue-700 hover:bg-brand-blue-50"}`}
                        >
                          {member.status === "active" ? <UserX className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          {member.status === "active" ? "Remove access" : "Restore access"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPermanentError(null); setConfirmText(""); setPermanentTarget(member); }}
                          aria-label={`Delete ${member.fullName} permanently`}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-team-member-title">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="edit-team-member-title" className="text-lg font-bold text-slate-950">Edit team member</h2><p className="mt-1 text-sm text-slate-500">Update their display name and access role.</p></div>
              <button type="button" onClick={()=>setEditTarget(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close edit form"><X className="h-5 w-5"/></button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Full name<input value={editName} onChange={e=>setEditName(e.target.value)} maxLength={120} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal"/></label>
              <label className="block text-sm font-semibold text-slate-700">Email / login address<input value={editTarget.email} readOnly className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal text-slate-500"/><span className="mt-1 block text-xs font-normal text-slate-500">Login email is protected here to avoid accidentally locking the person out.</span></label>
              <label className="block text-sm font-semibold text-slate-700">Access role<select value={editRole} onChange={e=>setEditRole(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal">{customOptions}<optgroup label="General access levels"><option value="admin">Admin</option><option value="support">Support</option><option value="community_manager">Community Manager</option></optgroup></select></label>
              {editRole !== "owner" && accessPreview(editRole)}
              <div className="rounded-xl border border-slate-200 px-3 py-3">
                <p className="text-sm font-semibold text-slate-700">Two-step sign-in</p>
                <p className="mt-0.5 text-xs text-slate-500">If they lost the phone with their authenticator app, reset it so they can sign in with their password and set it up again.</p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`Reset two-step sign-in for ${editTarget.fullName}?`)) return;
                    setEditError(null);
                    try {
                      const result = unwrapActionResult(await resetTeamMemberTwoFactor(editTarget.id));
                      setEditTarget(null);
                      setStatusError(null);
                      setStatusNotice(`Two-step sign-in was reset for ${result.fullName}.`);
                    } catch (error) {
                      setEditError(error instanceof Error ? error.message : "Two-step sign-in could not be reset.");
                    }
                  }}
                  className="mt-2 text-sm font-semibold text-brand-blue-700 hover:underline"
                >
                  Reset two-step sign-in
                </button>
              </div>
              {editError?<p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{editError}</p>:null}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setEditTarget(null)} disabled={isSavingEdit} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={saveEdit} disabled={isSavingEdit || editName.trim().length<2} className="rounded-xl bg-brand-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{isSavingEdit?"Saving…":"Save changes"}</button></div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-team-member-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isRemoving && setDeleteTarget(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <UserX className="h-6 w-6 text-slate-600" />
            </div>
            <h2
              id="remove-team-member-title"
              className="mt-4 text-lg font-semibold text-slate-900"
            >
              Remove access for this team member?
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {deleteTarget.fullName}
              </span>{" "}
              ({deleteTarget.email}) will be signed out and can&apos;t sign in again. Their name stays on the bookings and payments they handled, and you can restore access later.
            </p>

            {removeError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {removeError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isRemoving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={isRemoving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isRemoving ? "Removing…" : "Remove access"}
              </button>
            </div>
          </div>
        </div>
      )}

      {permanentTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-team-member-title">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeletingPermanently && setPermanentTarget(null)} aria-hidden="true" />
          <form
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onSubmit={async (event) => {
              event.preventDefault();
              if (isDeletingPermanently) return;
              setIsDeletingPermanently(true);
              setPermanentError(null);
              try {
                const result = unwrapActionResult(await deleteTeamMemberPermanently({ memberId: permanentTarget.id, confirmName: confirmText }));
                setPermanentTarget(null);
                setStatusError(null);
                setStatusNotice(
                  result.outcome === "erased"
                    ? `${result.fullName} was deleted completely.`
                    : `${result.fullName}'s login and personal details were deleted. Their past work now shows as "Former team member".`,
                );
                router.refresh();
              } catch (error) {
                setPermanentError(error instanceof Error ? error.message : "This team member could not be deleted.");
              } finally {
                setIsDeletingPermanently(false);
              }
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 id="delete-team-member-title" className="mt-4 text-lg font-semibold text-slate-900">
              Delete {permanentTarget.fullName} permanently?
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Their login, email, phone and photo are erased. <strong className="font-semibold text-slate-800">This can&apos;t be undone.</strong></li>
              <li>Bookings, payments and notes they handled are kept, labelled &ldquo;Former team member&rdquo;.</li>
              <li>To pause someone&apos;s access instead, use <strong className="font-semibold text-slate-800">Remove access</strong>.</li>
            </ul>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Type <span className="font-semibold text-slate-900">{permanentTarget.fullName}</span> to confirm
              <input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                autoComplete="off"
                autoFocus
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </label>
            {permanentError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{permanentError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setPermanentTarget(null)} disabled={isDeletingPermanently} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeletingPermanently || confirmText.trim().toLowerCase() !== permanentTarget.fullName.trim().toLowerCase()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingPermanently ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

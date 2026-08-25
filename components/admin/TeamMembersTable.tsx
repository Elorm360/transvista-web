"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  UserRound,
  Mail,
  CheckCircle2,
  Plus,
  X,
  Users,
  Trash2,
} from "lucide-react";
import {
  inviteTeamMember,
  removeTeamMember,
} from "@/app/actions/team-members";
import type { TeamMember } from "@/lib/dashboard/getTeamMembers";

interface TeamMembersTableProps {
  members: TeamMember[];
}

function formatRole(role: string): string {
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

export default function TeamMembersTable({ members }: TeamMembersTableProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<
    "admin" | "community_manager" | "support"
  >("community_manager");

  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

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
      await inviteTeamMember({
        fullName,
        email,
        role,
      });

      setInviteSuccess(
        `Invitation sent successfully to ${email.trim().toLowerCase()}.`,
      );

      setFullName("");
      setEmail("");
      setRole("community_manager");
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

  async function confirmRemove() {
    if (!deleteTarget || isRemoving) return;

    setIsRemoving(true);
    setRemoveError(null);

    try {
      await removeTeamMember(deleteTarget.id);
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Shield className="h-5 w-5 text-blue-600" />
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
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
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20"
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
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20"
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
                  onChange={(e) =>
                    setRole(
                      e.target.value as "admin" | "community_manager" | "support",
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="community_manager">
                    Community Manager
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                  <option value="support">
                    Support
                  </option>
                </select>
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
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <UserRound className="h-4 w-4 text-slate-500" />
                      </div>

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
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {formatRole(member.role)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {member.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(member.createdAt)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {member.role === "owner" ? (
                      <span className="text-xs text-slate-400">Protected</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveError(null);
                          setDeleteTarget(member);
                        }}
                        aria-label={`Remove ${member.fullName}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2
              id="remove-team-member-title"
              className="mt-4 text-lg font-semibold text-slate-900"
            >
              Remove this team member?
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {deleteTarget.fullName}
              </span>{" "}
              ({deleteTarget.email}) will lose admin access and will no longer
              be able to sign in.
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
                {isRemoving ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

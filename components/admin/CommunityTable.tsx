"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  X,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  User,
  Tag,
  Download,
  Users,
  Filter,
} from "lucide-react";
import InterestBadge from "@/components/admin/InterestBadge";
import { deleteMember } from "@/app/actions/community";
import { useRouter } from "next/navigation";
import type { CommunityMember } from "@/lib/dashboard/getCommunityMembers";

interface CommunityTableProps {
  members: CommunityMember[];
}

/** Map a member's interest to a soft initials avatar color. */
const avatarStyles: Record<string, string> = {
  Traveler: "bg-blue-100 text-blue-700",
  Partner: "bg-green-100 text-green-700",
  Investor: "bg-purple-100 text-purple-700",
  "Transport Provider": "bg-orange-100 text-orange-700",
  "Tour Operator": "bg-amber-100 text-amber-700",
  "Tour Guide": "bg-cyan-100 text-cyan-700",
  "Hotel / Accommodation": "bg-rose-100 text-rose-700",
  "Business Partner": "bg-teal-100 text-teal-700",
  "Tourism Organization": "bg-indigo-100 text-indigo-700",
  Student: "bg-lime-100 text-lime-700",
  Other: "bg-slate-200 text-slate-700",
};

/** Derive two initials from a full name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * CommunityTable
 *
 * Client component that renders a premium, searchable, filterable table of
 * community members. Search covers name + email; country and interest are
 * filtered via dropdowns whose options come from the data itself.
 *
 * Each row has an action menu (⋮) offering:
 *   - View Details
 *   - Copy Email
 *   - Delete Member (with confirmation dialog)
 *
 * Toolbar also includes an Export CSV button that downloads the currently
 * filtered set of members as a spreadsheet-ready file.
 *
 * Mobile-friendly: the table scrolls horizontally instead of squeezing.
 */
export default function CommunityTable({ members }: CommunityTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [interest, setInterest] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailMember, setDetailMember] = useState<CommunityMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommunityMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Close the action menu when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!target.closest("[data-member-action-menu]")) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-dismiss toast after 3 seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Derive filter options dynamically from the data — never hardcode.
  const countries = useMemo(
    () =>
      Array.from(new Set(members.map((m) => m.country).filter(Boolean))).sort(),
    [members],
  );
  const interests = useMemo(
    () =>
      Array.from(new Set(members.map((m) => m.interest).filter(Boolean))).sort(),
    [members],
  );

  const hasActiveFilters = search !== "" || country !== "" || interest !== "";

  // Client-side filtering — instant, fine for small datasets.
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        query === "" ||
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);

      const matchesCountry = country === "" || member.country === country;
      const matchesInterest = interest === "" || member.interest === interest;

      return matchesSearch && matchesCountry && matchesInterest;
    });
  }, [members, search, country, interest]);

  /** Export the currently filtered members as a CSV file. */
  function exportCsv() {
    if (filtered.length === 0) {
      setToast("Nothing to export — no members match the current filters.");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Country", "Interest", "Joined"];
    const rows = filtered.map((member) => [
      member.fullName,
      member.email,
      member.phone ?? "",
      member.country,
      member.interest,
      formatDate(member.createdAt),
    ]);

    // Properly escape CSV fields (quotes, commas, newlines).
    const escape = (value: string) => {
      const needsQuoting = /[",\n\r]/.test(value);
      const sanitized = value.replace(/"/g, '""');
      return needsQuoting ? `"${sanitized}"` : sanitized;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transvista-community-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast(
      `Exported ${filtered.length} member${filtered.length === 1 ? "" : "s"} to CSV.`,
    );
  }

  /** Copy a member's email address to the clipboard. */
  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setToast("Email copied to clipboard.");
    } catch {
      setToast("Could not copy email.");
    }
    setOpenMenuId(null);
  }

  /** Confirm and delete a member via the server action. */
  async function confirmDelete() {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);

    try {
      const result = await deleteMember(deleteTarget.id);

      console.log("[CommunityTable] Delete result:", result);

      setDeleteTarget(null);
      setOpenMenuId(null);

      setToast("Member deleted successfully.");

      router.refresh();
    } catch (err) {
      console.error("[CommunityTable] Delete failed:", err);

      setToast(
        err instanceof Error
          ? err.message
          : "Failed to delete member.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]">
      {/* ── Toolbar: search + filters + export ── */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Summary + Search */}
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Community Members
              </p>
              <p className="text-xs text-slate-500">
                {filtered.length} of {members.length} shown
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              aria-label="Search community members"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Filters + Export */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-label="Filter by country"
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              aria-label="Filter by interest"
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="">All Interests</option>
              {interests.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportCsv}
            aria-label="Export members to CSV"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Member
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Phone
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Country
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Interest
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Joined
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((member) => {
              const avatarColor =
                avatarStyles[member.interest] ?? avatarStyles.Other;

              return (
                <tr
                  key={member.id}
                  className="group transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor}`}
                        aria-hidden="true"
                      >
                        {getInitials(member.fullName)}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {member.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={`mailto:${member.email}`}
                      className="text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                    >
                      {member.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {member.phone || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {member.country}
                  </td>
                  <td className="px-6 py-4">
                    <InterestBadge interest={member.interest} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Row action menu */}
                    <div
                      className="relative inline-block"
                      data-member-action-menu
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === member.id ? null : member.id,
                          )
                        }
                        aria-label={`Actions for ${member.fullName}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === member.id}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors group-hover:text-slate-600 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === member.id && (
                        <div
                          role="menu"
                          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.25)]"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setDetailMember(member);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4 text-slate-400" />
                            View Details
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => copyEmail(member.email)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <Copy className="h-4 w-4 text-slate-400" />
                            Copy Email
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setDeleteTarget(member);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Member
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900">
              {members.length === 0
                ? "No community members yet."
                : "No members found."}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {members.length === 0
                ? "Waitlist members will appear here once they join."
                : "Try adjusting your search or filters."}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCountry("");
                  setInterest("");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Footer bar ── */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">{members.length}</span>{" "}
          members
        </p>
        <p className="hidden text-xs text-slate-400 sm:block">
          Data refreshes automatically
        </p>
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* ── View Details modal ── */}
      {detailMember && (
        <MemberDetailModal
          member={detailMember}
          onClose={() => setDetailMember(null)}
        />
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2
              id="delete-dialog-title"
              className="mt-4 text-lg font-semibold text-slate-900"
            >
              Delete this waitlist member?
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {deleteTarget.fullName}
              </span>{" "}
              ({deleteTarget.email}) will be permanently removed. This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * MemberDetailModal
 *
 * Shows a member's full details in a premium modal dialog.
 */
function MemberDetailModal({
  member,
  onClose,
}: {
  member: CommunityMember;
  onClose: () => void;
}) {
  const avatarColor = avatarStyles[member.interest] ?? avatarStyles.Other;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}
              aria-hidden="true"
            >
              {getInitials(member.fullName)}
            </div>
            <div>
              <h2
                id="detail-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                {member.fullName}
              </h2>
              <div className="mt-1">
                <InterestBadge interest={member.interest} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-1 px-6 py-5">
          <DetailRow icon={Mail} label="Email" value={member.email} isLink />
          <DetailRow icon={Phone} label="Phone" value={member.phone ?? "—"} />
          <DetailRow icon={MapPin} label="Country" value={member.country} />
          <DetailRow icon={Tag} label="Interest" value={member.interest} />
          <DetailRow
            icon={CheckCircle2}
            label="Joined"
            value={formatDate(member.createdAt)}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * DetailRow
 *
 * A labeled row inside the MemberDetails modal.
 */
function DetailRow({
  icon: Icon,
  label,
  value,
  isLink,
}: {
  icon: typeof User;
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-50 py-3 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        {isLink && value !== "—" ? (
          <a
            href={`mailto:${value}`}
            className="break-all text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="break-all text-sm font-medium text-slate-900">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Format an ISO date string to a short readable format.
 * e.g. "2 Aug 2026"
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

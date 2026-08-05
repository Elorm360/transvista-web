"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import InterestBadge from "@/components/admin/InterestBadge";
import { deleteMember } from "@/app/actions/community";
import { useRouter } from "next/navigation";
import type { CommunityMember } from "@/lib/dashboard/getCommunityMembers";

interface CommunityTableProps {
  members: CommunityMember[];
}

/**
 * CommunityTable
 *
 * Client component that renders a searchable, filterable table of
 * community members. Search covers name + email; country and interest
 * are filtered via dropdowns whose options come from the data itself.
 *
 * Each row has an action menu (⋮) offering:
 *   - View Details
 *   - Copy Email
 *   - Delete Member (with confirmation dialog)
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the action menu when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMember(deleteTarget.id);
      setToast("Member deleted successfully.");
      setDeleteTarget(null);
      // Re-fetch the community list from Supabase (server component).
      router.refresh();
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : "Failed to delete member.",
      );
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {/* Toolbar: search + filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            aria-label="Search community members"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filter by country"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="">All Interests</option>
            {interests.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Country
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Interest
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Joined
              </th>
              <th className="py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="py-3.5 pr-4 text-sm font-semibold text-slate-900">
                  {member.fullName}
                </td>
                <td className="py-3.5 pr-4 text-sm">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {member.email}
                  </a>
                </td>
                <td className="py-3.5 pr-4 text-sm text-slate-500">
                  {member.phone || "—"}
                </td>
                <td className="py-3.5 pr-4 text-sm text-slate-700">
                  {member.country}
                </td>
                <td className="py-3.5 pr-4">
                  <InterestBadge interest={member.interest} />
                </td>
                <td className="py-3.5 pr-4 text-sm text-slate-500">
                  {formatDate(member.createdAt)}
                </td>
                <td className="py-3.5 text-right">
                  {/* Row action menu */}
                  <div className="relative inline-block" ref={menuRef}>
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
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openMenuId === member.id && (
                      <div
                        role="menu"
                        className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setDetailMember(member);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4 text-slate-400" />
                          View Details
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => copyEmail(member.email)}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
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
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Member
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-900">
              No community members found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="mt-4 text-xs text-slate-400">
        Showing {filtered.length} of {members.length} members
      </p>

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
            className="absolute inset-0 bg-black/40"
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
 * Shows a member's full details in a modal dialog.
 */
function MemberDetailModal({
  member,
  onClose,
}: {
  member: CommunityMember;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2
            id="detail-dialog-title"
            className="text-lg font-semibold text-slate-900"
          >
            Member Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <DetailRow icon={User} label="Name" value={member.fullName} />
          <DetailRow icon={Mail} label="Email" value={member.email} isLink />
          <DetailRow icon={Phone} label="Phone" value={member.phone ?? "—"} />
          <DetailRow icon={MapPin} label="Country" value={member.country} />
          <DetailRow icon={Tag} label="Interest" value={member.interest} />
          <DetailRow icon={CheckCircle2} label="Joined" value={formatDate(member.createdAt)} />
        </div>

        <div className="mt-6 flex justify-end">
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
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0">
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

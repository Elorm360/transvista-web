"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import InterestBadge from "@/components/admin/InterestBadge";
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
 * Mobile-friendly: the table scrolls horizontally instead of squeezing.
 */
export default function CommunityTable({ members }: CommunityTableProps) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [interest, setInterest] = useState("");

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
        <table className="w-full min-w-[720px] border-collapse text-left">
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
              <th className="py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Joined
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
                <td className="py-3.5 text-sm text-slate-500">
                  {formatDate(member.createdAt)}
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

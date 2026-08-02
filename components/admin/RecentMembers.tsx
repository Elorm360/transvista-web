import { Users } from "lucide-react";
import type { RecentMember } from "@/lib/dashboard/getDashboardStats";

interface RecentMembersProps {
  members: RecentMember[];
}

/**
 * RecentMembers
 *
 * Displays the most recently joined community members.
 * Each entry shows name, country, interest, and join date.
 * Designed to be replaced with a full data table in Phase 3.
 */
export default function RecentMembers({ members }: RecentMembersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Users className="h-5 w-5 text-blue-700" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Community Members
        </h2>
      </div>

      {/* List */}
      {members.length > 0 ? (
        <ul className="mt-6 divide-y divide-slate-100">
          {members.map((member, index) => (
            <li
              key={index}
              className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {member.fullName}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(member.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{member.country}</span>
                <span className="text-slate-300">·</span>
                <span>{member.interest}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-slate-400">
          No community members yet. Share the waitlist to start growing
          your community.
        </p>
      )}
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

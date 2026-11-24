import Link from "next/link";
import { ScrollText } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Card, EmptyState } from "@/components/admin/ui";
import { requireAdminArea } from "@/lib/auth/requireAdminArea";
import { AUDIT_CATEGORIES, getAuditLog } from "@/lib/dashboard/getAuditLog";

export const dynamic = "force-dynamic";

function when(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra",
  });
}

function details(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata).filter(([, value]) => value !== null && value !== "" && value !== undefined);
  if (!entries.length) return null;
  return entries
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join(" · ");
}

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  await requireAdminArea("audit");
  const params = await searchParams;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const entries = await getAuditLog({ category });

  const filters = [{ value: "", label: "All" }, ...AUDIT_CATEGORIES];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Audit log"
        description="A permanent record of sensitive actions: who did what, and when. Entries can't be edited or deleted."
      />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none]" role="tablist" aria-label="Filter audit log">
        {filters.map((filter) => {
          const active = (category ?? "") === filter.value;
          return (
            <Link
              key={filter.value || "all"}
              href={filter.value ? `/admin/audit?category=${filter.value}` : "/admin/audit"}
              role="tab"
              aria-selected={active}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${active ? "border-brand-blue-600 text-brand-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <Card bodyClassName="divide-y divide-slate-100">
        {entries.length ? (
          entries.map((entry) => {
            const extra = details(entry.metadata);
            return (
              <div key={entry.id} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[11rem_1fr]">
                <time className="text-sm text-slate-500" dateTime={entry.createdAt}>{when(entry.createdAt)}</time>
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-semibold">{entry.actorName ?? "System"}</span> · {entry.summary}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {entry.action}
                    {entry.targetType ? ` · ${entry.targetType}${entry.targetId ? ` ${entry.targetId}` : ""}` : ""}
                    {extra ? ` · ${extra}` : ""}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState icon={ScrollText} title="No entries yet" description="Sensitive actions, like payments, access changes and deletions, will be recorded here from now on." />
        )}
      </Card>
      <p className="mt-3 text-xs text-slate-500">Showing the latest {entries.length} entr{entries.length === 1 ? "y" : "ies"}. Times are Ghana time.</p>
    </div>
  );
}

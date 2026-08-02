import SectionCard from "@/components/admin/SectionCard";

/**
 * DashboardSkeleton
 *
 * Polished loading placeholder for the dashboard page.
 * Shows 4 animated stat card placeholders + a recent members placeholder.
 */
export default function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
        <div>
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-4 w-36 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
            <div className="mt-1 h-4 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Recent members */}
      <SectionCard title="Recent Community Members">
        <div className="mt-6 space-y-4 divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="space-y-1">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/**
 * AnalyticsSkeleton
 *
 * Polished loading placeholder for the analytics page.
 * Shows 3 KPI card placeholders + 2 chart placeholders + 1 chart placeholder.
 */
export default function AnalyticsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
        <div>
          <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-4 w-56 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-1 h-5 w-12 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-1 h-3 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Interest breakdown placeholder */}
      <div className="mt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-3 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

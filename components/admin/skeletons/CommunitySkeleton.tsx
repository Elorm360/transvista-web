/**
 * CommunitySkeleton
 *
 * Polished loading placeholder for the community members page.
 * Shows a search bar placeholder + table header + 5 row placeholders.
 */
export default function CommunitySkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
        <div>
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200 lg:max-w-xs" />
          <div className="flex gap-3">
            <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>

        {/* Table header */}
        <div className="mt-6 flex gap-4 border-b border-slate-200 pb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-16 animate-pulse rounded bg-slate-200"
              style={{ width: i === 0 ? "120px" : i === 1 ? "180px" : "80px" }}
            />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-100 py-3.5">
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="h-4 animate-pulse rounded bg-slate-200"
                style={{
                  width: j === 0 ? "120px" : j === 1 ? "180px" : "80px",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

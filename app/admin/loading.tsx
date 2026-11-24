/** Shown inside the admin layout while a page's data loads. */
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-[1500px] animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 rounded-lg bg-slate-200/80" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200/60" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="mt-6 h-96 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

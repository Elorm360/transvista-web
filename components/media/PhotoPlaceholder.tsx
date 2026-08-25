export function PhotoPlaceholder({
  label = "Original photo coming soon",
  caption = "TransVista photography",
}: {
  label?: string;
  caption?: string;
}) {
  return (
    <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-orange-50 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8 text-slate-400"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m21 15-4.5-4.5L7 20" />
        </svg>
      </div>
      <p className="mt-4 text-base font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-sm text-slate-400">{caption}</p>
    </div>
  );
}

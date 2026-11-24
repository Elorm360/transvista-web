"use client";

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";

/**
 * Shown inside the admin layout (sidebar stays) when a page fails to load,
 * so a database hiccup reads as an error, not as an empty list.
 * Next.js 16 passes `unstable_retry` (not the older `reset`).
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin] Page failed to load:", error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto mt-10 max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <CircleAlert className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">This page couldn&apos;t load</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        We couldn&apos;t read the latest records. Your data is safe — this is usually a brief connection problem.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600 focus-visible:ring-offset-2"
      >
        <RotateCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
      {error.digest && <p className="mt-4 text-xs text-slate-400">Reference: {error.digest}</p>}
    </div>
  );
}

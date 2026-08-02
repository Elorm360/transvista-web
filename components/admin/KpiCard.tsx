import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  /** Descriptive label, e.g. "New Members (30 Days)" */
  label: string;
  /** The KPI value, e.g. "42" */
  value: string | number;
  /** Optional lucide-react icon */
  icon?: LucideIcon;
}

/**
 * KpiCard
 *
 * A compact summary card for displaying a single key performance
 * indicator above the analytics charts. Styled to match StatCard
 * but with a smaller footprint.
 */
export default function KpiCard({ label, value, icon: Icon }: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <Icon className="h-5 w-5 text-blue-700" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

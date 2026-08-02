import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Label displayed above the number */
  title: string;
  /** The large number to display */
  value: number | string;
}

/**
 * StatCard
 *
 * A reusable card for displaying a single dashboard statistic.
 * Designed to be calm and professional — rounded corners, white background,
 * soft border, comfortable spacing, large number, small muted label.
 *
 * @example
 * ```tsx
 * <StatCard icon={Users} title="Total Members" value={57} />
 * ```
 */
export default function StatCard({ icon: Icon, title, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 ease-out hover:border-slate-300">
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
        <Icon className="h-5 w-5 text-blue-700" />
      </div>

      {/* Value */}
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>

      {/* Label */}
      <p className="mt-1 text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
}

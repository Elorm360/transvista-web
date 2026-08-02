import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Primary message */
  title: string;
  /** Supporting guidance */
  description?: string;
  /** Optional action button / link */
  action?: React.ReactNode;
}

/**
 * EmptyState
 *
 * A calm, helpful empty state for when there's no data to display.
 * Used across the admin area — dashboard, community list, analytics.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

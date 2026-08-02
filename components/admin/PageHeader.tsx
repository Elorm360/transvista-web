import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Page title */
  title: string;
  /** Optional supporting text */
  description?: string;
}

/**
 * PageHeader
 *
 * A reusable header for every admin page. Provides a consistent
 * icon + title + description pattern so every page feels part of
 * the same design system.
 */
export default function PageHeader({
  icon: Icon,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
        <Icon className="h-5 w-5 text-blue-700" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

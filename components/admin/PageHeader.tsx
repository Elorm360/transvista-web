import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  /** Kept for existing call sites; the breadcrumb already shows where you are. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary page actions (buttons/links), shown on the right. */
  actions?: React.ReactNode;
}

/** One title per page, matching the sidebar label. */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

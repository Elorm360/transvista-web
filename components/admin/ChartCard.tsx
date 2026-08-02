interface ChartCardProps {
  /** Card title */
  title: string;
  /** Optional supporting text below the title */
  subtitle?: string;
  /** Chart content */
  children: React.ReactNode;
}

/**
 * ChartCard
 *
 * A reusable container for every analytics chart. Provides a
 * consistent card shell (rounded corners, white background, soft
 * border) with a title, optional subtitle, and a chart area —
 * keeping future analytics visually consistent.
 */
export default function ChartCard({
  title,
  subtitle,
  children,
}: ChartCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}

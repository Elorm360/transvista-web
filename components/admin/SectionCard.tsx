interface SectionCardProps {
  /** Optional title displayed at the top of the card */
  title?: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes (for responsive grid placement, etc.) */
  className?: string;
}

/**
 * SectionCard
 *
 * A reusable card container for the admin area. Every card in the
 * admin panel should use this component to maintain visual consistency.
 *
 * Features:
 * - `rounded-2xl border border-slate-200 bg-white p-6`
 * - Optional title + subtitle
 * - Optional className for grid placement
 */
export default function SectionCard({
  title,
  subtitle,
  children,
  className,
}: SectionCardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 ${className ?? ""}`}>
      {title && (
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      )}
      {subtitle && (
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
      )}
      {title && <div className="mt-6">{children}</div>}
      {!title && children}
    </div>
  );
}

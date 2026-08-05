/**
 * ValueCard
 *
 * Renders a single value proposition card for the Why TransVista section.
 *
 * @todo — Implement in the next sprint alongside the card grid layout.
 * Props will include: icon, title, description.
 */
interface ValueCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ValueCard({
  title,
  description,
  icon,
}: ValueCardProps) {
  return (
<article className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_20px_50px_-20px_rgba(180,83,9,0.15)]">
      {/* top highlight edge */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* subtle hover wash */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50/0 via-amber-50/0 to-amber-100/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition-all duration-300 group-hover:bg-amber-100 group-hover:shadow-[0_8px_20px_-8px_rgba(180,83,9,0.5)]" aria-hidden="true">
        {icon}
      </div>

      <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}


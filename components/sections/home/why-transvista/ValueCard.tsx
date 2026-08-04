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
    <article className="group rounded-[24px] border border-slate-200 bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_20px_50px_-20px_rgba(180,83,9,0.15)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition-colors duration-300 group-hover:bg-amber-100" aria-hidden="true">
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


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
    <article className="rounded-[28px] border border-slate-200 bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700" aria-hidden="true">
        {icon}
      </div>

      <h3 className="text-2xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}


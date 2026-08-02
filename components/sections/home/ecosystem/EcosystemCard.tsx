interface EcosystemCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * EcosystemCard
 *
 * Renders a single pillar of the TransVista ecosystem.
 *
 * These are not feature cards — they represent the ecosystem we're
 * connecting. Intentionally minimal: icon at top in a soft circular
 * brand background, title, short description, whitespace.
 */
export function EcosystemCard({
  title,
  description,
  icon,
}: EcosystemCardProps) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700" aria-hidden="true">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}


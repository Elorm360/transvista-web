interface ExperienceCategoryCardProps {
  title: string;
  subtitle: string;
}

/**
 * ExperienceCategoryCard
 *
 * Renders a single travel-style category as an invitation.
 * Each card answers: "What kind of traveler are you today?"
 *
 * The distinction between categories will come later through real
 * photography — not colored boxes.
 *
 * @todo — Add an `image: string` prop when original photography is introduced.
 * @todo — Wire "Discover" to `/explore/${slug}` when routing exists.
 */
export function ExperienceCategoryCard({
  title,
  subtitle,
}: ExperienceCategoryCardProps) {
  return (
    <article className="group rounded-[24px] border border-slate-200 bg-white p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_24px_55px_-24px_rgba(180,83,9,0.2)]">
      {/* Photography placeholder — reserved for original content */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="h-10 w-10 rounded-full border border-amber-200" />

          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-amber-700/70">
            Original Photography
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Coming Soon
          </p>
        </div>
      </div>

      <div className="pt-5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h3>

        <p className="mt-1.5 text-sm text-slate-500">
          {subtitle}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-700 transition-colors focus-visible:outline-none group-hover:text-amber-800">
          Discover

          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </article>
  );
}


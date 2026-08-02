interface ExperienceCardProps {
  title: string;
  category: string;
  location: string;
}

/**
 * ExperienceCard
 *
 * Renders a single featured experience in a premium editorial style.
 *
 * The image carries the visual story; the text stays minimal — category,
 * title, location, and an inviting "Explore" action. Whitespace and
 * typographic hierarchy do the heavy lifting.
 *
 * @todo — Add an `image: string` prop when original photography is introduced.
 * @todo — Wire "Explore" to `/experiences/${slug}` when routing exists.
 */
export function ExperienceCard({
  title,
  category,
  location,
}: ExperienceCardProps) {
  return (
    <article className="group rounded-[28px] border border-slate-200 bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      {/* Photography placeholder — reserved for original content */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-100">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="h-10 w-10 rounded-full border border-slate-300" />

          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-400">
            Original Photography
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Coming Soon
          </p>
        </div>
      </div>

      <div className="pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
          {category}
        </p>

        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {location}
        </p>

        <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors focus-visible:outline-none group-hover:text-blue-800">
          Explore

          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </article>
  );
}


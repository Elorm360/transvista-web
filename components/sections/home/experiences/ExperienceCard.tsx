import Image from "next/image";

interface ExperienceCardProps {
  title: string;
  category: string;
  location: string;
  image: string;
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
 * @todo — Wire "Explore" to `/experiences/${slug}` when routing exists.
 */
export function ExperienceCard({
  title,
  category,
  location,
  image,
}: ExperienceCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_24px_55px_-24px_rgba(180,83,9,0.2)]">
      {/* top highlight edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* Destination image with gradient overlay */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Category pill */}
        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-lg">
          {category}
        </div>
      </div>

      <div className="pt-5">
        <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h3>

        <p className="mt-1.5 text-sm text-slate-500">
          {location}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-700 transition-colors focus-visible:outline-none group-hover:text-amber-800">
          Explore

          <span
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </div>
    </article>
  );
}

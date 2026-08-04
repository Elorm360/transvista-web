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
    <article className="group rounded-[28px] border border-slate-200 bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      {/* Destination image with gradient overlay */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-100">
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
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-lg backdrop-blur-sm">
          {category}
        </div>
      </div>

      <div className="pt-6">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
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


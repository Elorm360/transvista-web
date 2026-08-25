import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/constants/data/experiences";
import { PhotoPlaceholder } from "@/components/media/PhotoPlaceholder";

type ExperienceCardProps = {
  experience: Experience;
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/experiences/${experience.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {experience.image ? (
            <Image
              src={experience.image}
              alt={experience.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PhotoPlaceholder
              label="Photo coming soon"
              caption="TransVista experience photography"
            />
          )}

          {experience.featured && (
            <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
              Featured
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {experience.category}
          </p>

          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700">
            {experience.name}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {experience.description}
          </p>

          <span className="mt-5 inline-flex items-center text-sm font-semibold text-blue-700">
            Explore experience
            <span
              aria-hidden="true"
              className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

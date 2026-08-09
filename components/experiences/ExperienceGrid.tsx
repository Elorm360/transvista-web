import { experiences } from "@/constants/data/experiences";
import { ExperienceCard } from "./ExperienceCard";

type ExperienceGridProps = {
  limit?: number;
};

export function ExperienceGrid({ limit }: ExperienceGridProps) {
  const visibleExperiences =
    typeof limit === "number"
      ? experiences.slice(0, limit)
      : experiences;

  return (
    <section
      aria-labelledby="experiences-heading"
      className="py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            Curated experiences
          </p>

          <h2
            id="experiences-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
          >
            More than places
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Discover experiences that help you connect with Ghana's culture,
            nature, history, food, and local life.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleExperiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { notFound } from "next/navigation";
import { experiences } from "@/constants/data/experiences";
import { destinations } from "@/constants/data/destinations";

type ExperiencePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ExperiencePage({
  params,
}: ExperiencePageProps) {
  const { slug } = await params;

  const experience = experiences.find(
    (item) => item.slug === slug,
  );

  if (!experience) {
    notFound();
  }

  const destination = destinations.find(
    (item) => item.id === experience.destinationId,
  );

  return (
    <main className="min-h-screen bg-[#fffdfa]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            {experience.category}
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {experience.name}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {experience.description}
          </p>

          {destination && (
            <p className="mt-5 text-sm font-medium text-slate-500">
              Destination:{" "}
              <span className="text-slate-800">
                {destination.name}
              </span>
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-amber-50 p-8 text-center">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-8 w-8 text-slate-400"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <path d="m21 15-4.5-4.5L7 20" />
                </svg>
              </div>

              <p className="mt-4 text-base font-semibold text-slate-700">
                Original photo coming soon
              </p>

              <p className="mt-1 text-sm text-slate-400">
                TransVista experience photography
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              Experience Ghana
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              A curated way to discover Ghana
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              TransVista is building a trusted travel discovery experience
              that connects destinations, local experiences, transport, and
              travel planning in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                {experience.category}
              </span>

              {destination && (
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                  {destination.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

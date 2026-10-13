import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PlanTripButton } from "@/components/layout/PlanTripButton";
import { PhotoPlaceholder } from "@/components/media/PhotoPlaceholder";
import type { Destination } from "@/constants/data/destinations";
import { getExperiencesByDestination } from "@/constants/data/experiences";
import { destinations } from "@/constants/data/destinations";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DestinationDetailProps = {
  destination: Destination;
};

export function DestinationDetail({ destination }: DestinationDetailProps) {
  const relatedExperiences = getExperiencesByDestination(destination.id);
  const otherDestinations = destinations.filter(
    (item) => item.id !== destination.id,
  );

  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <section className="border-b border-slate-200 bg-white pt-10 pb-14 lg:pt-14 lg:pb-20">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-700">
            <Link href="/#explore-ghana" className="hover:underline">
              Explore Ghana
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            {destination.region}
          </p>

          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {destination.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {destination.tagline}
          </p>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div className="overflow-hidden rounded-[28px] border border-slate-200">
              {destination.image ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={destination.image}
                    alt={destination.imageAlt}
                    fill
                    priority
                    quality={75}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <PhotoPlaceholder caption="TransVista destination photography" />
              )}
              <p className="border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
                {destination.photoNote}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue-700">
                {destination.category}
              </p>
              <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Why go
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {destination.description}
              </p>

              <ul className="mt-6 space-y-2">
                {destination.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-3 text-sm leading-6 text-slate-700"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange-500" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-12 lg:pb-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                The place
              </h2>
              <div className="mt-5 space-y-5">
                {destination.story.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[24px] border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
                  Best for
                </h3>
                <ul className="mt-4 space-y-2">
                  {destination.bestFor.map((item) => (
                    <li key={item} className="text-sm leading-6 text-slate-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
                  Getting there
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {destination.gettingThere}
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {relatedExperiences.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-12 lg:py-16">
          <Container>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
              Experiences in {destination.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              These are the journeys we’re shaping first around this destination.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {relatedExperiences.map((experience) => (
                <Link
                  key={experience.id}
                  href={`/experiences/${experience.slug}`}
                  className="rounded-[24px] border border-slate-200 bg-[#fffdfa] p-6 transition-all hover:-translate-y-0.5 hover:border-brand-orange-200 hover:shadow-lg"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue-700">
                    {experience.category}
                  </p>
                  <h3 className="font-display mt-2 text-xl font-semibold text-slate-900">
                    {experience.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {experience.tagline}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-brand-orange-700">
                    Read the experience →
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-12 lg:py-16">
        <Container>
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-blue-950 via-brand-blue-900 to-slate-950 px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
              Want {destination.name} on your itinerary?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
              Tell us your dates, budget, interests, and travel style. We’ll review
              your request and respond within 48 hours.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PlanTripButton
                href={`/plan?destination=${destination.slug}`}
                className="rounded-full"
              />
              <Link
                href="/#explore-ghana"
                className={cn(
                  buttonVariants({ variant: "outline-white", size: "default" }),
                  "rounded-full",
                )}
              >
                More destinations
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Also explore
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {otherDestinations.map((item) => (
                <Link
                  key={item.id}
                  href={`/destinations/${item.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-orange-200 hover:text-brand-orange-800"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

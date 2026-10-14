import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailList, FeatureImage, PlanAside } from "@/components/shared/DetailBlocks";
import type { Destination } from "@/constants/data/destinations";
import { destinations } from "@/constants/data/destinations";
import { getExperiencesByDestination } from "@/constants/data/experiences";

type DestinationDetailProps = {
  destination: Destination;
};

export function DestinationDetail({ destination }: DestinationDetailProps) {
  const relatedExperiences = getExperiencesByDestination(destination.id);
  const otherDestinations = destinations.filter((item) => item.id !== destination.id);

  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow={
          <>
            <Link href="/destinations" className="hover:underline">
              Destinations
            </Link>
            <span className="mx-2 text-slate-400" aria-hidden="true">/</span>
            {destination.region}
          </>
        }
        title={destination.name}
        lead={destination.tagline}
      />

      <section className="pt-10 lg:pt-14">
        <Container>
          <FeatureImage
            image={destination.image}
            imageAlt={destination.imageAlt}
            photoNote={destination.photoNote}
          />
        </Container>
      </section>

      <section className="py-12 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            <div className="max-w-2xl">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-600">
                {destination.category}
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Why go
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-700">{destination.description}</p>
              <DetailList items={destination.highlights} />

              <h2 className="font-display mt-14 text-3xl font-semibold tracking-tight text-slate-950">
                The place
              </h2>
              <div className="mt-5 space-y-5">
                {destination.story.map((paragraph) => (
                  <p key={paragraph} className="text-[17px] leading-8 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <PlanAside
              facts={[
                { title: "Best for", items: destination.bestFor },
                { title: "Getting there", items: [destination.gettingThere] },
              ]}
              planHref={`/plan?destination=${destination.slug}`}
              whatsappMessage={`Hi TransVista Africa, I'd like help planning a trip to ${destination.name}.`}
            />
          </div>
        </Container>
      </section>

      {relatedExperiences.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-12 lg:py-16">
          <Container>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
              Experiences in {destination.name}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {relatedExperiences.map((experience) => (
                <Link
                  key={experience.id}
                  href={`/experiences/${experience.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-[#fffdfa] p-6 transition-colors hover:border-slate-300 sm:p-8"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    {experience.category}
                  </p>
                  <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">
                    {experience.name}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">{experience.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-800">
                    Read the experience
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-slate-200 py-12">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Also explore
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherDestinations.map((item) => (
              <Link
                key={item.id}
                href={`/destinations/${item.slug}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

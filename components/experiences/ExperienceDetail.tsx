import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailList, FeatureImage, PlanAside } from "@/components/shared/DetailBlocks";
import type { Experience } from "@/constants/data/experiences";
import type { Destination } from "@/constants/data/destinations";

type ExperienceDetailProps = {
  experience: Experience;
  destination?: Destination;
};

export function ExperienceDetail({ experience, destination }: ExperienceDetailProps) {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow={
          <>
            {destination ? (
              <Link href={`/destinations/${destination.slug}`} className="hover:underline">
                {destination.name}
              </Link>
            ) : (
              "Experience"
            )}
            <span className="mx-2 text-slate-400" aria-hidden="true">/</span>
            {experience.category}
          </>
        }
        title={experience.name}
        lead={experience.tagline}
      />

      <section className="pt-10 lg:pt-14">
        <Container>
          <FeatureImage
            image={experience.image}
            imageAlt={experience.imageAlt}
            photoNote={experience.photoNote}
          />
        </Container>
      </section>

      <section className="py-12 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
                What to expect
              </h2>
              <DetailList items={experience.whatToExpect} />

              <h2 className="font-display mt-14 text-3xl font-semibold tracking-tight text-slate-950">
                The experience
              </h2>
              <div className="mt-5 space-y-5">
                {experience.story.map((paragraph) => (
                  <p key={paragraph} className="text-[17px] leading-8 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>

              {destination && (
                <p className="mt-10 text-sm text-slate-500">
                  Based in{" "}
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="font-semibold text-brand-blue-800 hover:underline"
                  >
                    {destination.name}
                  </Link>
                  , {destination.region}.
                </p>
              )}
            </div>

            <PlanAside
              facts={[{ title: "Best for", items: experience.bestFor }]}
              planHref={`/plan?destination=${experience.destinationId}`}
              whatsappMessage={`Hi TransVista Africa, I'm interested in the ${experience.name} experience.`}
            />
          </div>
        </Container>
      </section>
    </main>
  );
}

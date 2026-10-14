import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ExperienceCard } from "./ExperienceCard";
import { destinations } from "@/constants/data/destinations";
import { experiencesContent } from "@/content/experiences";

const launchDestinationIds = new Set(["accra", "cape-coast", "volta-region"]);

export function Experiences() {
  const featured = destinations.filter((destination) =>
    launchDestinationIds.has(destination.id),
  );

  return (
    <Section id="explore-ghana">
      <Container>
        <Reveal>
          <SectionHeader
            badge={experiencesContent.badge}
            title={experiencesContent.title}
            description={experiencesContent.description}
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((destination, i) => (
            <Reveal key={destination.id} delay={i * 80}>
              <ExperienceCard
                title={
                  destination.id === "cape-coast"
                    ? "Cape Coast & Elmina"
                    : destination.name
                }
                category={destination.category}
                location={destination.region}
                image={destination.image}
                href={`/destinations/${destination.slug}`}
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-full border border-brand-blue-200 bg-white px-6 py-3 text-sm font-semibold text-brand-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue-300 hover:bg-brand-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600 focus-visible:ring-offset-2"
          >
            See all {destinations.length} destinations
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}

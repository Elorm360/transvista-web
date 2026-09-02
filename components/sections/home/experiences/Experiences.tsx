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
      </Container>
    </Section>
  );
}

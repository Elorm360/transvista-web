import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ExperienceCard } from "./ExperienceCard";

import { experiencesContent } from "@/content/experiences";

export function Experiences() {
  return (
    <Section id="experiences">
      <Container>
        <SectionHeader
          badge={experiencesContent.badge}
          title={experiencesContent.title}
          description={experiencesContent.description}
          align="center"
        />

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {experiencesContent.items.map((experience) => (
            <ExperienceCard
              key={experience.id}
              title={experience.title}
              category={experience.category}
              location={experience.location}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}


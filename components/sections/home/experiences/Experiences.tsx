import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ExperienceCard } from "./ExperienceCard";

import { experiencesContent } from "@/content/experiences";

export function Experiences() {
  return (
    <Section id="experiences">
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
          {experiencesContent.items.map((experience, i) => (
            <Reveal key={experience.id} delay={i * 80}>
              <ExperienceCard
                title={experience.title}
                category={experience.category}
                location={experience.location}
                image={experience.image}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { WaitlistButton } from "@/components/layout/WaitlistButton";
import { ExperienceCategoryCard } from "./ExperienceCategoryCard";

import { exploreByExperienceContent } from "@/content/explore-by-experience";

export function ExploreByExperience() {
  const { cta } = exploreByExperienceContent;

  return (
    <Section id="explore-by-experience">
      <Container>
        <Reveal>
          <SectionHeader
            badge={exploreByExperienceContent.badge}
            title={exploreByExperienceContent.title}
            description={exploreByExperienceContent.description}
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exploreByExperienceContent.categories.map((category, i) => (
            <Reveal key={category.id} delay={i * 80}>
              <ExperienceCategoryCard
                title={category.title}
                subtitle={category.subtitle}
              />
            </Reveal>
          ))}
        </div>

        {/* Contextual conversion — tied to the visitor's uncertainty */}
        <Reveal className="mt-16 text-center">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
            {cta.title}
          </h3>

          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
            {cta.description}
          </p>

          <div className="mt-8">
            <WaitlistButton />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}


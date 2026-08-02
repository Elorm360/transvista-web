import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { WaitlistButton } from "@/components/layout/WaitlistButton";
import { ExperienceCategoryCard } from "./ExperienceCategoryCard";

import { exploreByExperienceContent } from "@/content/explore-by-experience";

export function ExploreByExperience() {
  const { cta } = exploreByExperienceContent;

  return (
    <Section id="explore-by-experience">
      <Container>
        <SectionHeader
          badge={exploreByExperienceContent.badge}
          title={exploreByExperienceContent.title}
          description={exploreByExperienceContent.description}
          align="center"
        />

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {exploreByExperienceContent.categories.map((category) => (
            <ExperienceCategoryCard
              key={category.id}
              title={category.title}
              subtitle={category.subtitle}
            />
          ))}
        </div>

        {/* Contextual conversion — tied to the visitor's uncertainty */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            {cta.title}
          </h3>

          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
            {cta.description}
          </p>

          <div className="mt-8">
            <WaitlistButton />
          </div>
        </div>
      </Container>
    </Section>
  );
}


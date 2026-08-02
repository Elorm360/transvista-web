import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { HowItWorksStep } from "./HowItWorksStep";

import { stepIcons } from "@/lib/icons";
import { howItWorksContent } from "@/content/how-it-works";

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container>
        <SectionHeader
          badge={howItWorksContent.badge}
          title={howItWorksContent.title}
          description={howItWorksContent.description}
          align="center"
        />

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {howItWorksContent.steps.map((step) => (
            <HowItWorksStep
              key={step.title}
              title={step.title}
              description={step.description}
              icon={stepIcons[step.icon]}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}


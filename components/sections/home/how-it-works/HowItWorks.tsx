import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { HowItWorksStep } from "./HowItWorksStep";

import { stepIcons } from "@/lib/icons";
import { howItWorksContent } from "@/content/how-it-works";

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container>
        <Reveal>
          <SectionHeader
            badge={howItWorksContent.badge}
            title={howItWorksContent.title}
            description={howItWorksContent.description}
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {howItWorksContent.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <HowItWorksStep
                title={step.title}
                description={step.description}
                icon={stepIcons[step.icon]}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}


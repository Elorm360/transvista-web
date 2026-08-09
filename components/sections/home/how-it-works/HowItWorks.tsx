import { ArrowRight } from "lucide-react";
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
            <Reveal key={step.title} delay={i * 120} className="relative">
              <HowItWorksStep
                number={i + 1}
                title={step.title}
                description={step.description}
                icon={stepIcons[step.icon]}
              />

              {i < howItWorksContent.steps.length - 1 && (
                <ArrowRight
                  className="absolute -right-4 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 text-brand-orange-300 lg:block"
                  aria-hidden="true"
                />
              )}
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

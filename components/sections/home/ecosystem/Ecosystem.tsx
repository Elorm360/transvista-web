import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { EcosystemCard } from "./EcosystemCard";

import { ecosystemIcons } from "@/lib/icons";
import { ecosystemContent } from "@/content/ecosystem";

export function Ecosystem() {
  return (
    <Section id="ecosystem" className="bg-brand-orange-50/40">
      <Container>
        <Reveal>
          <SectionHeader
            badge={ecosystemContent.badge}
            title={ecosystemContent.title}
            description={ecosystemContent.description}
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ecosystemContent.pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 80}>
              <EcosystemCard
                title={pillar.title}
                description={pillar.description}
                icon={ecosystemIcons[pillar.icon]}
              />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center rounded-full font-semibold text-brand-orange-700 transition-colors hover:text-brand-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-orange-600"
          >
            {ecosystemContent.cta.label} <span className="ml-1" aria-hidden="true">&rarr;</span>
          </a>
        </Reveal>
      </Container>
    </Section>
  );
}


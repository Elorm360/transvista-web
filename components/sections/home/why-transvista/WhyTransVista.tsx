import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ValueCard } from "./ValueCard";

import { featureIcons } from "@/lib/icons";
import { whyTransVistaContent } from "@/content/why-transvista";

export function WhyTransVista() {
  return (
    <Section id="why-transvista">
      <Container>
        <Reveal>
          <SectionHeader
            badge={whyTransVistaContent.badge}
            title={whyTransVistaContent.title}
            description={whyTransVistaContent.description}
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {whyTransVistaContent.cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 80}>
              <ValueCard
                title={card.title}
                description={card.description}
                icon={featureIcons[card.icon]}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}


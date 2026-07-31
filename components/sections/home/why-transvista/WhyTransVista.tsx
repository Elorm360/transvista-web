import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ValueCard } from "./ValueCard";

import { featureIcons } from "@/lib/icons";
import { whyTransVistaContent } from "@/content/why-transvista";

export function WhyTransVista() {
  return (
    <Section id="why-transvista">
      <Container>
        <SectionHeader
          badge={whyTransVistaContent.badge}
          title={whyTransVistaContent.title}
          description={whyTransVistaContent.description}
          align="center"
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {whyTransVistaContent.cards.map((card) => (
            <ValueCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={featureIcons[card.icon]}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}


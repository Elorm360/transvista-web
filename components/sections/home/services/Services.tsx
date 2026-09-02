import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceCard } from "./ServiceCard";

import { servicesContent } from "@/content/services";

export function Services() {
  return (
    <Section id="services" className="bg-white">
      <Container>
        <Reveal>
          <SectionHeader
            badge={servicesContent.badge}
            title={servicesContent.title}
            description={servicesContent.description}
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {servicesContent.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <ServiceCard
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

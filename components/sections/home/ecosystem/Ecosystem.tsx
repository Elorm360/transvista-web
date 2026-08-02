import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EcosystemCard } from "./EcosystemCard";

import { ecosystemIcons } from "@/lib/icons";
import { ecosystemContent } from "@/content/ecosystem";

export function Ecosystem() {
  return (
    <Section id="ecosystem" className="bg-slate-50">
      <Container>
        <SectionHeader
          badge={ecosystemContent.badge}
          title={ecosystemContent.title}
          description={ecosystemContent.description}
          align="center"
        />

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {ecosystemContent.pillars.map((pillar) => (
            <EcosystemCard
              key={pillar.title}
              title={pillar.title}
              description={pillar.description}
              icon={ecosystemIcons[pillar.icon]}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center rounded-full font-semibold text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          >
            {ecosystemContent.cta.label} <span className="ml-1" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </Container>
    </Section>
  );
}


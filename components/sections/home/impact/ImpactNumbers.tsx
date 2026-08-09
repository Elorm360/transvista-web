import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";

import { impactContent } from "@/content/impact";

export function ImpactNumbers() {
  return (
    <Section id="impact" className="bg-gradient-to-b from-white to-brand-blue-50/60">
      <Container>
        <Reveal>
          <SectionHeader
            badge={impactContent.badge}
            title={impactContent.title}
            description={impactContent.description}
            align="center"
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {impactContent.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="text-center">
              <p className="font-display bg-gradient-to-br from-brand-blue-700 to-brand-orange-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                <CountUp
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-600 sm:text-base">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { servicesContent } from "@/content/services";

export function Services() {
  return (
    <Section id="services" className="bg-white">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <SectionHeader
                badge={servicesContent.badge}
                title={servicesContent.title}
                description={servicesContent.description}
                align="left"
                className="mx-0"
              />
            </div>
          </Reveal>

          <div className="grid border-t border-slate-200 sm:grid-cols-2">
            {servicesContent.items.map(({ title, description, icon: Icon }, i) => (
              <Reveal
                key={title}
                delay={i * 60}
                className={`border-b border-slate-200 py-8 sm:px-8 ${
                  i % 2 === 0 ? "sm:border-r sm:pl-0" : "sm:pr-0"
                }`}
              >
                <Icon className="h-6 w-6 text-brand-orange-600" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="font-display mt-5 text-xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">{description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

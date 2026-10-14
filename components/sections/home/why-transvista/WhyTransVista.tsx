import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { featureIcons } from "@/lib/icons";
import { whyTransVistaContent } from "@/content/why-transvista";

export function WhyTransVista() {
  return (
    <Section id="why-transvista" className="bg-white">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <SectionHeader
              badge={whyTransVistaContent.badge}
              title={whyTransVistaContent.title}
              description={whyTransVistaContent.description}
              align="left"
              className="mx-0"
            />
          </Reveal>

          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {whyTransVistaContent.cards.map((card, i) => (
              <li key={card.title}>
                <Reveal
                  delay={i * 60}
                  className="grid grid-cols-[40px_1fr] gap-5 py-7 sm:grid-cols-[48px_1fr]"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-700 [&_svg]:h-5 [&_svg]:w-5"
                    aria-hidden="true"
                  >
                    {featureIcons[card.icon]}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-slate-950">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-7 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

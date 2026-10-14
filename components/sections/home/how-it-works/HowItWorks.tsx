import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { howItWorksContent } from "@/content/how-it-works";

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-[#f7f5f1]">
      <Container>
        <Reveal>
          <SectionHeader
            badge={howItWorksContent.badge}
            title={howItWorksContent.title}
            description={howItWorksContent.description}
            align="left"
            className="mx-0"
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-10 lg:grid-cols-4 lg:gap-8">
          {/* Connecting line: vertical on mobile, horizontal on desktop */}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-[15px] top-2 w-px bg-slate-300 lg:left-0 lg:right-0 lg:top-[15px] lg:bottom-auto lg:h-px lg:w-auto"
          />
          {howItWorksContent.steps.map((step, i) => (
            <li key={step.title} className="relative">
              <Reveal delay={i * 80} className="grid grid-cols-[32px_1fr] gap-5 lg:block">
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-[#f7f5f1] text-xs font-semibold text-slate-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="lg:mt-6 lg:pr-4">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

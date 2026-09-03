import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { featuredTestimonials } from "@/content/testimonials";

export function Testimonials() {
  return (
    <Section id="traveller-stories" className="bg-slate-50/80">
      <Container>
        <Reveal>
          <SectionHeader
            badge="Traveller stories"
            title="Real journeys. Real connections."
            description="Hear from travellers who explored Ghana with TransVista—sharing the moments, people and thoughtful support that made each trip memorable."
            align="center"
          />
        </Reveal>

        <div className="relative -mx-6 mt-12 overflow-hidden px-6 md:mx-0 md:px-0">
          <div
            className="marquee-track flex w-max focus:outline-none focus:[animation-play-state:paused]"
            tabIndex={0}
            aria-label="Moving traveller testimonials. Focus or hover to pause."
          >
            {["primary", "duplicate"].map((group) => (
              <div
                key={group}
                className="flex shrink-0 gap-5 pr-5"
                aria-hidden={group === "duplicate" ? true : undefined}
              >
                {featuredTestimonials.map((story) => (
                  <div key={`${group}-${story.slug}`} className="w-[82vw] max-w-sm shrink-0 md:w-[370px]">
                    <TestimonialCard story={story} compact />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50/95 to-transparent md:w-14" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50/95 to-transparent md:w-14" />
        </div>

        <Reveal delay={120}>
          <div className="mt-8 text-center">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 rounded-full border border-brand-blue-200 bg-white px-6 py-3 text-sm font-semibold text-brand-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue-300 hover:bg-brand-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600 focus-visible:ring-offset-2"
            >
              Read all traveller stories
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

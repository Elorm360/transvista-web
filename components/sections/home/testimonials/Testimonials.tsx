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

        <div className="-mx-6 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {featuredTestimonials.map((story, index) => (
            <Reveal key={story.slug} delay={index * 80} className="w-[84vw] shrink-0 snap-center md:w-auto">
              <TestimonialCard story={story} compact />
            </Reveal>
          ))}
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

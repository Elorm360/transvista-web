import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { travellerTestimonials } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Traveller Stories",
  description: "Read verified stories from travellers who explored Ghana with TransVista Africa.",
};

export default function TravellerStoriesPage() {
  return (
    <main id="main-content">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue-950 via-brand-blue-800 to-brand-blue-700 py-20 text-white lg:py-28">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-orange-500/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-200">
              <Heart aria-hidden="true" className="h-4 w-4" />
              TransVista traveller stories
            </span>
            <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              The people make every journey memorable.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              These verified stories come from travellers who joined TransVista experiences across Ghana. Their words have been lightly edited only for clarity, with permission.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {travellerTestimonials.map((story, index) => (
              <Reveal key={story.slug} delay={(index % 3) * 70}>
                <TestimonialCard story={story} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 lg:pb-28">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-brand-orange-50 p-8 ring-1 ring-brand-orange-100 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Your Ghana story starts here
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Tell us what you would love to experience.
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Share your interests, group size and budget range. TransVista will coordinate the details and respond within 48 hours.
              </p>
            </div>
            <Link
              href="/plan"
              className="mt-7 inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange-900/15 transition hover:-translate-y-0.5 hover:bg-brand-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-600 focus-visible:ring-offset-2 lg:mt-0"
            >
              Plan my trip
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

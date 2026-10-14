import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { travellerTestimonials } from "@/content/testimonials";

export const metadata: Metadata = pageMetadata({
  title: "Traveller Stories",
  description:
    "Read verified stories from travellers who explored Ghana with TransVista Africa.",
  path: "/stories",
});

export default function TravellerStoriesPage() {
  return (
    <main id="main-content">
      <PageHeader
        eyebrow="Traveller stories"
        title="The people make every journey memorable."
        lead="Stories from travellers who joined TransVista trips across Ghana, shared with permission and lightly edited for clarity."
      />

      <section className="py-12 lg:py-16">
        <Container>
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {travellerTestimonials.map((story) => (
              <div key={story.slug} className="mb-6 break-inside-avoid">
                <TestimonialCard story={story} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 lg:pb-28">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-brand-orange-50 p-8 ring-1 ring-brand-orange-100 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-700">
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

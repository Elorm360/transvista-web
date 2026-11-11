import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { StorySlideshow } from "@/components/testimonials/StorySlideshow";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { getStories } from "@/lib/reviews/getStories";

export const metadata: Metadata = pageMetadata({
  title: "Traveller Stories",
  description:
    "Read verified stories from travellers who explored Ghana with TransVista Africa.",
  path: "/stories",
});

// Refresh approved reviews at least every 5 minutes (new verified reviews refresh instantly).
export const revalidate = 300;

export default async function TravellerStoriesPage() {
  const stories = await getStories();

  return (
    <main id="main-content">
      <PageHeader
        eyebrow="Traveller stories"
        title="The people make every journey memorable."
        lead="Stories from travellers who joined TransVista trips across Ghana, shared with permission and lightly edited for clarity."
      />

      <section className="py-12 lg:py-16">
        <Container>
          <StorySlideshow stories={stories} />
        </Container>
      </section>

      <section id="share-your-story" className="scroll-mt-24 pb-16 lg:pb-20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-700">
              Travelled with us?
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Share your experience
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Your story helps other travellers discover Ghana with confidence.
            </p>
            <div className="mt-8">
              <ReviewForm />
            </div>
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

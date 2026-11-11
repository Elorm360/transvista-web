import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { StorySlideshow } from "@/components/testimonials/StorySlideshow";
import { getStories } from "@/lib/reviews/getStories";
import { featuredTestimonials } from "@/content/testimonials";

export async function Testimonials() {
  const [lead] = featuredTestimonials;
  const stories = (await getStories()).filter((story) => story.key !== lead.slug);

  return (
    <Section id="traveller-stories" className="bg-[#f7f5f1]">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-200">
              <Image
                src={lead.image}
                alt={lead.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
              />
              <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 px-4 py-3 text-sm backdrop-blur">
                <span className="font-semibold text-slate-900">{lead.trip}</span>
                <span className="text-slate-500"> · {lead.date}</span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={80}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-600">
              Traveller stories
            </p>
            <blockquote className="font-display mt-6 text-[1.75rem] font-medium leading-[1.25] tracking-tight text-slate-950 sm:text-4xl sm:leading-[1.2]">
              <span aria-hidden="true" className="mr-1 text-brand-orange-500">“</span>
              {lead.quote}
              <span aria-hidden="true" className="text-brand-orange-500">”</span>
            </blockquote>
            <p className="mt-6 text-base text-slate-900">
              <span className="font-semibold">{lead.name}</span>
              <span className="text-slate-500"> — {lead.location}</span>
            </p>
            <Link
              href="/stories"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-800 underline-offset-4 hover:underline"
            >
              Read all traveller stories
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </Container>

      <Container className="mt-16">
        <StorySlideshow stories={stories} label="More traveller stories" />
      </Container>
    </Section>
  );
}

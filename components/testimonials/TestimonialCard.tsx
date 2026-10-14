import Image from "next/image";
import type { TravellerTestimonial } from "@/content/testimonials";

type TestimonialCardProps = {
  story: TravellerTestimonial;
  compact?: boolean;
};

export function TestimonialCard({ story, compact = false }: TestimonialCardProps) {
  if (!compact) return <StoryCard story={story} />;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6">
      <blockquote className="flex-1 text-[15px] leading-7 text-slate-700">
        “{compact ? story.shortQuote : story.quote}”
      </blockquote>
      <footer className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
          <Image
            src={story.image}
            alt={story.imageAlt}
            fill
            sizes="44px"
            className="object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{story.name}</p>
          <p className="truncate text-xs text-slate-500">
            {story.trip} · {story.date}
          </p>
        </div>
      </footer>
    </article>
  );
}

/** Photo-led story card for the stories page. */
function StoryCard({ story }: { story: TravellerTestimonial }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <div className="relative aspect-[4/3] bg-slate-100">
        <Image
          src={story.image}
          alt={story.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-[50%_25%]"
        />
      </div>
      <div className="p-6">
        <blockquote className="font-display text-xl leading-snug tracking-tight text-slate-950">
          “{story.quote}”
        </blockquote>
        <p className="mt-5 text-sm font-semibold text-slate-900">{story.name}</p>
        <p className="text-xs text-slate-500">
          {story.location} · {story.trip} · {story.date}
        </p>
      </div>
    </article>
  );
}

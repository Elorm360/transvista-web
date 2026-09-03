import Image from "next/image";
import { MapPin, Quote } from "lucide-react";
import type { TravellerTestimonial } from "@/content/testimonials";

type TestimonialCardProps = {
  story: TravellerTestimonial;
  compact?: boolean;
};

export function TestimonialCard({ story, compact = false }: TestimonialCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(26,58,156,0.3)]">
      <div className={compact ? "relative aspect-[5/4] overflow-hidden" : "relative aspect-[4/3] overflow-hidden"}>
        <Image
          src={story.image}
          alt={story.imageAlt}
          fill
          sizes={compact ? "(max-width: 768px) 85vw, 33vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="font-display text-xl font-semibold leading-tight">{story.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            {story.location}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Quote aria-hidden="true" className="h-7 w-7 text-brand-orange-500" />
        <blockquote className="mt-3 flex-1 text-base leading-7 text-slate-700">
          “{compact ? story.shortQuote : story.quote}”
        </blockquote>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-brand-blue-700">{story.trip}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{story.date}</p>
        </div>
      </div>
    </article>
  );
}

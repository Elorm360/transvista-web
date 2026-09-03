import Image from "next/image";
import { MapPin, Quote } from "lucide-react";
import type { TravellerTestimonial } from "@/content/testimonials";

type TestimonialCardProps = {
  story: TravellerTestimonial;
  compact?: boolean;
};

export function TestimonialCard({ story, compact = false }: TestimonialCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(26,58,156,0.3)] sm:p-6">
      <header className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-brand-orange-50 sm:h-[72px] sm:w-[72px]">
          <Image
            src={story.image}
            alt={story.imageAlt}
            fill
            sizes="72px"
            className="object-cover object-top transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight text-slate-900">
            {story.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-brand-orange-500" />
            {story.location}
          </p>
        </div>
      </header>

      <div className="mt-5 flex flex-1 flex-col">
        <Quote aria-hidden="true" className="h-6 w-6 text-brand-orange-500" />
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

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TravellerTestimonial } from "@/content/testimonials";
import { usePrefersReducedMotion } from "@/components/testimonials/StorySlideshow";

/**
 * Homepage spotlight: a large traveller photo and quote that softly
 * cross-fades to the next traveller every few seconds.
 * Pauses on hover, focus or tap; never auto-rotates for reduced-motion users.
 */
export function FeaturedStoryRotator({
  stories,
  intervalMs = 7000,
}: {
  stories: TravellerTestimonial[];
  intervalMs?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  function handleTouchEnd(endX: number) {
    if (touchStartX === null) return;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 40 && stories.length > 1) {
      setIndex((current) => (current + (delta < 0 ? 1 : -1) + stories.length) % stories.length);
      setPaused(true);
    }
    setTouchStartX(null);
  }

  useEffect(() => {
    if (paused || reducedMotion || stories.length < 2) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % stories.length), intervalMs);
    return () => window.clearTimeout(timer);
  }, [index, paused, reducedMotion, stories.length, intervalMs]);

  if (!stories.length) return null;
  const fade = "transition-opacity duration-1000 ease-in-out";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => {
        setTouchStartX(event.changedTouches[0]?.clientX ?? null);
        setPaused(true);
      }}
      onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      className="grid touch-pan-y items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
      aria-roledescription="carousel"
      aria-label="Featured traveller stories"
    >
      {/* Photo stack */}
      <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-200">
        {stories.map((story, i) => (
          <div
            key={story.slug}
            className={`absolute inset-0 ${fade} ${i === index ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== index}
          >
            <Image
              src={story.image}
              alt={story.imageAlt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-top"
            />
            <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 px-4 py-3 text-sm backdrop-blur">
              <span className="font-semibold text-slate-900">{story.trip}</span>
              <span className="text-slate-500"> · {story.date}</span>
            </figcaption>
          </div>
        ))}
      </figure>

      {/* Quote stack: all quotes share one grid cell so the height never jumps */}
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-600">
          Traveller stories
        </p>
        <div className="mt-6 grid">
          {stories.map((story, i) => (
            <div
              key={story.slug}
              className={`[grid-area:1/1] ${fade} ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
              aria-hidden={i !== index}
            >
              <blockquote className="font-display text-[1.6rem] font-medium leading-[1.25] tracking-tight text-slate-950 sm:text-4xl sm:leading-[1.2]">
                <span aria-hidden="true" className="mr-1 text-brand-orange-500">“</span>
                {story.quote}
                <span aria-hidden="true" className="text-brand-orange-500">”</span>
              </blockquote>
              <p className="mt-6 text-base text-slate-900">
                <span className="font-semibold">{story.name}</span>
                <span className="text-slate-500"> — {story.location}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Choose a traveller story">
          {stories.map((story, i) => (
            <button
              key={story.slug}
              type="button"
              onClick={() => {
                setIndex(i);
                setPaused(true);
              }}
              aria-label={`Show ${story.name}'s story`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2 ${
                i === index ? "w-8 bg-brand-orange-500" : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <Link
          href="/stories"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-800 underline-offset-4 hover:underline"
        >
          Read all traveller stories
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

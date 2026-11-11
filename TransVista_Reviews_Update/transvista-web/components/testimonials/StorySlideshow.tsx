"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { StoryItem } from "@/lib/reviews/getStories";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Review-style card: small round photo top-left, name and trip beside it, quote below. */
export function ReviewCard({ story }: { story: StoryItem }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-blue-800 text-base font-bold text-white ring-2 ring-brand-orange-500 ring-offset-2">
          {story.image ? (
            <Image
              src={story.image}
              alt={story.imageAlt ?? story.name}
              fill
              sizes="56px"
              className="object-cover object-[50%_25%]"
            />
          ) : (
            <span aria-hidden="true">{initials(story.name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <span className="truncate">{story.name}</span>
            {story.verified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                Verified traveller
              </span>
            )}
          </p>
          <p className="text-xs leading-5 text-slate-500">
            {[story.location, story.trip, story.date].filter(Boolean).join(" · ")}
          </p>
        </div>
      </header>

      {typeof story.rating === "number" && (
        <div className="mt-4 flex gap-0.5" role="img" aria-label={`Rated ${story.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              aria-hidden="true"
              className={`h-4 w-4 ${n <= story.rating! ? "fill-brand-orange-500 text-brand-orange-500" : "text-slate-300"}`}
            />
          ))}
        </div>
      )}

      <span aria-hidden="true" className="mt-4 block font-display text-5xl leading-[0.6] text-brand-orange-500">
        “
      </span>
      <blockquote className="mt-2 flex-1 font-display text-lg leading-snug tracking-tight text-slate-950">
        {story.quote}
      </blockquote>
    </article>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Auto-advancing, swipeable slideshow of traveller stories.
 * Pauses on hover, focus or touch and respects reduced-motion settings.
 */
export function StorySlideshow({
  stories,
  intervalMs = 5000,
  label = "Traveller stories",
}: {
  stories: StoryItem[];
  intervalMs?: number;
  label?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  const slideWidth = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const width = slideWidth();
      const maxScroll = track.scrollWidth - track.clientWidth;
      let left = index * width;
      if (left > maxScroll + 4) left = 0; // loop back to the start
      if (left < 0) left = maxScroll;
      track.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion, slideWidth],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const width = slideWidth() || 1;
      const current = Math.round(track.scrollLeft / width);
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (direction === 1 && track.scrollLeft >= maxScroll - 4) goTo(0);
      else goTo(current + direction);
    },
    [goTo, slideWidth],
  );

  // Track the visible slide for the dots
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const width = slideWidth() || 1;
      setActive(Math.min(stories.length - 1, Math.round(track.scrollLeft / width)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [slideWidth, stories.length]);

  // Auto-advance
  useEffect(() => {
    if (paused || reducedMotion || stories.length < 2) return;
    const timer = window.setInterval(() => step(1), intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, step, intervalMs, stories.length]);

  if (!stories.length) return null;

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stories.map((story, index) => (
          <div
            key={story.key}
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${stories.length}`}
          >
            <ReviewCard story={story} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5" aria-hidden="true">
          {stories.map((story, index) => (
            <span
              key={story.key}
              className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-brand-orange-500" : "w-1.5 bg-slate-300"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-brand-orange-500 hover:text-brand-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500"
            aria-label="Previous story"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-brand-orange-500 hover:text-brand-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500"
            aria-label="Next story"
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

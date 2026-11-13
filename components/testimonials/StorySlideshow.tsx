"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { StoryItem } from "@/lib/reviews/getStories";
import { ADINKRA_AVATARS, AdinkraAvatar } from "@/components/reviews/AdinkraAvatars";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
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
              unoptimized={story.remoteImage}
              className="object-cover object-[50%_25%]"
            />
          ) : story.avatar ? (
            <AdinkraAvatar id={story.avatar} size={56} />
          ) : (
            <span aria-hidden="true">{initials(story.name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900">
            <span>{story.name}</span>
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
          {story.avatar && !story.image && (
            <p className="mt-0.5 text-[11px] italic text-brand-orange-700">
              {(() => {
                const a = ADINKRA_AVATARS.find((x) => x.id === story.avatar);
                return a ? `${a.name} · ${a.meaning}` : null;
              })()}
            </p>
          )}
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

/**
 * Traveller stories: a calm editorial grid on desktop and a native swipe rail
 * on touch-first devices. Desktop visitors move through stories at their own pace.
 */
export function StorySlideshow({
  stories,
  fadeFrom = "#ffffff",
  label = "Traveller stories",
}: {
  stories: StoryItem[];
  /** Background colour behind the row. */
  fadeFrom?: string;
  label?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!stories.length) return null;

  const visibleCount = Math.min(3, stories.length);
  const visibleStories = Array.from({ length: visibleCount }, (_, offset) =>
    stories[(activeIndex + offset) % stories.length],
  );

  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + stories.length) % stories.length);
  };

  const card = (story: StoryItem, key: string, className = "") => (
    <div key={key} className={className}>
      <ReviewCard story={story} />
    </div>
  );

  return (
    <section aria-label={label} className="w-full">
      {/* Desktop: a composed, three-column editorial layout with deliberate controls. */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 items-stretch gap-5">
          {visibleStories.map((story) =>
            card(story, `desktop-${story.key}-${activeIndex}`, "min-w-0"),
          )}
        </div>
        {stories.length > visibleCount && (
          <div className="mt-7 flex items-center justify-between">
            <p className="text-sm text-slate-500" aria-live="polite">
              Starting with story {activeIndex + 1} · {stories.length} stories
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous traveller stories"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-brand-orange-500 hover:text-brand-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next traveller stories"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-brand-orange-500 hover:text-brand-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Phones and touch tablets: native momentum scrolling with clear snap points. */}
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 md:hidden [scrollbar-width:thin] [overscroll-behavior-x:contain]"
        role="region"
        aria-label={`${label}. Swipe horizontally to browse stories.`}
      >
        {stories.map((story) => (
          <div key={story.key} className="w-[84vw] max-w-sm shrink-0 snap-start">
            <ReviewCard story={story} />
          </div>
        ))}
      </div>
    </section>
  );
}

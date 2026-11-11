"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
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
 * Continuously gliding row of story cards (slow and calm).
 * Pauses on hover, keyboard focus or tap. Shows a still, swipeable row
 * for visitors who prefer reduced motion.
 */
export function StorySlideshow({
  stories,
  secondsPerCard = 8,
  fadeFrom = "#ffffff",
  label = "Traveller stories",
}: {
  stories: StoryItem[];
  /** Higher = slower. */
  secondsPerCard?: number;
  /** Background colour behind the row, used for the soft edge fades. */
  fadeFrom?: string;
  label?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [tapPaused, setTapPaused] = useState(false);
  const paused = hovered || tapPaused;

  if (!stories.length) return null;

  const card = (story: StoryItem, key: string) => (
    <div key={key} className="w-[80vw] max-w-sm shrink-0 md:w-[360px]">
      <ReviewCard story={story} />
    </div>
  );

  if (reducedMotion) {
    return (
      <div role="region" aria-label={label} className="overflow-x-auto pb-2 [scrollbar-width:thin]">
        <div className="flex w-max gap-5 px-6 lg:px-8">{stories.map((s) => card(s, s.key))}</div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`${label}. Hover, focus or tap to pause.`}
      className="relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onClick={() => setTapPaused((value) => !value)}
    >
      <div
        className="flex w-max items-start"
        style={{
          animation: `marquee ${Math.max(stories.length * secondsPerCard, 30)}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {["primary", "duplicate"].map((group) => (
          <div
            key={group}
            className="flex shrink-0 items-start gap-5 pr-5"
            aria-hidden={group === "duplicate" ? true : undefined}
          >
            {stories.map((story) => card(story, `${group}-${story.key}`))}
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-24"
        style={{ background: `linear-gradient(to right, ${fadeFrom}, transparent)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-24"
        style={{ background: `linear-gradient(to left, ${fadeFrom}, transparent)` }}
      />
      {tapPaused && (
        <p className="pointer-events-none absolute right-4 top-3 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-medium text-white">
          Paused · tap to continue
        </p>
      )}
    </div>
  );
}

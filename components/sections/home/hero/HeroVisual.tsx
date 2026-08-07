"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * CountUp
 *
 * Lightweight count-up used for the "Live routes" stat chip. Animates from 0
 * to the target once the component mounts. Kept client-side and dependency-free.
 */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export function HeroVisual() {
  const imageRef = useRef<HTMLDivElement>(null);
  const routes = useCountUp(12);

  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;

    // Keep the hero image static on touch devices.
    // This avoids unnecessary scroll-driven transforms on iOS Safari.
    const isTouchDevice =
      window.matchMedia("(hover: none), (pointer: coarse)").matches;

    if (isTouchDevice) {
      return;
    }

    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const offset =
          (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.04;

        node.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`;
      });
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="relative">
      {/* Soft amber + blue glow behind the visual */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_50%_30%,rgba(244,164,96,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(15,76,129,0.22),transparent_50%)] blur-2xl"
      />

      <div className="relative h-[380px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-amber-50 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.3)] lg:h-[500px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,164,96,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,76,129,0.12),transparent_32%)]" />

        <div ref={imageRef} className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero/hero.jpeg"
            alt="Traveler exploring Ghana with TransVista Africa"
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="absolute left-5 top-5 rounded-xl border border-white/70 bg-white/95 px-3.5 py-2.5 shadow-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            Ghana
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            Trusted journeys, expertly planned
          </p>
        </div>

        <div className="absolute right-5 top-5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
          <p className="text-[11px] font-medium text-slate-500">Live routes</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {routes}+ curated
          </p>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg">
          <div className="h-9 w-9 rounded-full bg-amber-100" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Curated by local experts</p>
            <p className="text-xs text-slate-500">Transport, travel, and trust in one place</p>
          </div>
        </div>
      </div>
    </div>
  );
}

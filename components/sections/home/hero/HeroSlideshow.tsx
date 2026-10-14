"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Temporary imagery until original TransVista photography is ready
// (see docs/PHOTOS.md).
const heroImages = [
  { src: "/images/hero/hero-1.jpg", alt: "Travellers at a waterfall in Ghana" },
  { src: "/images/hero/hero-2.jpg", alt: "Discovering Ghana with TransVista Africa" },
  { src: "/images/hero/hero-3.jpg", alt: "Travel experience in Ghana" },
  { src: "/images/hero/hero-4.jpg", alt: "Exploring Ghana with TransVista Africa" },
];

const SLIDE_MS = 7000;

/** Full-bleed crossfading background with a slow, subtle zoom. */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % heroImages.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-brand-blue-950">
      {heroImages.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          fill
          sizes="100vw"
          quality={70}
          priority={index === 0}
          className={`object-cover transition-[opacity,transform] ease-out [transition-duration:1600ms,9000ms] motion-reduce:transition-none ${
            index === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
          }`}
        />
      ))}
      {/* Legibility: deep navy from the left/bottom, photo breathes on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-950/95 via-brand-blue-950/70 to-brand-blue-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-950 via-brand-blue-950/20 to-brand-blue-950/50" />

      <div className="absolute bottom-8 right-6 hidden items-center gap-1.5 sm:flex lg:right-8">
        {heroImages.map((image, index) => (
          <span
            key={image.src}
            className={`h-[3px] rounded-full transition-all duration-700 ${
              index === active ? "w-8 bg-white" : "w-3 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

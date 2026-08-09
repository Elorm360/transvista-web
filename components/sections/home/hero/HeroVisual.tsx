"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const heroImages = [
  {
    src: "/images/hero/hero 1.JPG",
    alt: "Traveler exploring Ghana with TransVista Africa",
  },
  {
    src: "/images/hero/hero 2.JPG",
    alt: "Discovering Ghana with TransVista Africa",
  },
  {
    src: "/images/hero/hero 3.JPG",
    alt: "Travel experience in Ghana",
  },
  {
    src: "/images/hero/hero 4.JPG",
    alt: "Exploring Ghana with TransVista Africa",
  },
  {
    src: "/images/hero/hero 5.jpg",
    alt: "Travel and experiences across Ghana",
  },
  {
    src: "/images/hero/hero 6.JPG",
    alt: "A curated Ghana travel experience",
  },
];

export function HeroVisual() {
  const imageRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  /*
   * Automatic slideshow.
   *
   * Changes image every 7 seconds.
   * Keeps running independently from the hero overlays.
   */
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  /*
   * Desktop-only parallax effect.
   *
   * Important:
   * We deliberately disable this on small/touch devices because
   * older iPhones can experience scroll/focus instability when
   * transforms are applied to interactive page content.
   */
  useEffect(() => {
    const node = imageRef.current;

    if (!node) return;

    const isSmallScreen = window.innerWidth < 768;

    const isTouchDevice = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;

    if (isSmallScreen || isTouchDevice) {
      node.style.transform = "none";
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

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="relative">
      {/* Ambient glow ring behind the floating visual */}
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-brand-orange-500/30 via-brand-blue-400/20 to-transparent blur-2xl"
      />

      <div className="relative h-[380px] overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_35px_90px_-30px_rgba(8,18,53,0.6)] backdrop-blur-sm lg:h-[500px]">
        {/* Soft orange + blue glow behind the visual */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,123,32,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(87,118,214,0.18),transparent_32%)]" />

      {/* Hero image carousel */}
      <div
        ref={imageRef}
        className="absolute inset-0 overflow-hidden"
      >
        {heroImages.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            priority={index === 0}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Subtle readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>

      {/* Carousel indicators */}
      <div
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm"
        aria-label="Hero image slideshow"
      >
        {heroImages.map((image, index) => (
          <span
            key={image.src}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === activeIndex
                ? "w-5 bg-white"
                : "w-1.5 bg-white/60"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoPlaceholder } from "@/components/media/PhotoPlaceholder";

interface ExperienceCardProps {
  title: string;
  category: string;
  location: string;
  image: string | null;
  href: string;
}

export function ExperienceCard({
  title,
  category,
  location,
  image,
  href,
}: ExperienceCardProps) {
  const imageWrapRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = imageWrapRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;

    node.style.transform = `scale(1.08) translate(${relX * -14}px, ${relY * -14}px)`;
  };

  const handleMouseLeave = () => {
    const node = imageWrapRef.current;
    if (!node) return;
    node.style.transform = "scale(1) translate(0px, 0px)";
  };

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-orange-200 hover:shadow-[0_24px_55px_-24px_rgba(244,123,32,0.25)]">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <Link href={href} className="block">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-slate-100"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {image ? (
            <div
              ref={imageWrapRef}
              className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
            >
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={75}
                className="object-cover"
              />
            </div>
          ) : (
            <PhotoPlaceholder
              label="Photo coming soon"
              caption="TransVista destination photography"
            />
          )}

          {image && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          )}

          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-700 shadow-lg">
              {category}
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4">
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {location}
            </span>
          </div>
        </div>

        <div className="pt-5">
          <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h3>

          <p className="mt-1.5 text-sm text-slate-500">{location}</p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-orange-700 transition-colors group-hover:text-brand-orange-800">
            Explore
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

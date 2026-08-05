"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  /** Delay in ms before the element reveals after entering view */
  delay?: number;
  /** Direction of the entrance animation */
  direction?: "up" | "left" | "right" | "none";
  className?: string;
};

/**
 * Reveal
 *
 * A lightweight scroll-reveal wrapper built on IntersectionObserver.
 * Fades + rises content into view the first time it enters the viewport.
 * No animation library required — keeps the bundle small and the feel bespoke.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback for older browsers (e.g. older iOS Safari) that don't support
    // IntersectionObserver — show the content immediately so it is never
    // stuck invisible/unusable.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    direction === "up"
      ? "translate-y-6"
      : direction === "left"
        ? "-translate-x-6"
        : direction === "right"
          ? "translate-x-6"
          : "translate-y-0";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible
          ? "translate-x-0 translate-y-0 opacity-100"
          : cn("opacity-0", hiddenTransform),
        className,
      )}
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  /** Target value to count up to */
  value: number;
  /** Text shown before the number (e.g. "$") */
  prefix?: string;
  /** Text shown after the number (e.g. "+", "B", "k") */
  suffix?: string;
  /** Decimal places to keep (e.g. 1 for "4.8") */
  decimals?: number;
  /** Animation duration in ms */
  duration?: number;
  className?: string;
};

/**
 * CountUp
 *
 * Animates a number counting up from 0 to `value` the first time it
 * scrolls into view, using IntersectionObserver + requestAnimationFrame.
 * No animation library — consistent with Reveal/MagneticButton.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1800,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setDisplay(value.toFixed(decimals));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            observer.unobserve(entry.target);

            const start = performance.now();

            const tick = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out-cubic — fast start, gentle settle
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = value * eased;

              setDisplay(current.toFixed(decimals));

              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                setDisplay(value.toFixed(decimals));
              }
            };

            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";

/**
 * ScrollProgress
 *
 * A thin bar fixed to the top of the viewport that fills left-to-right
 * as the visitor scrolls the page. Pure scroll-event math — no library.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-orange-500 to-brand-blue-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

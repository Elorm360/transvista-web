"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * MagneticButton
 *
 * A lightweight "magnetic" wrapper — the child subtly follows the cursor
 * within a small radius, then springs back on leave. Pure pointer-events,
 * no animation library needed.
 *
 * The effect is only enabled on devices with a fine pointer + hover support
 * (e.g. desktop with a mouse). On touch devices (phones/tablets) the wrapper
 * is a static container, so taps are never intercepted and the button always
 * responds immediately.
 */
export function MagneticButton({ children, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Detect hover capability on mount (client only).
  const [hoverReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false
    );
  });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverReady) return;
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);

    node.style.transform = `translate(${relX * 0.18}px, ${relY * 0.24}px)`;
  };

  const handleLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={enabled && hoverReady ? handleMove : undefined}
      onMouseEnter={() => setEnabled(true)}
      onMouseLeave={enabled && hoverReady ? handleLeave : undefined}
      className={cn(
        "inline-block",
        hoverReady &&
          "transition-transform duration-300 ease-out will-change-transform",
        className,
      )}
    >
      {children}
    </div>
  );
}

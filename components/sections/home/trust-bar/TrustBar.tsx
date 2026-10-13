import { ShieldCheck } from "lucide-react";
import { trustBarItems } from "@/content/trust-bar";

/**
 * TrustBar
 *
 * A slow, subtle infinite marquee of trust indicators sitting right under
 * the hero. The track is duplicated once and shifted by exactly -50% via
 * CSS animation, so the loop is seamless — no JS scroll math needed.
 * Pauses on hover/focus for readability and accessibility.
 */
export function TrustBar() {
  const items = [...trustBarItems, ...trustBarItems];

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white py-6">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32"
        aria-hidden="true"
      />

      <div className="marquee-track flex w-max items-center gap-12" aria-hidden="true">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.15em] text-slate-400"
          >
            <ShieldCheck className="h-4 w-4 text-brand-orange-500" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>

      {/* Accessible, non-animated list for screen readers */}
      <span className="sr-only">
        {trustBarItems.join(", ")}
      </span>
    </section>
  );
}

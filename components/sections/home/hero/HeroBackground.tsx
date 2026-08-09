/**
 * HeroBackground
 *
 * Cinematic dark backdrop for the hero: a slow-drifting mesh gradient
 * blending brand blue and deep navy, plus a handful of floating
 * geometric shapes for depth. Pure CSS animation — no canvas, no
 * particle library. `aria-hidden` throughout since it's decorative.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base navy gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-950 via-brand-blue-900 to-slate-950" />

      {/* Drifting brand mesh */}
      <div className="mesh-gradient absolute inset-0 opacity-80" />

      {/* Floating geometric shapes */}
      <div
        className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full border border-brand-orange-400/20 float-soft"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute right-[12%] top-[28%] h-16 w-16 rotate-45 rounded-2xl border border-white/10 float-soft"
        style={{ animationDuration: "10s", animationDelay: "1.2s" }}
      />
      <div
        className="absolute bottom-[22%] left-[18%] h-10 w-10 rounded-full bg-brand-orange-500/20 blur-sm float-soft"
        style={{ animationDuration: "7s", animationDelay: "0.6s" }}
      />
      <div
        className="absolute bottom-[14%] right-[20%] h-20 w-20 rounded-full border border-brand-blue-300/20 float-soft"
        style={{ animationDuration: "9s", animationDelay: "2s" }}
      />
      <div
        className="absolute right-[6%] top-[60%] h-3 w-3 rounded-full bg-brand-orange-400/60 float-soft"
        style={{ animationDuration: "6s", animationDelay: "0.3s" }}
      />
      <div
        className="absolute left-[30%] top-[10%] h-2 w-2 rounded-full bg-white/50 float-soft"
        style={{ animationDuration: "5s", animationDelay: "1.6s" }}
      />

      {/* Fade to the light page below */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-brand-blue-950" />
    </div>
  );
}

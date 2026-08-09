import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { heroStats } from "@/constants/data/hero";

/**
 * HeroStats
 *
 * A floating glass stats bar beneath the hero headline. Numeric stats
 * count up into view; the platform badge renders as static copy.
 */
export function HeroStats() {
  return (
    <Reveal delay={520}>
      <div className="mt-10 grid grid-cols-2 gap-3 rounded-[24px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-white/10 sm:p-6">
        {heroStats.map((stat) => (
          <div key={stat.label} className="px-2 text-center sm:px-4">
            <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {stat.type === "count" ? (
                <CountUp value={stat.value!} suffix={stat.suffix} />
              ) : (
                stat.display
              )}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-300 sm:text-[13px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

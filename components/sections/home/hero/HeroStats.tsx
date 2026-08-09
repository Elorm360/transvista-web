import { Reveal } from "@/components/motion/Reveal";

const heroPromises = [
  { title: "Local insight", description: "Guidance rooted in Ghana" },
  { title: "Verified partners", description: "People you can rely on" },
  { title: "Simple planning", description: "Your journey, made easier" },
] as const;

export function HeroStats() {
  return (
    <Reveal delay={520}>
      <div className="mt-10 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10">
        {heroPromises.map((promise) => (
          <div key={promise.title} className="px-0 sm:px-5 first:sm:pl-0 last:sm:pr-0">
            <p className="text-sm font-semibold text-white">{promise.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              {promise.description}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

import Image from "next/image";

export function HeroVisual() {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-[0_25px_80px_-30px_rgba(15,23,42,0.35)] lg:h-[560px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.18),transparent_32%)]" />

      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/hero/hero.jpeg"
          alt="Traveler exploring Ghana with TransVista Africa"
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>

      <div className="absolute left-6 top-6 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Ghana
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          Trusted journeys, expertly planned
        </p>
      </div>

      <div className="absolute right-6 top-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-medium text-slate-500">Live routes</p>
        <p className="mt-1 text-lg font-bold text-slate-900">12+ curated</p>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="h-10 w-10 rounded-full bg-blue-100" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Curated by local experts</p>
          <p className="text-xs text-slate-500">Transport, travel, and trust in one place</p>
        </div>
      </div>
    </div>
  );
}
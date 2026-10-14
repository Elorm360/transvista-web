"use client";

import { useState } from "react";
import { destinations, type Destination } from "@/constants/data/destinations";
import { DestinationCard } from "./DestinationCard";

const themes = [
  { id: "all", label: "All", match: () => true },
  {
    id: "culture",
    label: "Culture & heritage",
    match: (d: Destination) => /culture|history|heritage/i.test(d.category),
  },
  {
    id: "nature",
    label: "Nature & adventure",
    match: (d: Destination) => /nature|rainforest|adventure/i.test(d.category),
  },
  {
    id: "wildlife",
    label: "Wildlife",
    match: (d: Destination) => /wildlife|safari/i.test(d.category),
  },
] as const;

type ThemeId = (typeof themes)[number]["id"];

export function DestinationGrid() {
  const [theme, setTheme] = useState<ThemeId>("all");
  const active = themes.find((item) => item.id === theme) ?? themes[0];
  const visible = destinations.filter((destination) => active.match(destination));

  return (
    <section
      aria-labelledby="destinations-heading"
      className="py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            Discover Ghana
          </p>

          <h1
            id="destinations-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
          >
            Places worth discovering
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Explore destinations across Ghana and discover the places,
            experiences, and journeys that make each one unique.
          </p>
        </div>

        <div
          className="mt-10 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Filter destinations by theme"
        >
          {themes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id)}
              aria-pressed={theme === item.id}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                theme === item.id
                  ? "border-brand-blue-800 bg-brand-blue-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-brand-blue-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {visible.length} destinations shown
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

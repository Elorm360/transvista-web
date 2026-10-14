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
    <section aria-label="Destinations" className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className="flex flex-wrap gap-2"
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

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

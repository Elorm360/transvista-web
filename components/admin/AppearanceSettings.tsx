"use client";

import { useState } from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { Card } from "@/components/admin/ui";
import { setMyTheme } from "@/app/actions/account";
import { ADMIN_THEME_EVENT, ADMIN_THEMES, type AdminTheme } from "@/lib/admin/theme";

const icons = { light: Sun, dark: Moon, system: Monitor } as const;

/** Light / Dark / Match my device, saved to your profile. */
export default function AppearanceSettings({ initialTheme }: { initialTheme: AdminTheme }) {
  const [theme, setTheme] = useState<AdminTheme>(initialTheme);
  const [error, setError] = useState<string | null>(null);

  async function choose(value: AdminTheme) {
    const previous = theme;
    setTheme(value);
    setError(null);
    // Update the page immediately; the shell listens for this event.
    window.dispatchEvent(new CustomEvent(ADMIN_THEME_EVENT, { detail: value }));
    const result = await setMyTheme(value);
    if (!result.ok) {
      setTheme(previous);
      window.dispatchEvent(new CustomEvent(ADMIN_THEME_EVENT, { detail: previous }));
      setError(result.error);
    }
  }

  return (
    <Card
      title={<span className="flex items-center gap-2"><Palette className="h-4 w-4 text-slate-400" aria-hidden="true" />Appearance</span>}
      description="Applies to the admin on every device you sign in on."
      bodyClassName="p-5"
    >
      <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
        {ADMIN_THEMES.map(({ value, label }) => {
          const Icon = icons[value];
          const selected = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(value)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected
                  ? "border-brand-blue-600 bg-brand-blue-50 text-brand-blue-700"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
    </Card>
  );
}

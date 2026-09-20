"use client";

import { useState } from "react";

export type AiDraft = {
  destination: string;
  notes: string;
  suggestedServices: string[];
};

type Suggestion = {
  destination: string;
  title: string;
  intro: string;
  days: { day: number; theme: string; stops: string[] }[];
  suggestedServices: string[];
  questionForTraveller: string;
  budget: string;
  notice: string;
};

function describe(plan: Suggestion) {
  return [plan.title, plan.intro,
    ...plan.days.map((day) => `Day ${day.day} — ${day.theme}: ${day.stops.join("; ")}`),
    `Services to discuss: ${plan.suggestedServices.join(", ") || "Transport"}`,
    plan.budget ? `Preferred budget: ${plan.budget}` : "",
    `Question: ${plan.questionForTraveller}`,
  ].filter(Boolean).join("\n");
}

export function AiTripCompanion({ onApply }: { onApply: (draft: AiDraft) => void }) {
  const [destination, setDestination] = useState("accra");
  const [days, setDays] = useState(1);
  const [travellers, setTravellers] = useState(1);
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState("");
  const [preferences, setPreferences] = useState("");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setBusy(true); setError(""); setSuggestion(null);
    try {
      const res = await fetch("/api/ai/trip-plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, travellers,
          interests: interests.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 6),
          budget, preferences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not prepare your trip.");
      setSuggestion(data as Suggestion);
      setEditableNotes(describe(data as Suggestion));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare your trip.");
    } finally { setBusy(false); }
  }

  return (
    <section className="mb-9 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="ai-title">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange-700">Trip companion</p>
      <h2 id="ai-title" className="mt-2 font-display text-2xl font-semibold text-slate-900">Start with a few ideas</h2>
      <p className="mt-2 text-slate-600">Get a draft, adjust it, then send it with the request form below. You can always skip this step.</p>
      <p className="mt-2 text-sm text-slate-600">Your trip ideas are processed by an AI provider to make the draft. Do not enter identification or payment details.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold text-slate-800">Destination
          <select value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-2 w-full rounded-lg border p-3">
            <option value="accra">Accra</option><option value="cape-coast">Cape Coast & Elmina</option>
            <option value="volta-region">Volta Region</option><option value="kumasi">Kumasi</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-800">Days
          <input type="number" min={1} max={7} value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-2 w-full rounded-lg border p-3" />
        </label>
        <label className="text-sm font-semibold text-slate-800">Travellers
          <input type="number" min={1} max={20} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className="mt-2 w-full rounded-lg border p-3" />
        </label>
        <label className="text-sm font-semibold text-slate-800 sm:col-span-2">Interests, separated by commas
          <input value={interests} onChange={(e) => setInterests(e.target.value)} maxLength={280} placeholder="History, local food, nature" className="mt-2 w-full rounded-lg border p-3" />
        </label>
        <label className="text-sm font-semibold text-slate-800">Comfortable budget (optional)
          <input value={budget} onChange={(e) => setBudget(e.target.value)} maxLength={70} placeholder="GHS 2,000 total" className="mt-2 w-full rounded-lg border p-3" />
        </label>
        <label className="text-sm font-semibold text-slate-800 sm:col-span-3">Anything else? (optional)
          <input value={preferences} onChange={(e) => setPreferences(e.target.value)} maxLength={350} placeholder="Travelling with children, prefer a relaxed pace…" className="mt-2 w-full rounded-lg border p-3" />
        </label>
      </div>
      <button type="button" disabled={busy || days < 1 || days > 7 || travellers < 1 || travellers > 20}
        onClick={generate} className="mt-5 rounded-full bg-brand-blue-800 px-6 py-3 font-semibold text-white disabled:opacity-50">
        {busy ? "Preparing ideas…" : "Suggest a trip"}
      </button>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {suggestion && <div className="mt-8 border-t pt-6">
        <h3 className="font-display text-xl font-semibold">{suggestion.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{suggestion.notice}</p>
        <label className="mt-5 block text-sm font-semibold text-slate-800">Your editable draft
          <textarea value={editableNotes} onChange={(e) => setEditableNotes(e.target.value)} maxLength={1500}
            rows={9} className="mt-2 w-full rounded-lg border border-slate-300 p-3 font-normal leading-6" />
        </label>
        <p className="mt-2 text-xs text-slate-600">Using the draft restarts the request form. Review all fields before you submit.</p>
        <button type="button" disabled={!editableNotes.trim()} onClick={() => onApply({
          destination: suggestion.destination,
          notes: editableNotes,
          suggestedServices: suggestion.suggestedServices,
        })} className="mt-4 rounded-full border border-brand-blue-700 px-5 py-2.5 font-semibold text-brand-blue-800 disabled:opacity-50">
          Use this draft in my request
        </button>
      </div>}
    </section>
  );
}

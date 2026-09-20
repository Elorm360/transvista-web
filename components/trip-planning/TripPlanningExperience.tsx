"use client";

import { useState } from "react";
import { AiTripCompanion, type AiDraft } from "./AiTripCompanion";
import { TripRequestForm } from "./TripRequestForm";

export function TripPlanningExperience({ initialDestination }: { initialDestination: string }) {
  const [draft, setDraft] = useState<AiDraft | null>(null);
  const [version, setVersion] = useState(0);
  return <>
    <AiTripCompanion onApply={(value) => { setDraft(value); setVersion((v) => v + 1); }} />
    <TripRequestForm key={version} initialDestination={draft?.destination ?? initialDestination}
      initialAiNotes={draft?.notes ?? ""} initialAiServices={draft?.suggestedServices ?? []} />
  </>;
}

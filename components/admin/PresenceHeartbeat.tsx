"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const BEAT_MS = 60_000;
/** No mouse, keyboard, touch or scroll for this long = "away". */
const IDLE_MS = 5 * 60_000;

/**
 * Tells the server once a minute that this person has the dashboard open,
 * and whether they're actually using it. This drives online / away /
 * offline, "last seen" and active time on the Team activity page. Nothing
 * about what they type or click is sent, only "here" and "active or not".
 */
export default function PresenceHeartbeat() {
  useEffect(() => {
    const supabase = createClient();
    let lastInteraction = Date.now();
    let lastSent = 0;

    const isActive = () => document.visibilityState === "visible" && Date.now() - lastInteraction < IDLE_MS;

    const beat = () => {
      lastSent = Date.now();
      // Best effort: a missed beat only makes someone look offline for a minute.
      void supabase.rpc("record_admin_heartbeat", { p_active: isActive() }).then(({ error }) => {
        if (error) console.warn("[presence]", error.message);
      });
    };

    const onInteract = () => {
      const wasIdle = Date.now() - lastInteraction >= IDLE_MS;
      lastInteraction = Date.now();
      // Coming back from idle: report it now instead of waiting up to a minute.
      if (wasIdle && Date.now() - lastSent > 5_000) beat();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        lastInteraction = Date.now();
        if (Date.now() - lastSent > 5_000) beat();
      }
    };

    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const;
    events.forEach((name) => window.addEventListener(name, onInteract, { passive: true }));
    document.addEventListener("visibilitychange", onVisible);

    beat();
    const timer = window.setInterval(beat, BEAT_MS);

    return () => {
      window.clearInterval(timer);
      events.forEach((name) => window.removeEventListener(name, onInteract));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}

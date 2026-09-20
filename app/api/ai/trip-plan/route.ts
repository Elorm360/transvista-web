import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { destinations } from "@/constants/data/destinations";

export const runtime = "nodejs";

const curated = ["accra", "cape-coast", "kumasi", "volta-region"];
const responseHeaders = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: responseHeaders });

type Input = {
  destination: string;
  days: number;
  travellers: number;
  interests: string[];
  budget: string;
  preferences: string;
};

function parseInput(raw: unknown): Input | null {
  if (!raw || typeof raw !== "object") return null;
  const x = raw as Record<string, unknown>;
  if (typeof x.destination !== "string" || !curated.includes(x.destination) ||
      typeof x.days !== "number" || !Number.isInteger(x.days) || x.days < 1 || x.days > 7 ||
      typeof x.travellers !== "number" || !Number.isInteger(x.travellers) || x.travellers < 1 || x.travellers > 20 ||
      !Array.isArray(x.interests) || x.interests.length > 6 ||
      !x.interests.every((v: unknown) => typeof v === "string" && v.length <= 60) ||
      typeof x.budget !== "string" || x.budget.length > 70 ||
      typeof x.preferences !== "string" || x.preferences.length > 350) return null;
  return {
    destination: x.destination, days: Number(x.days), travellers: Number(x.travellers),
    interests: x.interests as string[], budget: x.budget.trim(),
    preferences: x.preferences.trim(),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rateSecret = process.env.AI_RATE_LIMIT_SECRET;
  if (!apiKey || !model || !serviceKey || !rateSecret) {
    return json({ error: "The trip companion is being prepared. Please use the trip request form for now." }, 503);
  }
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return json({ error: "Request too long." }, 413);
  let raw: unknown;
  try {
    const body = await request.text();
    if (body.length > 4096) return json({ error: "Request too long." }, 413);
    raw = JSON.parse(body);
  } catch { return json({ error: "Invalid request." }, 400); }
  const input = parseInput(raw);
  if (!input) return json({ error: "Choose a destination and enter valid trip details." }, 400);

  // The deployment proxy supplies the original client IP. Store only a salted hash.
  const incoming = await headers();
  const ip = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = "guest:" + createHash("sha256").update(rateSecret + ":" + ip).digest("hex");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // A global cap prevents uncontrolled model spend if IPs rotate.
  const { data: globalAllowed, error: globalError } = await db.rpc("consume_ai_planner_quota", { p_key: "global", p_limit: 100 });
  if (globalError) return json({ error: "The trip companion is temporarily unavailable." }, 503);
  if (!globalAllowed) return json({ error: "The trip companion is at capacity today. Please use the trip request form." }, 429);
  const { data: allowed, error: quotaError } = await db.rpc("consume_ai_planner_quota", { p_key: key, p_limit: 5 });
  if (quotaError) return json({ error: "The trip companion is temporarily unavailable." }, 503);
  if (!allowed) return json({ error: "You have reached today's planning limit. Please use the trip request form." }, 429);

  const destination = destinations.find((d) => d.slug === input.destination)!;
  const highlights = destination.highlights.slice(0, 8);
  const schema = {
    type: "object", additionalProperties: false,
    properties: {
      title: { type: "string" }, intro: { type: "string" },
      days: { type: "array", items: { type: "object", additionalProperties: false,
        properties: {
          day: { type: "integer" }, theme: { type: "string" },
          stops: { type: "array", items: { type: "string", enum: highlights } },
        }, required: ["day", "theme", "stops"] } },
      suggestedServices: { type: "array", items: { type: "string", enum: ["transport", "guide", "accommodation", "meals", "photography"] } },
      questionForTraveller: { type: "string" },
    }, required: ["title", "intro", "days", "suggestedServices", "questionForTraveller"],
  };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    let upstream: Response;
    try {
      upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST", signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          instructions: "You are TransVista's Ghana trip planner. Only recommend the supplied destination highlights. Plan a realistic pace and account for travel time and group size. Keep writing warm, concise, and practical. Never claim prices, opening hours, availability, reservations, routes, visa requirements or partner confirmations. No medical or safety guarantees. Never ask for identification or payment details. Ask one useful follow-up question. Reply in the requested JSON schema.",
          input: JSON.stringify({ destination: destination.name, highlights, ...input }),
          max_output_tokens: 1400,
          text: { format: { type: "json_schema", name: "transvista_trip_draft", strict: true, schema } },
        }),
      });
    } finally { clearTimeout(timeout); }
    if (!upstream.ok) {
      console.error("[ai trip plan] model response", upstream.status);
      return json({ error: "The companion could not prepare a plan. Try again later." }, 502);
    }
    const result = await upstream.json();
    const output = result.output?.flatMap((item: { content?: { type: string; text?: string }[] }) => item.content ?? [])
      .find((item: { type: string }) => item.type === "output_text")?.text;
    if (!output) return json({ error: "The companion could not prepare a plan. Try again." }, 502);
    const plan = JSON.parse(output) as {
      title: string; intro: string;
      days: { day: number; theme: string; stops: string[] }[];
      suggestedServices: string[]; questionForTraveller: string;
    };
    if (!Array.isArray(plan.days) || plan.days.length !== input.days ||
        plan.days.some((d, index) => d.day !== index + 1 || !Array.isArray(d.stops) ||
          !d.stops.length || d.stops.some((s) => !highlights.includes(s)))) {
      return json({ error: "The companion could not prepare a reliable plan. Try again." }, 502);
    }
    return json({
      destination: input.destination, title: plan.title.slice(0, 100),
      intro: plan.intro.slice(0, 300), days: plan.days.map((d) => ({
        day: d.day, theme: d.theme.slice(0, 80), stops: d.stops.slice(0, 4),
      })),
      suggestedServices: plan.suggestedServices.filter((s) =>
        ["transport", "guide", "accommodation", "meals", "photography"].includes(s)).slice(0, 5),
      questionForTraveller: plan.questionForTraveller.slice(0, 180),
      budget: input.budget,
      notice: "This is a draft. TransVista confirms availability and the final price within 48 hours of your request.",
    });
  } catch (error) {
    console.error("[ai trip plan] generation failed", error);
    return json({ error: "The companion could not prepare a plan. Try again later." }, 502);
  }
}

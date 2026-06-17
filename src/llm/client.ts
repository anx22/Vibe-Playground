import {
  analogySchema,
  axisVectorSchema,
  entangleSchema,
  judgeSchema,
  personaSchema,
  type Direction,
  type Entangle,
  type JudgeScore,
  type Persona,
} from "./schema";
import type { AxisVector } from "../engine";

/**
 * Client-side fetchers. They call our serverless proxy (api/), which holds the
 * AI_GATEWAY_API_KEY and talks to the Vercel AI Gateway — the key is never client-side.
 * Callers fall back to the offline template when these throw (no key / `vite` without functions).
 */

/**
 * Optional base URL so the eval can target a deployed gateway (e.g. the live Vercel app)
 * from Node. In the browser this stays "" → same-origin relative requests.
 */
let API_BASE = "";
export const setApiBase = (base: string) => {
  API_BASE = base.replace(/\/$/, "");
};

async function post<T>(path: string, body: unknown, schema: { parse(x: unknown): T }): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return schema.parse(await res.json());
}

/** Model tier — `strong` (Sonnet) for the user-facing Studio, `cheap` (Haiku) for Lab evals, `premium` (Opus) for the strict judge run. */
export type Tier = "cheap" | "strong" | "premium";

export const generatePersona = (input: { briefing: string; tier?: Tier }): Promise<Persona> =>
  post("/api/persona", input, personaSchema);

/**
 * Analogy Engine (the new core, E-046): briefing → functional core → distant domains that embody
 * the SAME core → N Leitwerte. On-target and surprising at once. One call returns the whole round.
 */
export const generateAnalogies = (input: {
  briefing: string;
  n?: number;
  tier?: Tier;
}): Promise<Direction[]> => post("/api/analogy", input, analogySchema).then((r) => r.directions);

/**
 * Engine D — Structural Entanglement (ENGINE-D-SPEC). Distill essence → burn clichés → far-but-
 * rhyming worlds → affordance filter → bridge → name. Returns essence + forbidden + bridges.
 */
export const generateBridges = (input: {
  briefing: string;
  n?: number;
  steer?: string;
  tier?: Tier;
}): Promise<Entangle> => post("/api/entangle", input, entangleSchema);

/** Briefing → axis vector via the LLM (E-026), so the briefing actually steers the structure. */
export const interpretBriefing = (briefing: string, tier: Tier = "cheap"): Promise<AxisVector> =>
  post("/api/interpret", { briefing, tier }, axisVectorSchema) as Promise<AxisVector>;

/**
 * LLM quality judge — scores one direction against the briefing (1..5 on coherence/trigger/
 * fit/freshness). This is the eval's fitness function: it lets us measure whether a method's
 * output is actually good, not just structurally diverse.
 */
export const judge = (
  input: { briefing: string; leitwert: string; scene?: string; mood: string },
  tier: Tier = "cheap",
): Promise<JudgeScore> => post("/api/judge", { ...input, tier }, judgeSchema);

/** Is the LLM proxy reachable? (The authoritative test of generation is an actual render.) */
export async function llmReady(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE + "/api/health");
    return res.ok;
  } catch {
    return false;
  }
}

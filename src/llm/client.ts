import {
  analogySchema,
  axisVectorSchema,
  batchResultSchema,
  judgeSchema,
  personaSchema,
  sceneRenderSchema,
  seedListSchema,
  type Direction,
  type JudgeScore,
  type Persona,
  type SceneRender,
  type WorldTerm,
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

export interface RenderJob {
  leitwert: string;
  worlds: string[];
  mood: string;
  note: string;
  briefing?: string;
}

export const renderScene = (input: RenderJob, tier?: Tier): Promise<SceneRender> =>
  post("/api/render", { ...input, tier }, sceneRenderSchema);

/** Batch render — one round-trip, fanned out server-side (the Studio's generate path). */
export const renderBatch = (jobs: RenderJob[], tier?: Tier): Promise<SceneRender[]> =>
  post("/api/batch", { jobs, tier }, batchResultSchema).then((r) => r.results);

export const expandSeeds = (input: {
  briefing: string;
  n: number;
  tier?: Tier;
}): Promise<WorldTerm[]> => post("/api/seeds", input, seedListSchema).then((r) => r.worlds);

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

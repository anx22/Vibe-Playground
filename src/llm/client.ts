import {
  entangleSchema,
  judgeSchema,
  personaListSchema,
  workbenchSchema,
  type Entangle,
  type JudgeScore,
  type Persona,
  type WorkbenchCandidate,
} from "./schema";

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

/** Batched: N distinct personas in one call (avoids N round-trips per round). */
export const generatePersonas = (input: { briefing: string; n?: number; tier?: Tier }): Promise<Persona[]> =>
  post("/api/persona", input, personaListSchema).then((r) => r.personas);

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

/**
 * Engine E — Latent Agent (ENGINE-E-SPEC, Tier-0). Same bridge contract as Engine D, but "far" is
 * measured with real embeddings (diverge → embed/rank → resonate/compose) rather than asserted.
 */
export const generateLatent = (input: {
  briefing: string;
  n?: number;
  steer?: string;
}): Promise<Entangle> => post("/api/latent", input, entangleSchema);

/**
 * Engine F — Technique Workbench (ENGINE-F-SPEC). Fast, pure-prompt Volume → Filter → Curation;
 * returns curated candidates clustered into orthogonal taste-directions. The speed path.
 */
export const generateWorkbench = (input: {
  briefing: string;
  n?: number;
  steer?: string;
}): Promise<WorkbenchCandidate[]> =>
  post("/api/workbench", input, workbenchSchema).then((r) => r.candidates);

/** LLM quality judge — scores one direction against the briefing (on-target × surprise × craft). */
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

import {
  entangleSchema,
  judgeBatchSchema,
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

/** Per-request timeout (ms); 0 = none. The eval sets it so a stalled engine fails fast, never hangs. */
let requestTimeoutMs = 0;
export const setRequestTimeout = (ms: number) => {
  requestTimeoutMs = ms;
};

async function post<T>(path: string, body: unknown, schema: { parse(x: unknown): T }): Promise<T> {
  const ctrl = requestTimeoutMs > 0 ? new AbortController() : undefined;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), requestTimeoutMs) : undefined;
  try {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl?.signal,
    });
    if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
    return schema.parse(await res.json());
  } catch (e) {
    if (ctrl?.signal.aborted) throw new Error(`${path} → timeout ${requestTimeoutMs}ms`);
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
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

/** Batched LLM judge — scores MANY directions in ONE call (a structure in, scores[] out). */
export const judgeBatch = (
  input: { briefing: string; items: { leitwert: string; scene: string; mood: string }[] },
  tier: Tier = "cheap",
): Promise<{ scores: JudgeScore[] }> => post("/api/judge", { ...input, tier }, judgeBatchSchema);

/** Convenience: score a single direction (a 1-item batch — keeps the eval's per-card path working). */
export const judge = async (
  input: { briefing: string; leitwert: string; scene?: string; mood: string },
  tier: Tier = "cheap",
): Promise<JudgeScore> => {
  const { briefing, leitwert, scene, mood } = input;
  const { scores } = await judgeBatch({ briefing, items: [{ leitwert, scene: scene ?? "", mood }] }, tier);
  return scores[0];
};

/** Is the LLM proxy reachable? (The authoritative test of generation is an actual render.) */
export async function llmReady(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE + "/api/health");
    return res.ok;
  } catch {
    return false;
  }
}

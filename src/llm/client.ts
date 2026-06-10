import {
  batchResultSchema,
  personaSchema,
  sceneRenderSchema,
  seedListSchema,
  type Persona,
  type SceneRender,
  type WorldTerm,
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

/** Model tier — `strong` (Sonnet) for the user-facing Studio, `cheap` (Haiku) for Lab evals. */
export type Tier = "cheap" | "strong";

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

/** Is the LLM layer reachable & configured? Drives the Lab's "LLM" toggle. */
export async function llmReady(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE + "/api/health");
    if (!res.ok) return false;
    const body = (await res.json()) as { configured?: boolean };
    return Boolean(body.configured);
  } catch {
    return false;
  }
}

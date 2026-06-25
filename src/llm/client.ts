import {
  judgeBatchSchema,
  personaListSchema,
  workbenchSchema,
  type Cluster,
  type JudgeScore,
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

/** Batched: N distinct persona clusters in one call (avoids N round-trips per round). */
export const generatePersonas = (input: { briefing: string; n?: number; tier?: Tier }): Promise<Cluster[]> =>
  post("/api/persona", input, personaListSchema).then((r) => r.personas);

/**
 * Synthese (D + F married) — wide volume search gated by the strict structural-rhyme / affordance /
 * materiality filter, in one call. Returns curated candidates clustered into taste-directions.
 */
export const generateSynthese = (input: {
  briefing: string;
  n?: number;
  steer?: string;
}): Promise<Cluster[]> =>
  post("/api/synthese", input, workbenchSchema).then((r) => r.candidates);

/** Batched LLM judge — scores MANY clusters in ONE call (a structure in, scores[] out). */
export const judgeBatch = (
  input: { briefing: string; items: { leitwert: string; weltSatz: string; funde?: string[] }[] },
  tier: Tier = "cheap",
): Promise<{ scores: JudgeScore[] }> => post("/api/judge", { ...input, tier }, judgeBatchSchema);

/** Convenience: score a single cluster (a 1-item batch — keeps the eval's per-card path working). */
export const judge = async (
  input: { briefing: string; leitwert: string; weltSatz?: string; funde?: string[] },
  tier: Tier = "cheap",
): Promise<JudgeScore> => {
  const { briefing, leitwert, weltSatz, funde } = input;
  const { scores } = await judgeBatch({ briefing, items: [{ leitwert, weltSatz: weltSatz ?? "", funde: funde ?? [] }] }, tier);
  return scores[0];
};

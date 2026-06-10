import {
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

async function post<T>(path: string, body: unknown, schema: { parse(x: unknown): T }): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return schema.parse(await res.json());
}

export const renderScene = (input: {
  leitwert: string;
  worlds: string[];
  mood: string;
  note: string;
  briefing?: string;
}): Promise<SceneRender> => post("/api/render", input, sceneRenderSchema);

export const expandSeeds = (input: { briefing: string; n: number }): Promise<WorldTerm[]> =>
  post("/api/seeds", input, seedListSchema).then((r) => r.worlds);

export const generatePersona = (input: { briefing: string }): Promise<Persona> =>
  post("/api/persona", input, personaSchema);

/** Is the LLM layer reachable & configured? Drives the Lab's "LLM" toggle. */
export async function llmReady(): Promise<boolean> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return false;
    const body = (await res.json()) as { configured?: boolean };
    return Boolean(body.configured);
  } catch {
    return false;
  }
}

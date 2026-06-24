import { embedMany, gateway, generateObject, NoObjectGeneratedError } from "ai";
import type { z } from "zod";

/**
 * Vercel AI Gateway helper — modern AI SDK v5/v6 approach.
 * Model strings route through the gateway (AI_GATEWAY_API_KEY / VERCEL_OIDC_TOKEN);
 * `caching: 'auto'` adds Anthropic cache_control breakpoints; `models` are failover fallbacks.
 */

// ── Model management — one place to swap models per role ───────────────────────
export const MODELS = {
  cheap: "anthropic/claude-haiku-4.5", // classification, seed-expansion
  strong: "anthropic/claude-sonnet-4.6", // scene render, persona
  premium: "anthropic/claude-opus-4.7", // hardest renders
} as const;

/** Resolve a tier name to a model id — one place to control spend per surface. */
export const modelFor = (tier?: "cheap" | "strong" | "premium") =>
  tier === "premium" ? MODELS.premium : tier === "cheap" ? MODELS.cheap : MODELS.strong;

/** Fill {placeholders} in a YAML-sourced prompt template — keeps ALL prompt wording in the YAML. */
export const fill = (tpl: string, vars: Record<string, string | number>): string =>
  tpl.replace(/\{(\w+)\}/g, (_m, k) => (vars[k] === undefined ? "" : String(vars[k])));

/** Failover order per model (tried by the gateway if the primary fails/unavailable). */
const FALLBACKS: Record<string, string[]> = {
  [MODELS.premium]: [MODELS.strong, MODELS.cheap],
  [MODELS.strong]: [MODELS.cheap],
  [MODELS.cheap]: [MODELS.strong],
};

// ── Tiny in-instance response cache (per warm function) ────────────────────────
// Token-level savings come from gateway `caching: 'auto'`; this avoids re-billing
// identical requests within a warm instance. Swap for Vercel KV for cross-instance.
const cache = new Map<string, { at: number; value: unknown }>();
const TTL_MS = 10 * 60 * 1000;
const key = (...parts: unknown[]) => JSON.stringify(parts);

export async function genObject<T>(opts: {
  model: string;
  schema: z.ZodType<T>;
  system?: string;
  prompt: string;
  /** Bypass the in-instance cache (e.g. when you want variety per call). */
  noCache?: boolean;
  /** Hard cap on output tokens — guardrail against runaway structured output (default 8000). */
  maxOutputTokens?: number;
}): Promise<T> {
  const ck = key("object", opts.model, opts.system, opts.prompt);
  if (!opts.noCache) {
    const hit = cache.get(ck);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  }

  // Heavy structured schemas (Synthese/Persona: N candidates × 8–12 elements each) occasionally
  // return output that fails schema validation. The AI SDK does NOT retry NoObjectGeneratedError —
  // its maxRetries only covers transient transport errors — so a single flaky miss would otherwise
  // drop a whole engine lane to empty for the round. A resample almost always passes, so we re-roll
  // that ONE error class up to 2× (other errors propagate immediately). (E-094 / QS-16.)
  const run = () =>
    generateObject({
      model: opts.model,
      schema: opts.schema,
      system: opts.system,
      prompt: opts.prompt,
      maxOutputTokens: opts.maxOutputTokens ?? 8000,
      providerOptions: {
        gateway: {
          caching: "auto",
          models: FALLBACKS[opts.model] ?? [],
          sort: "cost",
        },
      },
    });
  const ATTEMPTS = 3;
  let result: Awaited<ReturnType<typeof run>>;
  for (let attempt = 1; ; attempt++) {
    try {
      result = await run();
      break;
    } catch (err) {
      if (attempt >= ATTEMPTS || !NoObjectGeneratedError.isInstance(err)) throw err;
      console.warn(`[gw] ${opts.model} schema miss — retry ${attempt}/${ATTEMPTS - 1}`);
    }
  }
  // Token visibility (shows up in Vercel runtime logs) — guards against silent overspend.
  try {
    console.log(`[gw] ${opts.model} usage=${JSON.stringify(result.usage)}`);
  } catch {
    /* ignore */
  }
  const object = result.object;

  if (!opts.noCache) cache.set(ck, { at: Date.now(), value: object });
  return object as T;
}

/** Real semantic embeddings (Engine E measures "far" with these). Auth via the gateway/OIDC. */
const EMBED_MODEL = "openai/text-embedding-3-small";
export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const { embeddings } = await embedMany({ model: gateway.textEmbeddingModel(EMBED_MODEL), values: texts });
  return embeddings;
}

/** Cosine distance (0 = identical direction … 2 = opposite). */
export function cosineDist(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? 1 - dot / (Math.sqrt(na) * Math.sqrt(nb)) : 1;
}

/** Concurrency-limited fan-out — the synchronous "batch" path through the gateway. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

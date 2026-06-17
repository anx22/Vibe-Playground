import { generateObject } from "ai";
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
}): Promise<T> {
  const ck = key("object", opts.model, opts.system, opts.prompt);
  if (!opts.noCache) {
    const hit = cache.get(ck);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  }

  const result = await generateObject({
    model: opts.model,
    schema: opts.schema,
    system: opts.system,
    prompt: opts.prompt,
    providerOptions: {
      gateway: {
        caching: "auto",
        models: FALLBACKS[opts.model] ?? [],
        sort: "cost",
      },
    },
  });
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

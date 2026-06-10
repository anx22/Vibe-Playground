import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sceneRenderSchema } from "./_lib/schema.js";
import { genObject, mapLimit, modelFor } from "./_lib/gateway.js";
import { RENDER_SYSTEM, renderPrompt, type RenderInput } from "./_lib/prompts.js";

/**
 * Batch render — concurrency-limited fan-out through the gateway (sync).
 * NOTE: this is NOT the async 50%-off Anthropic Batch API, which requires a direct
 * Anthropic key + result polling and is not exposed via the gateway. For large offline
 * Lab evals where the 50% discount matters, add a request-scoped BYOK + Anthropic Batch
 * adapter here (providerOptions.gateway.byok) — the interface below stays the same.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { jobs, concurrency, tier } = (req.body ?? {}) as {
      jobs?: RenderInput[];
      concurrency?: number;
      tier?: "cheap" | "strong";
    };
    const results = await mapLimit(jobs ?? [], concurrency ?? 5, (job) =>
      genObject({
        model: modelFor(tier),
        schema: sceneRenderSchema,
        system: RENDER_SYSTEM,
        prompt: renderPrompt(job),
      }),
    );
    return res.status(200).json({ results });
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

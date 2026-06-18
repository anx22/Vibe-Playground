import type { VercelRequest, VercelResponse } from "@vercel/node";
import { workbenchSchema } from "./_lib/schema.js";
import { fill, genObject, modelFor } from "./_lib/gateway.js";
import { SYNTHESE_BLANK, SYNTHESE_PROMPT, SYNTHESE_SYSTEM } from "./_lib/prompts.js";
import { clampN, clampStr } from "./_lib/guard.js";

/**
 * Synthese (D + F married) — F's fast WIDE volume search gated by D's STRICT filter (two worlds that
 * truly share one inner logic · ≥5 design hooks · a tangible material anchor), then spread into
 * orthogonal taste-directions. One strong-tier call. Replaces the separate entangle + workbench.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const briefing = clampStr(req.body?.briefing);
    const steer = clampStr(req.body?.steer);
    const n = clampN(req.body?.n);
    const ctx = briefing.trim() ? briefing : SYNTHESE_BLANK;
    const out = await genObject({
      model: modelFor("strong"),
      schema: workbenchSchema,
      system: SYNTHESE_SYSTEM,
      prompt: fill(SYNTHESE_PROMPT, { ctx, steer, n }),
      noCache: true,
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 120 };

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { entangleSchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { ENTANGLE_SYSTEM } from "./_lib/prompts.js";
import { clampN, clampStr, clampTier } from "./_lib/guard.js";

/**
 * Engine D — Structural Entanglement (ENGINE-D-SPEC). Distill essence → burn clichés →
 * far-but-rhyming worlds → affordance filter → bridge → ground & name. Axes banned from generation;
 * coherence comes from a single distilled essence. One strong-tier call runs the phases internally.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const briefing = clampStr(req.body?.briefing);
    const steer = clampStr(req.body?.steer);
    const n = clampN(req.body?.n);
    const tier = clampTier(req.body?.tier, false, "strong");
    const ctx = briefing.trim()
      ? briefing
      : "(blank slate — wähle diverse, weit gestreute Essenzen aus unverwandten Lebensdomänen)";
    const out = await genObject({
      model: modelFor(tier),
      schema: entangleSchema,
      system: ENTANGLE_SYSTEM,
      prompt: `Thema/Briefing: ${ctx}.${steer}\nErzeuge ${n} Brücken, jede über VERSCHIEDENE ferne Domänen.`,
      noCache: true,
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 120 };

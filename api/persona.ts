import type { VercelRequest, VercelResponse } from "@vercel/node";
import { personaListSchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { PERSONA_SYSTEM } from "./_lib/prompts.js";
import { clampN, clampStr, clampTier } from "./_lib/guard.js";

/** Batched: returns N distinct personas in ONE call (was N round-trips → the round's worst latency). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const briefing = clampStr(req.body?.briefing);
    const n = clampN(req.body?.n);
    const tier = clampTier(req.body?.tier, false, "strong");
    const out = await genObject({
      model: modelFor(tier),
      schema: personaListSchema,
      system: PERSONA_SYSTEM,
      prompt: `Briefing: ${briefing || "(blank slate)"}\nErzeuge ${n} VERSCHIEDENE Personas, aus denen je ein klarer Vibe fällt.`,
      noCache: true,
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

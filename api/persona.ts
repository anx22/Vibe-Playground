import type { VercelRequest, VercelResponse } from "@vercel/node";
import { personaSchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { PERSONA_SYSTEM } from "./_lib/prompts.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing, tier } = (req.body ?? {}) as { briefing?: string; tier?: "cheap" | "strong" };
    const out = await genObject({
      model: modelFor(tier),
      schema: personaSchema,
      system: PERSONA_SYSTEM,
      prompt: `Briefing: ${briefing || "(blank slate)"}\nErzeuge eine Persona, aus der ein klarer Vibe fällt.`,
      noCache: true, // personas should vary per call
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

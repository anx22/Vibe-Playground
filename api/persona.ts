import type { VercelRequest, VercelResponse } from "@vercel/node";
import { personaSchema } from "../src/llm/schema";
import { MODELS, genObject } from "./_lib/gateway";
import { PERSONA_SYSTEM } from "./_lib/prompts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing } = (req.body ?? {}) as { briefing?: string };
    const out = await genObject({
      model: MODELS.strong,
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

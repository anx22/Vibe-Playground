import type { VercelRequest, VercelResponse } from "@vercel/node";
import { axisVectorSchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { INTERPRET_SYSTEM } from "./_lib/prompts.js";

/** Briefing → axis vector (E-026: the LLM orchestrates the input, not a keyword lexicon). Cheap (Haiku). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing, tier } = (req.body ?? {}) as { briefing?: string; tier?: "cheap" | "strong" };
    const out = await genObject({
      model: modelFor(tier ?? "cheap"),
      schema: axisVectorSchema,
      system: INTERPRET_SYSTEM,
      prompt: `Briefing: ${briefing || "(blank slate)"}\nProjiziere es auf die 5 Achsen.`,
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 30 };

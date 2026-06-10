import type { VercelRequest, VercelResponse } from "@vercel/node";
import { seedListSchema } from "../src/llm/schema";
import { MODELS, genObject } from "./_lib/gateway";
import { SEED_SYSTEM } from "./_lib/prompts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing, n } = (req.body ?? {}) as { briefing?: string; n?: number };
    const out = await genObject({
      model: MODELS.cheap,
      schema: seedListSchema,
      system: SEED_SYSTEM,
      prompt: `Briefing: ${briefing || "(blank slate)"}\nErzeuge ${n ?? 14} Welten mit term, connotation und vector.`,
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

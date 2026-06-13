import type { VercelRequest, VercelResponse } from "@vercel/node";
import { seedGenSchema } from "./_lib/schema.js";
import { MODELS, embed, genObject } from "./_lib/gateway.js";
import { SEED_SYSTEM } from "./_lib/prompts.js";

/**
 * Engine B seed-expansion with REAL embeddings:
 *  1. an LLM invents fresh world-terms (+ a 5-axis projection for the visuals),
 *  2. each term is embedded into a high-dimensional semantic space,
 *  3. the mix selects collisions by *semantic* (cosine) distance, not the 5 hand-axes.
 * If embedding is rate-limited/unavailable, worlds come back axis-only (graceful fallback).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing, n } = (req.body ?? {}) as { briefing?: string; n?: number };
    const gen = await genObject({
      model: MODELS.cheap,
      schema: seedGenSchema,
      system: SEED_SYSTEM,
      prompt: `Briefing: ${briefing || "(blank slate)"}\nErzeuge ${n ?? 14} Welten mit term, connotation und vector.`,
    });

    let embeddings: number[][] = [];
    try {
      embeddings = await embed(gen.worlds.map((w) => `${w.term} — ${w.connotation}`));
    } catch (e) {
      console.log("[seeds] embed unavailable, axis-only fallback:", String(e));
    }

    const worlds = gen.worlds.map((w, i) => ({ ...w, embedding: embeddings[i] }));
    return res.status(200).json({ worlds });
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

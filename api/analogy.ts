import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analogySchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { ANALOGY_SYSTEM } from "./_lib/prompts.js";

/**
 * The Analogy Engine — the new core (replaces axis-collision generation).
 * Brief → functional core → a DISTANT domain that embodies the same core → Leitwert.
 * On-target (identical function) and surprising (far surface) are decoupled, so both are maxed.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing, n, tier } = (req.body ?? {}) as {
      briefing?: string;
      n?: number;
      tier?: "cheap" | "strong" | "premium";
    };
    const out = await genObject({
      model: modelFor(tier ?? "strong"),
      schema: analogySchema,
      system: ANALOGY_SYSTEM,
      prompt: `Briefing: ${briefing || "(blank slate — wähle selbst ein starkes Profil)"}\nErzeuge ${n ?? 5} Richtungen, jede über eine ANDERE ferne Domäne.`,
      noCache: true, // creative variety per round
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { workbenchSchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { WORKBENCH_SYSTEM } from "./_lib/prompts.js";

/**
 * Engine F — Technique Workbench (ENGINE-F-SPEC). The fast, pure-prompt engine: Volume → Filter →
 * Curation in one strong-tier call. Over-generates internally, eliminates ≥⅔, returns the curated
 * survivors clustered into 3–4 orthogonal taste-directions. No embeddings, no infra — the speed path.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing, n, steer } = (req.body ?? {}) as { briefing?: string; n?: number; steer?: string };
    const ctx = briefing?.trim()
      ? briefing
      : "(blank slate — wähle ein starkes Strategie-Profil und ein weit gestreutes Feld selbst)";
    const out = await genObject({
      model: modelFor("strong"),
      schema: workbenchSchema,
      system: WORKBENCH_SYSTEM,
      prompt:
        `Briefing: ${ctx}.${steer ?? ""}\n` +
        `Über-generiere intern (≥3×), eliminiere ≥⅔, und gib ${n ?? 6} kuratierte Kandidaten über ` +
        `3–4 orthogonale Geschmacksrichtungen zurück.`,
      noCache: true,
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

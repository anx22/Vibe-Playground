import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bridgesSchema, divergeSchema } from "./_lib/schema.js";
import { cosineDist, embed, genObject, modelFor } from "./_lib/gateway.js";
import { LATENT_COMPOSE_SYSTEM, LATENT_DIVERGE_SYSTEM } from "./_lib/prompts.js";
import { clampN, clampStr } from "./_lib/guard.js";

/**
 * Engine E — Latent Agent (ENGINE-E-SPEC, Tier-0). The honest split: the LLM makes the analogical
 * leap, real embeddings MEASURE "far". One round (K=1), in-request (no external corpus/pgvector yet):
 *  1. Diverger: essence + burnt clichés + a wide field of far donor worlds.
 *  2. Embed essence + donors → keep the upper distance percentile (relative, not an absolute band).
 *  3. Resonator/Composer: from the measured-far shortlist, keep only structural rhymes → bridges.
 * Tier-1 (corpus, multi-generation QD/MAP-Elites archive, cross-session novelty) is deferred.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const briefing = clampStr(req.body?.briefing);
    const steer = clampStr(req.body?.steer);
    const n = clampN(req.body?.n);
    const ctx = briefing.trim()
      ? briefing
      : "(blank slate — wähle diverse, weit gestreute Essenzen aus unverwandten Lebensdomänen)";

    // Phase 1 — Diverger (strong): essence + clichés + wide far donor field.
    const diverge = await genObject({
      model: modelFor("strong"),
      schema: divergeSchema,
      system: LATENT_DIVERGE_SYSTEM,
      prompt: `Thema/Briefing: ${ctx}.${steer}\nLiefere essence, forbidden[] und 14 weit gestreute Spender-Welten.`,
      noCache: true,
    });

    // Phase 2 — measure "far" honestly: rank donors by embedding distance to the essence,
    // keep the upper percentile (relative to the actual distribution; avoids absolute-threshold trap).
    let shortlist = diverge.donors;
    if (diverge.donors.length > 3) {
      try {
        const vecs = await embed([diverge.essence, ...diverge.donors.map((d) => `${d.world} — ${d.gist}`)]);
        const ess = vecs[0];
        const scored = diverge.donors
          .map((d, i) => ({ d, dist: cosineDist(ess, vecs[i + 1]) }))
          .filter((s) => Number.isFinite(s.dist))
          .sort((a, b) => b.dist - a.dist); // farthest first
        // Keep the far ~55% by RANK (robust to tied distances), never fewer than 4.
        const keep = Math.max(4, Math.round(scored.length * 0.55));
        if (scored.length) shortlist = scored.slice(0, keep).map((s) => s.d);
      } catch (e) {
        // embeddings unavailable → fall back to the full donor field (the "measure far" stage is a no-op)
        console.log("[latent] embed unavailable, using full donor field:", String(e));
      }
    }

    // Phase 3 — Resonator + Composer + Namer (strong): rhyme filter → bridges.
    const composed = await genObject({
      model: modelFor("strong"),
      schema: bridgesSchema,
      system: LATENT_COMPOSE_SYSTEM,
      prompt:
        `ESSENZ: ${diverge.essence}\nVERBOTEN: ${diverge.forbidden.join(", ")}\n` +
        `Gemessen-FERNE Spender-Welten:\n${shortlist.map((d) => `- ${d.world}: ${d.gist}`).join("\n")}\n` +
        `Komponiere ${n} Brücken über VERSCHIEDENE Verhaltens-Zellen.`,
      noCache: true,
    });
    return res.status(200).json({
      essence: diverge.essence,
      forbidden: diverge.forbidden,
      bridges: composed.bridges,
    });
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 90 };

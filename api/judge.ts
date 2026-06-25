import type { VercelRequest, VercelResponse } from "@vercel/node";
import { judgeBatchSchema } from "./_lib/schema.js";
import { fill, genObject, modelFor } from "./_lib/gateway.js";
import { JUDGE_BLANK, JUDGE_PROMPT, JUDGE_SYSTEM } from "./_lib/prompts.js";
import { clampStr, clampTier } from "./_lib/guard.js";

/**
 * Quality judge — scores MANY directions in ONE call (the whole batch in a single structure, scores[]
 * out, aligned to input order). Falls back to a 1-item batch for a single {leitwert,weltSatz} body,
 * so older callers keep working. Judging N cards used to be N billed calls; now it is one.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const briefing = clampStr(req.body?.briefing);
    // Premium allowed here: judge outputs are tiny and the headless eval grades on Opus.
    const tier = clampTier(req.body?.tier, true, "cheap");
    const raw: unknown = Array.isArray(req.body?.items) ? req.body.items : [req.body];
    const items = (raw as Array<Record<string, unknown>>).slice(0, 64).map((it) => ({
      leitwert: clampStr(it?.leitwert, 200),
      weltSatz: clampStr(it?.weltSatz, 600),
      funde: Array.isArray(it?.funde)
        ? (it.funde as unknown[]).slice(0, 8).map((x) => clampStr(x, 120)).join(" · ")
        : clampStr(it?.funde, 600),
    }));
    const list = items
      .map((it, i) => `${i + 1}. Leitwert «${it.leitwert}» — Welt: ${it.weltSatz || "—"} — Funde: ${it.funde || "—"}`)
      .join("\n");
    const out = await genObject({
      model: modelFor(tier),
      schema: judgeBatchSchema,
      system: JUDGE_SYSTEM,
      prompt: fill(JUDGE_PROMPT, { briefing: briefing || JUDGE_BLANK, count: items.length, list }),
      // Strict measurement: never serve a cached score for the premium judge run.
      noCache: tier === "premium",
      // Scores are tiny; cap tight to bound the batch.
      maxOutputTokens: 256 + items.length * 140,
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

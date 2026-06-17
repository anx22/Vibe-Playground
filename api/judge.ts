import type { VercelRequest, VercelResponse } from "@vercel/node";
import { judgeSchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { JUDGE_SYSTEM } from "./_lib/prompts.js";

/** Quality judge: scores one direction against the briefing (eval fitness function). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { briefing, leitwert, scene, mood, tier } = (req.body ?? {}) as {
      briefing?: string;
      leitwert?: string;
      scene?: string;
      mood?: string;
      tier?: "cheap" | "strong" | "premium";
    };
    const out = await genObject({
      model: modelFor(tier ?? "cheap"),
      schema: judgeSchema,
      system: JUDGE_SYSTEM,
      prompt:
        `Briefing: ${briefing || "(blank slate)"}\n` +
        `Leitwert: ${leitwert}\nSzene: ${scene ?? "—"}\nMood: ${mood ?? "—"}\nBewerte.`,
      // Strict measurement: never serve a cached score for the premium judge run.
      noCache: tier === "premium",
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

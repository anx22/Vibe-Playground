import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sceneRenderSchema } from "./_lib/schema.js";
import { genObject, modelFor } from "./_lib/gateway.js";
import { RENDER_SYSTEM, renderPrompt, type RenderInput } from "./_lib/prompts.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const input = req.body as RenderInput & { tier?: "cheap" | "strong" };
    const out = await genObject({
      model: modelFor(input.tier),
      schema: sceneRenderSchema,
      system: RENDER_SYSTEM,
      prompt: renderPrompt(input),
    });
    return res.status(200).json(out);
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
}

export const config = { maxDuration: 60 };

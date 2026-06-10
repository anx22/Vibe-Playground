import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sceneRenderSchema } from "../src/llm/schema";
import { MODELS, genObject } from "./_lib/gateway";
import { RENDER_SYSTEM, renderPrompt, type RenderInput } from "./_lib/prompts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const input = req.body as RenderInput;
    const out = await genObject({
      model: MODELS.strong,
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

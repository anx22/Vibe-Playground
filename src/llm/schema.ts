import { z } from "zod";

/** Shared LLM contracts — one source of truth for the proxy (api/) and the client (src/). */

export const axisVectorSchema = z.object({
  material: z.number().min(-1).max(1),
  energy: z.number().min(-1).max(1),
  time: z.number().min(-1).max(1),
  structure: z.number().min(-1).max(1),
  density: z.number().min(-1).max(1),
  formality: z.number().min(-1).max(1),
});

/** The LLM render: structure proposes a skeleton, the LLM renders the evocative vibe (E-028). */
export const sceneRenderSchema = z.object({
  leitwert: z.string().describe("2–3 word compound Leitwert — the compressed world-reference"),
  scene: z
    .string()
    .describe("one evocative sentence: a small inhabited world or persona that embodies the collision"),
  mood: z.string().describe("short mood modifier, 2–4 words"),
});
export type SceneRender = z.infer<typeof sceneRenderSchema>;

export const batchResultSchema = z.object({ results: z.array(sceneRenderSchema) });

/** Engine B seed-expansion: fresh world-terms projected onto the 5 axes (no hand-curated pool). */
export const worldTermSchema = z.object({
  term: z.string(),
  connotation: z.string(),
  vector: axisVectorSchema,
  /** High-dimensional semantic embedding (Engine B metric); absent if embedding was unavailable. */
  embedding: z.array(z.number()).optional(),
});
export const seedListSchema = z.object({ worlds: z.array(worldTermSchema) });
export type WorldTerm = z.infer<typeof worldTermSchema>;

/** Engine C: a fictional source whose aesthetic falls out as a coherent vibe. */
export const personaSchema = z.object({
  persona: z.string().describe("a fictional source: person/studio/workshop in one sentence, with a Macke"),
  leitwert: z.string(),
  mood: z.string(),
  vector: axisVectorSchema,
});
export type Persona = z.infer<typeof personaSchema>;

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

/** Persona: a fictional source whose aesthetic falls out as a coherent vibe (kept building block). */
export const personaSchema = z.object({
  persona: z.string().describe("a fictional source: person/studio/workshop in one sentence, with a Macke"),
  leitwert: z.string(),
  mood: z.string(),
  vector: axisVectorSchema,
});
export type Persona = z.infer<typeof personaSchema>;
export const personaListSchema = z.object({ personas: z.array(personaSchema) });

/** Engine D — Structural Entanglement. A bridge = essence ↔ N far-but-rhyming worlds + object. */
export const bridgeSchema = z.object({
  leitwert: z.string(),
  worlds: z.array(z.object({ name: z.string(), role: z.string(), rhyme: z.string() })),
  objectMetaphor: z.string(),
  creativeDerivation: z.string(),
  mood: z.string(),
  palette: z.array(z.string()),
  domainDistance: z.string(),
  affordances: z.array(z.string()),
});
export const entangleSchema = z.object({
  essence: z.string(),
  forbidden: z.array(z.string()),
  bridges: z.array(bridgeSchema),
});
export type Bridge = z.infer<typeof bridgeSchema>;
export type Entangle = z.infer<typeof entangleSchema>;

/** Engine F — Technique Workbench: a bridge plus its taste-direction + pots used. */
export const workbenchCandidateSchema = bridgeSchema.extend({
  tasteDirection: z.string(),
  operators: z.array(z.string()),
  comfortRating: z.string(),
});
export const workbenchSchema = z.object({ candidates: z.array(workbenchCandidateSchema) });
export type WorkbenchCandidate = z.infer<typeof workbenchCandidateSchema>;

/** Quality judgement: on-target × surprise × craft (would a senior AD pitch it to THIS client?). */
export const judgeSchema = z.object({
  onTarget: z.number().min(1).max(5),
  surprise: z.number().min(1).max(5),
  craft: z.number().min(1).max(5),
  designValue: z.number().min(1).max(5),
  register: z.string(),
  note: z.string(),
});
export type JudgeScore = z.infer<typeof judgeSchema>;

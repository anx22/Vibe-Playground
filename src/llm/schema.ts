import { z } from "zod";

/** Shared LLM contracts — one source of truth for the proxy (api/) and the client (src/). */

/**
 * One result = an open "Denkanstoß-Cluster": a vivid world-opener + anchor + loose triggers
 * (metaphors, material/texture words, verbal image-comparisons). NO pre-designing — this raw
 * world-material feeds a downstream design/image AI. `register` marks the near/far mix the engine
 * spreads across each batch (internal — surfaced as a felt mix, never as a label).
 */
export const clusterSchema = z.object({
  weltSatz: z.string(),
  leitwert: z.string(),
  register: z.enum(["nah", "fern"]),
  funde: z.array(z.string()),
  materialien: z.array(z.string()),
  bildReferenzen: z.array(z.string()),
});
export type Cluster = z.infer<typeof clusterSchema>;

/** Persona engine — N clusters in one call. */
export const personaListSchema = z.object({ personas: z.array(clusterSchema) });
/** Synthese engine — N clusters in one call. */
export const workbenchSchema = z.object({ candidates: z.array(clusterSchema) });

/** Quality judgement: on-target × surprise × craft × formSubstanz (would a senior AD pitch it to THIS client?). */
export const judgeSchema = z.object({
  onTarget: z.number().min(1).max(5),
  surprise: z.number().min(1).max(5),
  craft: z.number().min(1).max(5),
  formSubstanz: z.number().min(1).max(5).optional(),
  note: z.string(),
});
export type JudgeScore = z.infer<typeof judgeSchema>;

/** Batched judge — N scores in one call, aligned to input order. */
export const judgeBatchSchema = z.object({ scores: z.array(judgeSchema) });

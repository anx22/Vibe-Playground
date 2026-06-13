import { WORLDS } from "../engine/pools";
import { expandSeeds } from "../llm/client";
import type { WorldSource } from "./method";

/** Engine A's world supply — curated, finite, offline. */
export const curatedSource: WorldSource = {
  id: "curated",
  label: "Kuratierte Pools (A)",
  requiresLLM: false,
  candidates: () => WORLDS,
};

/** Engine B's world supply — LLM invents fresh world-terms projected onto the axes (E-026). */
export const llmSeedSource: WorldSource = {
  id: "llm-seed",
  label: "LLM Seed-Expansion (B)",
  requiresLLM: true,
  async candidates(ctx) {
    const seeds = await expandSeeds({ briefing: ctx.briefing ?? "", n: 14, tier: ctx.tier });
    return seeds.map((s) => ({ name: s.term, vector: s.vector, embedding: s.embedding }));
  },
};

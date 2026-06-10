import { WORLDS } from "../engine/pools";
import type { WorldSource } from "./method";

/** Engine A's world supply — curated, finite, offline. */
export const curatedSource: WorldSource = {
  id: "curated",
  label: "Kuratierte Pools (A)",
  requiresLLM: false,
  candidates: () => WORLDS,
};

/** Engine B's world supply — LLM invents hundreds of fresh world-terms (needs key). */
export const llmSeedSource: WorldSource = {
  id: "llm-seed",
  label: "LLM Seed-Expansion (B)",
  requiresLLM: true,
  candidates: () => [],
};

/** Engine C's world supply — a persona, whose aesthetic falls out as a world (needs key). */
export const personaSource: WorldSource = {
  id: "persona",
  label: "Persona → Welt (C)",
  requiresLLM: true,
  candidates: () => [],
};

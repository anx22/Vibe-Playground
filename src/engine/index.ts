export * from "./types";
export * from "./axes";
export { engineA } from "./engineA";
export { LEXICON } from "./pools";

import type { Engine } from "./types";
import { engineA } from "./engineA";

/** Engine registry. B/C plug in here later without touching the Studio (E-004). */
export const ENGINES: Record<Engine["id"], Engine> = {
  A: engineA,
  // B: engineB,  // Latent-Space (simulated → real embeddings later)
  // C: engineC,  // Author (persona-driven)
} as Record<Engine["id"], Engine>;

/** Simple-mode "Auto" lens resolves to A in the MVP (E-017). */
export const autoEngine = engineA;

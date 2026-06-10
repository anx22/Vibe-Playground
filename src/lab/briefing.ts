import { AXES, clamp, zero, LEXICON } from "../engine";
import type { AxisVector } from "../engine";

/**
 * Offline stand-in for the real input path (E-026: briefing → LLM orchestration).
 * Here a tiny keyword scan biases the centroid so the harness runs without a key.
 * Replace with the LLM orchestrator once the proxy is wired — this is a test fixture,
 * NOT the product mechanism.
 */
export function biasFromBriefing(text: string): AxisVector {
  const v = zero();
  const t = text.toLowerCase();
  for (const key of Object.keys(LEXICON)) {
    if (!t.includes(key)) continue;
    const bias = LEXICON[key];
    for (const ax of AXES) {
      const b = bias[ax];
      if (b !== undefined) v[ax] = clamp(v[ax] + b);
    }
  }
  return v;
}

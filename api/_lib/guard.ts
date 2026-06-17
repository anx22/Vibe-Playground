/**
 * Input guard for the public LLM endpoints (E-052). The functions are unauthenticated, so bound
 * the cost-amplification vectors: clamp `n`, cap free-text length, and never let a browser client
 * force the premium (Opus) model on a generation endpoint. Premium stays reachable only where it's
 * cheap and needed (the judge), via `allowPremium`.
 */
export type Tier = "cheap" | "strong" | "premium";

const MAX_TEXT = 2000;

export const clampStr = (x: unknown, max = MAX_TEXT): string =>
  typeof x === "string" ? x.slice(0, max) : "";

export const clampN = (x: unknown, lo = 1, hi = 8, def = 6): number => {
  const v = typeof x === "number" && Number.isFinite(x) ? Math.floor(x) : def;
  return Math.max(lo, Math.min(v, hi));
};

export const clampTier = (x: unknown, allowPremium: boolean, def: Tier): Tier => {
  const allowed: Tier[] = allowPremium ? ["cheap", "strong", "premium"] : ["cheap", "strong"];
  return (allowed as string[]).includes(x as string) ? (x as Tier) : def;
};

import type { VibeCard } from "../engine";
import { judgeBatch, type Tier } from "./client";
import type { JudgeScore } from "./schema";

/**
 * Judge-select (E-041) — the production fitness step the eval proved is the real
 * quality lever. Structure proposes many candidates, the LLM renders them, and the
 * cheap judge scores each one; we return them best-first with the score attached.
 *
 * Why this and not more mixing math: the eval showed the mixing algorithm barely
 * moves quality (Persona, which has no world-mix, scored highest), while the LLM
 * write-step plus selection is what separates a 3.1 from a 4.3. So we stop tuning
 * the mixer and instead generate a few extra, then keep the strongest.
 *
 * Judges run in parallel (independent, cheap), so this adds ~one judge round-trip,
 * not one per card. Degrades to the original order if the judge is unreachable.
 */
export async function judgeRank(
  cards: VibeCard[],
  briefing: string,
  tier: Tier = "cheap",
): Promise<VibeCard[]> {
  // ONE call scores the whole batch (a structure in, scores[] out) — not one billed call per card.
  let scores: (JudgeScore | undefined)[] = [];
  try {
    const r = await judgeBatch(
      { briefing, items: cards.map((c) => ({ leitwert: c.leitwert, weltSatz: c.weltSatz, funde: c.funde })) },
      tier,
    );
    scores = r.scores;
  } catch {
    scores = []; // judge unreachable → all unscored → show-all, never blocks the loop
  }
  const scored = cards.map((c, i): VibeCard => {
    const s = scores[i];
    if (!s) return c; // unscored — never gated out, but sinks to the bottom
    const axes = [s.onTarget, s.surprise, s.craft, s.formSubstanz].filter((x): x is number => typeof x === "number");
    const overall = axes.reduce((a, b) => a + b, 0) / axes.length; // holistic readout (display/eval)
    return { ...c, quality: { ...s, overall } };
  });
  // Gate-then-rank (QS-3 #5): the two non-negotiables (onTarget, formSubstanz) gate first; among the
  // survivors, surprise+craft are the PURE rank axes (overall only breaks ties). A gate-failer sinks
  // below every passer no matter how surprising/crafted it is.
  return scored.sort((a, b) => {
    const ga = passesGate(a) ? 1 : 0, gb = passesGate(b) ? 1 : 0;
    if (ga !== gb) return gb - ga;
    const ra = rankScore(a), rb = rankScore(b);
    if (rb !== ra) return rb - ra;
    return (b.quality?.overall ?? -1) - (a.quality?.overall ?? -1);
  });
}

/**
 * The two non-negotiable GATE axes must each clear this (QS-3 #5). Scores are 1–5; 3 = mittelmäßig in
 * the rubric, so GATE=3 culls only the clear fails (formSubstanz 1–2 = design-empty, onTarget 1–2 =
 * off-brief) while keeping competent-or-better. Tunable upward (3.5/4) if an eval shows mediocrity slipping.
 */
export const GATE = 3;

/** Rank score among gate survivors — surprise+craft are the PURE rank axes (#5); the gate axes don't re-rank. */
function rankScore(c: VibeCard): number {
  const q = c.quality;
  if (!q) return -1;
  return (q.surprise + q.craft) / 2;
}

/**
 * The quality GATE (QS-3 #5, replaces the old mean-floor): a card reaches the board only if it clears
 * BOTH non-negotiables — formSubstanz (drawable) AND onTarget (apt). A design-empty or off-brief cluster
 * fails no matter how surprising/crafted, closing the "high surprise compensates for low substance" leak.
 * An UNSCORED card (judge unreachable) is NEVER gated out, so a judge outage degrades to "show
 * everything" — never to an empty board.
 */
export const passesGate = (c: VibeCard): boolean =>
  c.quality === undefined || (c.quality.onTarget >= GATE && c.quality.formSubstanz >= GATE);

/**
 * Mix-aware ordering (QS-2 · round 5). Each cluster is marked "nah" (premium, in the brief's own
 * world) or "fern" (surprising collision). Given judge-ranked cards (best-first), interleave the two
 * registers so the visible field ALTERNATES between them — the user FEELS the premium↔far mix without
 * any label. The single best card keeps position #1; only the tail is re-threaded. Pure, order-only.
 */
export function spreadByMix(cards: VibeCard[]): VibeCard[] {
  const groups = new Map<string, VibeCard[]>();
  const order: string[] = [];
  for (const c of cards) {
    const k = c.register;
    if (!groups.has(k)) {
      groups.set(k, []);
      order.push(k);
    }
    groups.get(k)!.push(c);
  }
  const out: VibeCard[] = [];
  for (let more = true; more; ) {
    more = false;
    for (const k of order) {
      const g = groups.get(k)!;
      if (g.length) {
        out.push(g.shift()!);
        more = true;
      }
    }
  }
  return out;
}

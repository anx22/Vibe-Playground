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
    if (!s) return c; // unscored — sinks to the bottom
    const axes = [s.onTarget, s.surprise, s.craft, s.formSubstanz].filter((x): x is number => typeof x === "number");
    const overall = axes.reduce((a, b) => a + b, 0) / axes.length;
    return { ...c, quality: { ...s, overall } };
  });
  return scored.sort((a, b) => (b.quality?.overall ?? -1) - (a.quality?.overall ?? -1));
}

/**
 * The quality floor (E-063): a card must clear this mean score to reach the board — this is where the
 * north-star fail-conditions get enforced (no bullshit · no story-instead-of-design-value · nothing
 * you can't derive a design-world from). Below it the cluster regenerates once rather than surfacing
 * "best of bad". 3 = mittelmäßig in the rubric, so a floor above 3 means "better than mediocre". Tunable.
 *
 * An UNSCORED card (judge unreachable) is NOT floored out, so a judge outage degrades to
 * "show everything" — never to an empty board.
 */
export const QUALITY_FLOOR = 3.3;
export const passesFloor = (c: VibeCard): boolean =>
  c.quality === undefined || c.quality.overall >= QUALITY_FLOOR;

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

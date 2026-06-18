import type { VibeCard } from "../engine";
import { judge, type Tier } from "./client";

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
  const scored = await Promise.all(
    cards.map(async (c): Promise<VibeCard> => {
      try {
        const s = await judge(
          { briefing, leitwert: c.leitwert, scene: c.scene, mood: c.mood },
          tier,
        );
        const axes = [s.onTarget, s.surprise, s.craft, s.designValue].filter((x): x is number => typeof x === "number");
        const overall = axes.reduce((a, b) => a + b, 0) / axes.length;
        return { ...c, quality: { ...s, overall } };
      } catch {
        return c; // unscored — sinks to the bottom, never blocks the loop
      }
    }),
  );
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
 * Register-aware ordering (E-065 · C8). Given judge-ranked cards (best-first), re-thread them so the
 * FRONT of the list cycles through DISTINCT render/material registers — best-of-each-register first,
 * then the next tier — so the top-N the board shows spans material feels instead of collapsing into
 * one. The single best card keeps position #1; only the tail is diversified. Pure, order-only;
 * unscored/unlabeled cards keep a stable trailing position (they never pose as one shared register).
 */
export function spreadByRegister(cards: VibeCard[]): VibeCard[] {
  const key = (c: VibeCard) => (c.quality?.register ?? "").trim().toLowerCase();
  const groups = new Map<string, VibeCard[]>();
  const order: string[] = [];
  for (const c of cards) {
    const k = key(c);
    if (!groups.has(k)) {
      groups.set(k, []);
      order.push(k);
    }
    groups.get(k)!.push(c);
  }
  const labeled = order.filter((k) => k !== "");
  const out: VibeCard[] = [];
  for (let more = true; more; ) {
    more = false;
    for (const k of labeled) {
      const g = groups.get(k)!;
      if (g.length) {
        out.push(g.shift()!);
        more = true;
      }
    }
  }
  for (const c of groups.get("") ?? []) out.push(c);
  return out;
}

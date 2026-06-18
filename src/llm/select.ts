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
        const overall = (s.onTarget + s.surprise + s.craft + s.renderability) / 4;
        return { ...c, quality: { ...s, overall } };
      } catch {
        return c; // unscored — sinks to the bottom, never blocks the loop
      }
    }),
  );
  return scored.sort((a, b) => (b.quality?.overall ?? -1) - (a.quality?.overall ?? -1));
}

/**
 * The quality floor (E-063): a card must clear this mean score to reach the board — otherwise the
 * cluster regenerates once rather than surfacing "best of bad". The judge rubric calls 3 = mittelmäßig,
 * so a floor above 3 means "better than mediocre". Tunable.
 *
 * An UNSCORED card (judge unreachable) is NOT floored out, so a judge outage degrades to
 * "show everything" — never to an empty board.
 */
export const QUALITY_FLOOR = 3.3;
export const passesFloor = (c: VibeCard): boolean =>
  c.quality === undefined || c.quality.overall >= QUALITY_FLOOR;

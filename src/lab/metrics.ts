import { dist } from "../engine";
import type { AxisVector, VibeCard } from "../engine";

export interface Metrics {
  count: number;
  /** Fraction of cards whose bridge holds (0..1). */
  coherence: number;
  /** Mean pairwise distance within the batch (spread). */
  diversity: number;
  /** Mean nearest-distance to a reference set (1 if no reference). */
  novelty: number;
}

export const coherence = (cards: VibeCard[]): number =>
  cards.length ? cards.filter((c) => c.coherence.ok).length / cards.length : 0;

export function diversity(cards: VibeCard[]): number {
  if (cards.length < 2) return 0;
  let sum = 0;
  let n = 0;
  for (let i = 0; i < cards.length; i++)
    for (let j = i + 1; j < cards.length; j++) {
      sum += dist(cards[i].vector, cards[j].vector);
      n++;
    }
  return sum / n;
}

export function novelty(vectors: AxisVector[], reference: AxisVector[]): number {
  if (!reference.length || !vectors.length) return 1;
  let sum = 0;
  for (const v of vectors) {
    let m = Infinity;
    for (const r of reference) m = Math.min(m, dist(v, r));
    sum += m;
  }
  return sum / vectors.length;
}

export function metricsFor(cards: VibeCard[], reference: AxisVector[] = []): Metrics {
  return {
    count: cards.length,
    coherence: coherence(cards),
    diversity: diversity(cards),
    novelty: novelty(cards.map((c) => c.vector), reference),
  };
}

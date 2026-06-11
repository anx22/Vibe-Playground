import type { AxisVector, Engine, VibeCard } from "./types";
import { AXES, POLES, clamp, dist, mid, sharedSigns, zero } from "./axes";
import { OBJECTS, WORLDS, World } from "./pools";
import { moodFor, paletteFor, typoFor } from "./derive";

function jitter(centroid: AxisVector, spread: number, rng: () => number): AxisVector {
  const o = zero();
  for (const ax of AXES) o[ax] = clamp(centroid[ax] + (rng() * 2 - 1) * spread);
  return o;
}

function nearestWorld(target: AxisVector): World {
  return WORLDS.reduce((best, w) => (dist(w.vector, target) < dist(best.vector, target) ? w : best));
}

/** Pick from the top-K farthest intrusions that share a bridge — variety, not always the farthest. */
function pickIntrusion(home: World, rng: () => number): World | null {
  const cands = WORLDS.filter(
    (w) => w.name !== home.name && sharedSigns(home.vector, w.vector).length >= 1,
  );
  if (!cands.length) return null;
  cands.sort((a, b) => dist(b.vector, home.vector) - dist(a.vector, home.vector));
  const top = cands.slice(0, Math.min(3, cands.length));
  return top[Math.floor(rng() * top.length)];
}

/** Pick from the nearest-K objects — avoids the same object metaphor every time. */
function pickObject(target: AxisVector, rng: () => number): { name: string } {
  const sorted = [...OBJECTS].sort((a, b) => dist(a.vector, target) - dist(b.vector, target));
  const top = sorted.slice(0, Math.min(3, sorted.length));
  return top[Math.floor(rng() * top.length)];
}

/**
 * Engine A · Grammar — curated pools + bridge rule (E-003), with a novelty filter so a
 * batch doesn't collapse onto near-duplicate vectors (raises uniqueness; see Lab scorecard).
 * Deterministic given centroid, params and rng — the Lab can reproduce batches.
 */
export const engineA: Engine = {
  id: "A",
  label: "Grammar",
  generate(centroid, params, rng) {
    const cards: VibeCard[] = [];
    const accepted: AxisVector[] = [];
    const used = new Set<string>();
    const maxGuard = params.batchSize * 24;
    let guard = 0;
    while (cards.length < params.batchSize && guard++ < maxGuard) {
      const target = jitter(centroid, params.spread, rng);
      const home = nearestWorld(target);
      const intrusion = pickIntrusion(home, rng);
      if (!intrusion) continue;
      const vector = mid(home.vector, intrusion.vector);

      // Novelty: reject near-duplicates while we still have room to retry.
      const noveltyOn = guard < params.batchSize * 12;
      if (noveltyOn && accepted.some((v) => dist(v, vector) < 0.5)) continue;

      const object = pickObject(vector, rng);
      const leitwert = `${home.name}-${intrusion.name}-${object.name}`;
      if (used.has(leitwert)) continue;
      used.add(leitwert);

      const shared = sharedSigns(home.vector, intrusion.vector);
      const bridge =
        shared.map((s) => POLES[s][vector[s] > 0 ? "pos" : "neg"]).join(" · ") || "—";
      cards.push({
        id: `${leitwert}-${Math.floor(rng() * 1e6)}`,
        leitwert,
        mood: moodFor(vector),
        typography: typoFor(vector, rng),
        palette: paletteFor(vector),
        vector,
        coherence: { sharedAxes: shared, ok: shared.length >= 1 },
        origin: {
          home: home.name,
          intrusion: intrusion.name,
          object: object.name,
          engineNote: `Brücke über ${bridge}`,
        },
      });
      accepted.push(vector);
    }
    return cards;
  },
};

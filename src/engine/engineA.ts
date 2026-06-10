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
  return WORLDS.reduce((best, w) =>
    dist(w.vector, target) < dist(best.vector, target) ? w : best,
  );
}

/** Intrusion = a world that shares ≥1 axis sign (bridge) but sits as far as possible (tension). */
function bestIntrusion(home: World, rng: () => number): World | null {
  const candidates = WORLDS.filter(
    (w) => w.name !== home.name && sharedSigns(home.vector, w.vector).length >= 1,
  );
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) =>
      dist(b.vector, home.vector) + rng() * 0.05 -
      dist(a.vector, home.vector),
  );
  return candidates[0];
}

function nearestObject(target: AxisVector): { name: string } {
  return OBJECTS.reduce((best, o) =>
    dist(o.vector, target) < dist(best.vector, target) ? o : best,
  );
}

/**
 * Engine A · Grammar — curated pools + bridge rule (E-003).
 * Deterministic given centroid, params and rng — so the Lab can reproduce batches.
 */
export const engineA: Engine = {
  id: "A",
  label: "Grammar",
  generate(centroid, params, rng) {
    const cards: VibeCard[] = [];
    const used = new Set<string>();
    let guard = 0;
    while (cards.length < params.batchSize && guard++ < params.batchSize * 16) {
      const target = jitter(centroid, params.spread, rng);
      const home = nearestWorld(target);
      const intrusion = bestIntrusion(home, rng);
      if (!intrusion) continue;
      const vector = mid(home.vector, intrusion.vector);
      const object = nearestObject(vector);
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
    }
    return cards;
  },
};

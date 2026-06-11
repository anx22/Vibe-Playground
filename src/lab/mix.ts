import { AXES, clamp, dist, mid, sharedSigns, zero } from "../engine";
import type { AxisVector } from "../engine";
import type { World } from "../engine/pools";
import type { MixStrategy } from "./method";

function jitter(c: AxisVector, spread: number, rng: () => number): AxisVector {
  const o = zero();
  for (const ax of AXES) o[ax] = clamp(c[ax] + (rng() * 2 - 1) * spread);
  return o;
}

function nearest(pool: World[], target: AxisVector): World {
  return pool.reduce((best, w) => (dist(w.vector, target) < dist(best.vector, target) ? w : best));
}

/** A · Bridge-rule: home + the farthest intrusion that shares ≥1 axis sign. */
export const bridgeMix: MixStrategy = {
  id: "bridge",
  label: "Bridge-Regel (A)",
  arity: 2,
  mix(pool, ctx) {
    const home = nearest(pool, jitter(ctx.centroid, ctx.spread, ctx.rng));
    const cands = pool.filter(
      (w) => w.name !== home.name && sharedSigns(home.vector, w.vector).length >= 1,
    );
    if (!cands.length) return null;
    cands.sort((a, b) => dist(b.vector, home.vector) - dist(a.vector, home.vector));
    const intr = cands[Math.min(cands.length - 1, Math.floor(ctx.rng() * 3))];
    const shared = sharedSigns(home.vector, intr.vector);
    return {
      worlds: [home, intr],
      vector: mid(home.vector, intr.vector),
      coherent: shared.length >= 1,
      sharedAxes: shared,
      note: `${home.name} × ${intr.name} · Brücke: ${shared.length} Achse(n)`,
    };
  },
};

/** B-methodology offline: two worlds inside a distance band, blended at λ. */
export const lambdaBandMix: MixStrategy = {
  id: "lambda-band",
  label: "Distanz-Band + λ (B-Methodik, offline)",
  arity: 2,
  mix(pool, ctx) {
    const a = nearest(pool, jitter(ctx.centroid, ctx.spread, ctx.rng));
    const band = pool.filter((w) => {
      const d = dist(w.vector, a.vector);
      return w.name !== a.name && d >= 1.0 && d <= 2.4; // tension band
    });
    if (!band.length) return null;
    const b = band[Math.floor(ctx.rng() * band.length)];
    const lambda = 0.3 + ctx.rng() * 0.4; // 0.3..0.7
    const vector = zero();
    for (const ax of AXES) vector[ax] = clamp(a.vector[ax] * lambda + b.vector[ax] * (1 - lambda));
    const shared = sharedSigns(a.vector, b.vector);
    return {
      worlds: [a, b],
      vector,
      coherent: true,
      sharedAxes: shared,
      note: `${a.name} ↔ ${b.name} · λ=${lambda.toFixed(2)} · d=${dist(a.vector, b.vector).toFixed(2)}`,
    };
  },
};

/** Experimental: three colliding worlds, weighted blend. */
export const triadMix: MixStrategy = {
  id: "triad",
  label: "Triade (drei Welten)",
  arity: 3,
  mix(pool, ctx) {
    const a = nearest(pool, jitter(ctx.centroid, ctx.spread, ctx.rng));
    const rest = pool.filter((w) => w.name !== a.name);
    if (rest.length < 2) return null;
    const sh = rest.filter((w) => sharedSigns(a.vector, w.vector).length >= 1);
    const usable = sh.length >= 2 ? sh : rest;
    const b = usable[Math.floor(ctx.rng() * usable.length)];
    const others = usable.filter((w) => w.name !== b.name);
    const c = others[Math.floor(ctx.rng() * others.length)] ?? rest[0];
    const weights: [World, number][] = [
      [a, 0.5],
      [b, 0.3],
      [c, 0.2],
    ];
    const vector = zero();
    for (const ax of AXES)
      vector[ax] = clamp(weights.reduce((s, [w, k]) => s + w.vector[ax] * k, 0));
    const shared = sharedSigns(a.vector, b.vector).filter((x) =>
      sharedSigns(a.vector, c.vector).includes(x),
    );
    return {
      worlds: [a, b, c],
      vector,
      coherent: shared.length >= 1,
      sharedAxes: shared,
      note: `${a.name} × ${b.name} × ${c.name}`,
    };
  },
};

/** Experimental: maximal tension — the farthest partner that still shares one axis. */
export const contrastMix: MixStrategy = {
  id: "contrast",
  label: "Kontrast (max. Spannung, 1 Brücke)",
  arity: 2,
  mix(pool, ctx) {
    const a = nearest(pool, jitter(ctx.centroid, ctx.spread, ctx.rng));
    const cands = pool.filter(
      (w) => w.name !== a.name && sharedSigns(a.vector, w.vector).length >= 1,
    );
    if (!cands.length) return null;
    cands.sort((x, y) => dist(y.vector, a.vector) - dist(x.vector, a.vector));
    const b = cands[Math.min(cands.length - 1, Math.floor(ctx.rng() * 2))];
    const shared = sharedSigns(a.vector, b.vector);
    return {
      worlds: [a, b],
      vector: mid(a.vector, b.vector),
      coherent: shared.length >= 1,
      sharedAxes: shared,
      note: `${a.name} ⚡ ${b.name} · d=${dist(a.vector, b.vector).toFixed(2)}`,
    };
  },
};

export const MIX_STRATEGIES: MixStrategy[] = [bridgeMix, lambdaBandMix, triadMix, contrastMix];

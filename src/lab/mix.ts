import { AXES, clamp, dist, mid, sharedSigns, zero } from "../engine";
import type { AxisVector } from "../engine";
import type { World } from "../engine/pools";
import type { MixContext, MixStrategy } from "./method";

function jitter(c: AxisVector, spread: number, rng: () => number): AxisVector {
  const o = zero();
  for (const ax of AXES) o[ax] = clamp(c[ax] + (rng() * 2 - 1) * spread);
  return o;
}

function nearest(pool: World[], target: AxisVector): World {
  return pool.reduce((best, w) => (dist(w.vector, target) < dist(best.vector, target) ? w : best));
}

/**
 * Fit-weighted partner pick (E-042). Rewards tension (distance from `home`) but penalizes drift
 * from the briefing centroid, so the *blend* lands on-briefing while the collision keeps its spark.
 * fit=0 → pure max-contrast (the old behaviour); fit=1 → strongly hugs the briefing. Picks among
 * the top few so a batch still varies. Caller must pre-filter `cands` for its own coherence rule.
 */
function pickPartner(cands: World[], home: World, ctx: MixContext): World {
  const fit = ctx.fit ?? 0.55;
  const scored = cands
    .map((w) => ({ w, score: dist(w.vector, home.vector) - fit * 2 * dist(w.vector, ctx.centroid) }))
    .sort((a, b) => b.score - a.score);
  const topK = Math.min(3, scored.length);
  return scored[Math.floor(ctx.rng() * topK)].w;
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
    const intr = pickPartner(cands, home, ctx);
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
    const b = pickPartner(band, a, ctx);
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

/** Cosine distance in the embedding space (0 = identical direction, 1 = orthogonal, 2 = opposite). */
function cosineDist(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 1;
  return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * B · Latent-Space — real embeddings. Picks a collision by *semantic* cosine distance inside a
 * tension band (the concept's continuous version of the bridge rule). The card vector is still a
 * λ-blend of the two worlds' 5 axes (for palette/typo). Falls back to axis-euclidean if a world
 * has no embedding. The band is the "safe ↔ experimental" knob.
 */
export const latentBandMix: MixStrategy = {
  id: "latent-band",
  label: "Latent-Space · Embeddings (B)",
  arity: 2,
  mix(pool, ctx) {
    const a = nearest(pool, jitter(ctx.centroid, ctx.spread, ctx.rng));
    const embedded = a.embedding && pool.some((w) => w.name !== a.name && w.embedding);

    let b: World | undefined;
    let metric = "axis";
    if (embedded && a.embedding) {
      const scored = pool
        .filter((w) => w.name !== a.name && w.embedding)
        .map((w) => ({ w, d: cosineDist(a.embedding!, w.embedding!) }));
      // Tension band on cosine distance — widened by ctx.tension (safe→narrow, experimental→wide).
      const t = ctx.tension ?? 0.5;
      const lo = 0.2 - t * 0.05;
      const hi = 0.45 + t * 0.45;
      let band = scored.filter((s) => s.d >= lo && s.d <= hi).map((s) => s.w);
      if (!band.length) {
        band = scored.sort((x, y) => Math.abs(0.4 - x.d) - Math.abs(0.4 - y.d)).slice(0, 3).map((s) => s.w);
      }
      // Semantic cosine band picks the tension; fit-weighting picks the on-briefing one within it.
      b = pickPartner(band, a, ctx);
      metric = "cos";
    } else {
      const band = pool.filter((w) => {
        const d = dist(w.vector, a.vector);
        return w.name !== a.name && d >= 1.0 && d <= 2.4;
      });
      if (!band.length) return null;
      b = pickPartner(band, a, ctx);
    }
    if (!b) return null;

    const lambda = 0.3 + ctx.rng() * 0.4;
    const vector = zero();
    for (const ax of AXES) vector[ax] = clamp(a.vector[ax] * lambda + b.vector[ax] * (1 - lambda));
    const shared = sharedSigns(a.vector, b.vector);
    const dval =
      metric === "cos" && a.embedding && b.embedding
        ? cosineDist(a.embedding, b.embedding).toFixed(2)
        : dist(a.vector, b.vector).toFixed(2);
    return {
      worlds: [a, b],
      vector,
      coherent: true,
      sharedAxes: shared,
      note: `${a.name} ↔ ${b.name} · λ=${lambda.toFixed(2)} · ${metric}-d=${dval}`,
    };
  },
};

export const MIX_STRATEGIES: MixStrategy[] = [
  bridgeMix,
  lambdaBandMix,
  latentBandMix,
  triadMix,
  contrastMix,
];

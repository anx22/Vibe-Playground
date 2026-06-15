import type { AxisKey, AxisVector } from "./types";

export const AXES: AxisKey[] = [
  "material",
  "energy",
  "time",
  "structure",
  "density",
  "formality",
];

export const POLES: Record<AxisKey, { neg: string; pos: string }> = {
  material: { neg: "kalt/synthetisch", pos: "warm/organisch" },
  energy: { neg: "leise/zurückgenommen", pos: "laut/roh" },
  time: { neg: "historisch", pos: "futuristisch" },
  structure: { neg: "organisch", pos: "Raster/System" },
  density: { neg: "sparsam", pos: "dicht" },
  formality: { neg: "verspielt/casual", pos: "seriös/formell" },
};

export const zero = (): AxisVector => ({
  material: 0,
  energy: 0,
  time: 0,
  structure: 0,
  density: 0,
  formality: 0,
});

export const clamp = (n: number, lo = -1, hi = 1): number =>
  Math.max(lo, Math.min(hi, n));

export function add(a: AxisVector, b: AxisVector, k = 1): AxisVector {
  const o = zero();
  for (const ax of AXES) o[ax] = clamp(a[ax] + b[ax] * k);
  return o;
}

export function mid(a: AxisVector, b: AxisVector): AxisVector {
  const o = zero();
  for (const ax of AXES) o[ax] = clamp((a[ax] + b[ax]) / 2);
  return o;
}

export function dist(a: AxisVector, b: AxisVector): number {
  let s = 0;
  for (const ax of AXES) {
    const d = a[ax] - b[ax];
    s += d * d;
  }
  return Math.sqrt(s);
}

/** Axes where both vectors are decisive and agree in sign — the bridge (E-003). */
export function sharedSigns(a: AxisVector, b: AxisVector, th = 0.15): AxisKey[] {
  return AXES.filter(
    (ax) =>
      Math.abs(a[ax]) > th &&
      Math.abs(b[ax]) > th &&
      Math.sign(a[ax]) === Math.sign(b[ax]),
  );
}

/** Deterministic, seedable PRNG (mulberry32) — Lab needs reproducible batches. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

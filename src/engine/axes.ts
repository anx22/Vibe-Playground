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


import type { AxisKey, AxisVector, Typography } from "./types";
import { AXES, dist } from "./axes";
import { BODY_FONTS, DATA_FONTS, DISPLAY_FONTS, FontDef } from "./pools";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

/** 3-tone palette derived from the axis vector (base · ink · accent). */
export function paletteFor(v: AxisVector): [string, string, string] {
  const hue = lerp(218, 32, (v.material + 1) / 2) - v.time * 14;
  const sat = lerp(20, 82, (v.energy + 1) / 2);
  const lBase = lerp(88, 44, (v.density + 1) / 2);
  const step = lerp(8, 26, (v.structure + 1) / 2);
  const base = hslToHex(hue, sat, lBase);
  const ink = hslToHex(hue, sat - 12, Math.max(8, lBase - step - 22));
  const accent = hslToHex(
    hue + (v.energy > 0 ? 28 : -24),
    sat + 10,
    Math.min(92, lBase + (v.density > 0 ? -6 : 10)),
  );
  return [base, ink, accent];
}

const ADJ: Record<AxisKey, [string, string]> = {
  material: ["synthetisch", "organisch"],
  energy: ["still", "roh"],
  time: ["historisch", "futuristisch"],
  structure: ["fließend", "systemisch"],
  density: ["sparsam", "dicht"],
};

export function moodFor(v: AxisVector): string {
  const sorted = [...AXES].sort((a, b) => Math.abs(v[b]) - Math.abs(v[a]));
  const [a, b] = sorted;
  return `${cap(ADJ[a][v[a] >= 0 ? 1 : 0])}-${ADJ[b][v[b] >= 0 ? 1 : 0]}`;
}

function pick(pool: FontDef[], v: AxisVector, rng: () => number): FontDef {
  const sorted = [...pool].sort((x, y) => dist(x.vector, v) - dist(y.vector, v));
  const top = sorted.slice(0, 2);
  return top[Math.floor(rng() * top.length)];
}

export function typoFor(
  v: AxisVector,
  rng: () => number,
): { display: Typography; body: Typography; data: Typography } {
  const d = pick(DISPLAY_FONTS, v, rng);
  const b = pick(BODY_FONTS, v, rng);
  const m = pick(DATA_FONTS, v, rng);
  return {
    display: { role: "Display", name: d.name, family: d.family },
    body: { role: "Body", name: b.name, family: b.family },
    data: { role: "Data", name: m.name, family: m.family },
  };
}

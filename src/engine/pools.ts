import type { AxisVector } from "./types";

export interface FontDef {
  name: string;
  family: string;
  vector: AxisVector;
}

// material · energy · time · structure · density · formality   (each −1..1)
const v = (
  material: number,
  energy: number,
  time: number,
  structure: number,
  density: number,
  formality: number,
): AxisVector => ({ material, energy, time, structure, density, formality });

export const DISPLAY_FONTS: FontDef[] = [
  { name: "Fraunces", family: "'Fraunces', serif", vector: v(0.6, -0.1, -0.4, 0.1, 0.3, 0.3) },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", vector: v(-0.5, 0.2, 0.7, 0.5, 0.1, 0.0) },
  { name: "Archivo Black", family: "'Archivo Black', sans-serif", vector: v(-0.2, 0.8, 0.1, 0.4, 0.7, -0.2) },
  { name: "Playfair Display", family: "'Playfair Display', serif", vector: v(0.2, -0.3, -0.7, 0.4, 0.2, 0.6) },
  { name: "Syne", family: "'Syne', sans-serif", vector: v(-0.3, 0.5, 0.6, -0.2, 0.0, -0.4) },
];

export const BODY_FONTS: FontDef[] = [
  { name: "Newsreader", family: "'Newsreader', serif", vector: v(0.3, -0.3, -0.4, 0.4, 0.4, 0.4) },
  { name: "Public Sans", family: "'Public Sans', sans-serif", vector: v(-0.3, 0.0, 0.3, 0.5, 0.0, 0.3) },
  { name: "Source Serif 4", family: "'Source Serif 4', serif", vector: v(0.4, -0.2, -0.3, 0.3, 0.3, 0.4) },
  { name: "IBM Plex Sans", family: "'IBM Plex Sans', sans-serif", vector: v(-0.4, 0.1, 0.4, 0.4, 0.1, 0.1) },
];

export const DATA_FONTS: FontDef[] = [
  { name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", vector: v(-0.4, 0.0, 0.3, 0.6, 0.2, 0.1) },
  { name: "Space Mono", family: "'Space Mono', monospace", vector: v(-0.3, 0.3, 0.5, 0.3, 0.1, -0.2) },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", vector: v(-0.6, 0.1, 0.6, 0.6, 0.3, 0.1) },
  { name: "Spline Sans Mono", family: "'Spline Sans Mono', monospace", vector: v(-0.2, 0.2, 0.4, 0.4, 0.0, 0.0) },
];

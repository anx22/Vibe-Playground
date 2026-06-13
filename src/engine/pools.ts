import type { AxisVector } from "./types";

export interface World {
  name: string;
  vector: AxisVector;
  /** Optional real semantic embedding (Engine B); curated worlds don't have one. */
  embedding?: number[];
}
export interface ObjectMetaphor {
  name: string;
  vector: AxisVector;
}
export interface FontDef {
  name: string;
  family: string;
  vector: AxisVector;
}

const v = (
  material: number,
  energy: number,
  time: number,
  structure: number,
  density: number,
): AxisVector => ({ material, energy, time, structure, density });

/** Intentionally small for prototyping — expand once a quality baseline is set (NOW). */
export const WORLDS: World[] = [
  { name: "Editorial", vector: v(-0.1, -0.4, -0.2, 0.7, 0.3) },
  { name: "Tech", vector: v(-0.7, 0.2, 0.8, 0.6, 0.4) },
  { name: "Brutalism", vector: v(-0.6, 0.8, 0.1, 0.5, 0.7) },
  { name: "Botanical", vector: v(0.9, -0.3, -0.4, -0.7, 0.5) },
  { name: "Bauhaus", vector: v(-0.2, 0.2, -0.1, 0.8, -0.2) },
  { name: "Vapor", vector: v(-0.3, 0.6, 0.6, -0.2, 0.4) },
  { name: "Monastic", vector: v(0.2, -0.8, -0.7, 0.3, -0.6) },
  { name: "Industrial", vector: v(-0.8, 0.5, -0.1, 0.4, 0.6) },
  { name: "Folk", vector: v(0.8, 0.1, -0.6, -0.4, 0.3) },
  { name: "Cyber", vector: v(-0.8, 0.7, 0.9, 0.3, 0.7) },
  { name: "Archive", vector: v(0.0, -0.5, -0.6, 0.6, 0.7) },
  { name: "Solar", vector: v(0.4, 0.3, 0.7, 0.2, -0.3) },
  { name: "Nautical", vector: v(0.2, -0.2, -0.4, 0.3, 0.2) },
  { name: "Apotheke", vector: v(0.5, -0.5, -0.6, 0.4, 0.5) },
  { name: "Arcade", vector: v(-0.5, 0.7, 0.5, 0.2, 0.6) },
  { name: "Constructivist", vector: v(-0.3, 0.6, -0.4, 0.7, 0.5) },
  { name: "Ceramic", vector: v(0.7, -0.2, -0.2, -0.3, 0.1) },
  { name: "Observatory", vector: v(-0.2, -0.4, 0.5, 0.5, 0.3) },
];

export const OBJECTS: ObjectMetaphor[] = [
  { name: "Atlas", vector: v(0.0, -0.2, -0.3, 0.5, 0.4) },
  { name: "Terminal", vector: v(-0.7, 0.2, 0.8, 0.4, 0.2) },
  { name: "Almanach", vector: v(0.1, -0.4, -0.5, 0.3, 0.6) },
  { name: "Specimen", vector: v(0.6, -0.2, -0.3, -0.3, 0.2) },
  { name: "Ledger", vector: v(-0.1, -0.4, -0.2, 0.7, 0.5) },
  { name: "Beacon", vector: v(-0.2, 0.6, 0.3, 0.0, -0.2) },
  { name: "Lexikon", vector: v(0.0, -0.3, -0.2, 0.5, 0.7) },
  { name: "Reliquie", vector: v(0.3, -0.5, -0.7, 0.1, 0.1) },
  { name: "Manifest", vector: v(-0.3, 0.8, 0.2, 0.2, 0.4) },
  { name: "Kompass", vector: v(-0.1, -0.1, -0.2, 0.4, -0.1) },
  { name: "Totem", vector: v(0.7, 0.3, -0.2, -0.4, 0.3) },
  { name: "Circuit", vector: v(-0.8, 0.4, 0.9, 0.6, 0.5) },
  { name: "Logbuch", vector: v(0.1, -0.4, -0.4, 0.4, 0.5) },
  { name: "Schaltplan", vector: v(-0.5, 0.1, 0.4, 0.7, 0.6) },
  { name: "Herbarium", vector: v(0.6, -0.3, -0.3, 0.2, 0.5) },
  { name: "Plakat", vector: v(-0.1, 0.7, 0.0, 0.3, 0.4) },
  { name: "Karteikarte", vector: v(0.0, -0.3, -0.2, 0.6, 0.5) },
  { name: "Zifferblatt", vector: v(-0.2, -0.2, 0.1, 0.5, 0.2) },
];

export const DISPLAY_FONTS: FontDef[] = [
  { name: "Fraunces", family: "'Fraunces', serif", vector: v(0.6, -0.1, -0.4, 0.1, 0.3) },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", vector: v(-0.5, 0.2, 0.7, 0.5, 0.1) },
  { name: "Archivo Black", family: "'Archivo Black', sans-serif", vector: v(-0.2, 0.8, 0.1, 0.4, 0.7) },
  { name: "Playfair Display", family: "'Playfair Display', serif", vector: v(0.2, -0.3, -0.7, 0.4, 0.2) },
  { name: "Syne", family: "'Syne', sans-serif", vector: v(-0.3, 0.5, 0.6, -0.2, 0.0) },
];

export const BODY_FONTS: FontDef[] = [
  { name: "Newsreader", family: "'Newsreader', serif", vector: v(0.3, -0.3, -0.4, 0.4, 0.4) },
  { name: "Public Sans", family: "'Public Sans', sans-serif", vector: v(-0.3, 0.0, 0.3, 0.5, 0.0) },
  { name: "Source Serif 4", family: "'Source Serif 4', serif", vector: v(0.4, -0.2, -0.3, 0.3, 0.3) },
  { name: "IBM Plex Sans", family: "'IBM Plex Sans', sans-serif", vector: v(-0.4, 0.1, 0.4, 0.4, 0.1) },
];

export const DATA_FONTS: FontDef[] = [
  { name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace", vector: v(-0.4, 0.0, 0.3, 0.6, 0.2) },
  { name: "Space Mono", family: "'Space Mono', monospace", vector: v(-0.3, 0.3, 0.5, 0.3, 0.1) },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", vector: v(-0.6, 0.1, 0.6, 0.6, 0.3) },
  { name: "Spline Sans Mono", family: "'Spline Sans Mono', monospace", vector: v(-0.2, 0.2, 0.4, 0.4, 0.0) },
];

/** Fallback keyword → axis bias (E-002: lexicon is a fallback, not the long-term mechanism). */
export const LEXICON: Record<string, Partial<AxisVector>> = {
  tech: { time: 0.7, material: -0.6, structure: 0.5 },
  editorial: { structure: 0.6, density: 0.3, energy: -0.3 },
  natur: { material: 0.8, structure: -0.6 },
  organisch: { material: 0.8, structure: -0.6 },
  brutal: { energy: 0.8, material: -0.5, density: 0.6 },
  retro: { time: -0.7 },
  vintage: { time: -0.7, material: 0.3 },
  minimal: { density: -0.7, energy: -0.5 },
  laut: { energy: 0.8 },
  ruhig: { energy: -0.7 },
  futuristisch: { time: 0.8 },
  warm: { material: 0.7 },
  dicht: { density: 0.8 },
};

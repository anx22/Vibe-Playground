export type AxisKey = "material" | "energy" | "time" | "structure" | "density" | "formality";

/** A point in the 5-axis Vibe Space, each component in [-1, 1]. */
export type AxisVector = Record<AxisKey, number>;

export interface Typography {
  role: "Display" | "Body" | "Data";
  name: string;
  /** CSS font-family stack, so the trio renders in its real faces. */
  family: string;
}

/**
 * A result = an open "Denkanstoß-Cluster" (QS-2): a vivid world-opener + anchor + loose triggers
 * that feed a downstream design/image AI. No pre-designing — no typography/palette/layout here.
 */
export interface VibeCard {
  id: string;
  /** Which methodology produced this block — drives the lane/panel grouping (E-047). */
  source?: string;
  /** The compound word — anchor + title of the cluster, e.g. "Letterpress-Seidenband". */
  leitwert: string;
  /** 1–2 sentences of Kopfkino that open the world (sensory, concrete — not a design instruction). */
  weltSatz: string;
  /** near (premium, in the brief's own world) ⟷ far (surprising collision). Drives the felt mix, never labeled. */
  register: "nah" | "fern";
  /** Loose trigger images/phrases. */
  metaphern: string[];
  /** Tangible material/texture/surface words. */
  materialien: string[];
  /** Verbal "wie …" image-comparisons (no named styles/artists). */
  bildVergleiche: string[];
  /** LLM-judge score (1..5 each + overall), attached by the judge-select step (E-041). */
  quality?: Quality;
}

/** The judge's verdict on one cluster — the production fitness signal (on-target × surprise × craft × designValue). */
export interface Quality {
  onTarget: number;
  surprise: number;
  craft: number;
  /** A derivable world/material design-value, NOT a story — the north-star win/fail axis (E-063). Optional: a leaner judge may omit it. */
  designValue?: number;
  overall: number;
  note: string;
}

export type SignalKind = "attract" | "repel";

export interface Signal {
  id: string;
  kind: SignalKind;
  vector: AxisVector;
  label: string;
}

export interface GenParams {
  batchSize: number;
  /** 0..1 — how far cards may stray from the centroid (Explore wide, Iterate tight). */
  spread: number;
}

/** All engines share this contract so A/B/C are interchangeable and stackable. */
export interface Engine {
  id: "A" | "B" | "C";
  label: string;
  generate(centroid: AxisVector, params: GenParams, rng: () => number): VibeCard[];
}

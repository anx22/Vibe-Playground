export type AxisKey = "material" | "energy" | "time" | "structure" | "density" | "formality";

/** A point in the 5-axis Vibe Space, each component in [-1, 1]. */
export type AxisVector = Record<AxisKey, number>;

export interface Typography {
  role: "Display" | "Body" | "Data";
  name: string;
  /** CSS font-family stack, so the trio renders in its real faces. */
  family: string;
}

export interface VibeCard {
  id: string;
  /** The compound word, e.g. "Editorial-Tech-Atlas". */
  leitwert: string;
  mood: string;
  /** Optional evocative scene — the LLM render (E-028); absent in the offline template. */
  scene?: string;
  typography: { display: Typography; body: Typography; data: Typography };
  palette: [string, string, string];
  vector: AxisVector;
  coherence: { sharedAxes: AxisKey[]; ok: boolean };
  origin: { home: string; intrusion: string; object: string; engineNote: string };
  /** Which methodology produced this block — drives the constellation clustering (E-047). */
  source?: string;
  /** Rich expand detail (Engine D bridge: the worlds, their rhyme, object, derivation, affordances). */
  detail?: {
    worlds?: { name: string; role: string; rhyme: string }[];
    object?: string;
    derivation?: string;
    affordances?: string[];
    /** Engine F: the orthogonal taste-direction this candidate belongs to, and the pots used. */
    tasteDirection?: string;
    operators?: string[];
    comfortRating?: string;
    /** Engine D/E self-rated donor distance (hoch / mittel). */
    domainDistance?: string;
  };
  /** LLM-judge score (1..5 each + overall), attached by the judge-select step (E-041). */
  quality?: Quality;
}

/** The judge's verdict on one card — the production fitness signal (E-063: on-target × surprise × craft × renderability). */
export interface Quality {
  onTarget: number;
  surprise: number;
  craft: number;
  /** Does the Leitwert, fed verbatim to an image model, render to a coherent/beautiful world? (E-063) */
  renderability: number;
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

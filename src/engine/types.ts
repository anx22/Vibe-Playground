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
  /** Rich expand detail (Engine D bridge: the worlds, their rhyme, object, derivation). */
  detail?: {
    worlds?: { name: string; role: string; rhyme: string }[];
    object?: string;
    derivation?: string;
    /** 2–3 gleichwertige holistische Design-Lesarten derselben Welt — konsolidierte
     *  Gesamtbeschreibungen statt atomisierter Pattern-Liste, ohne Motion (E-095). */
    designs?: { title: string; description: string }[];
  };
  /** LLM-judge score (1..5 each + overall), attached by the judge-select step (E-041). */
  quality?: Quality;
}

/** The judge's verdict on one card — the production fitness signal (E-063: on-target × surprise × craft × designValue). */
export interface Quality {
  onTarget: number;
  surprise: number;
  craft: number;
  /** A derivable design-value (world/material/style/mood), NOT a story — the north-star win/fail axis (E-063). Optional: an older/leaner judge may omit it. */
  designValue?: number;
  /** Render/material register the judge assigned — spreads a cluster across material feels (E-065). */
  register?: string;
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

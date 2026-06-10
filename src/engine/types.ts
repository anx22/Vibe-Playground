export type AxisKey = "material" | "energy" | "time" | "structure" | "density";

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

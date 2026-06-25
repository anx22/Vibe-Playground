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
  funde: string[];
  /** Tangible material/texture/surface words. */
  materialien: string[];
  /** Verbal "wie …" image-comparisons (no named styles/artists). */
  bildReferenzen: string[];
  /** LLM-judge score (1..5 each + overall), attached by the judge-select step (E-041). */
  quality?: Quality;
}

/** The judge's verdict on one cluster — production fitness (on-target × surprise × craft × formSubstanz). */
export interface Quality {
  onTarget: number;
  surprise: number;
  craft: number;
  /** A derivable world/material design-value, NOT a story — the north-star win/fail axis (E-063). */
  formSubstanz?: number;
  overall: number;
  note: string;
}

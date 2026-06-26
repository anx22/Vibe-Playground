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
  /** Drawable form across design axes — a non-negotiable GATE axis (QS-3 #5), not a story. */
  formSubstanz: number;
  overall: number;
  note: string;
}

/** Which part of a card a collected morsel came from — drives grouping in the Vibe-Shaker + copy-out. */
export type TokenKind = "leitwert" | "weltSatz" | "funde" | "materialien" | "bildReferenzen";

/** A single morsel the user clicked out of a card into the Vibe-Shaker tray. */
export interface ShakerToken {
  /** Stable identity (see `tokenId`): a card chip and its tray entry share it ⇒ automatic two-way bind. */
  id: string;
  cardId: string;
  kind: TokenKind;
  text: string;
}

/** The one place the token id is shaped, so card chips, the tray and the store always agree. */
export const tokenId = (cardId: string, kind: TokenKind, text: string): string => `${cardId}::${kind}::${text}`;

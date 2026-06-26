import type { ShakerToken, TokenKind, VibeCard } from "./engine";

/** Display label per token kind — shared by the card chips, the Vibe-Shaker tray and the copy-out so they never drift. */
export const KIND_LABELS: Record<TokenKind, string> = {
  leitwert: "Richtung",
  weltSatz: "Welt",
  funde: "Funde",
  materialien: "Materialien",
  bildReferenzen: "Bild-Referenzen",
};
/** Fixed compose/display order for collected morsels. */
export const KIND_ORDER: TokenKind[] = ["leitwert", "weltSatz", "funde", "materialien", "bildReferenzen"];

/**
 * Copy targets for a Denkanstoß-Cluster. The cluster is raw world-material that feeds a downstream
 * design/image AI, so "export" is clean, paste-anywhere text at three grains — a single line (einzeln),
 * one group (gruppiert — groupText), the whole cluster (gesamt — clusterText, led by the Welt-Satz as
 * headline) — plus a composed, paste-ready WORLD-prompt (worldPromptText) for an image model.
 */

/** One labeled list block — the "gruppiert" copy. */
export function groupText(label: string, items: string[]): string {
  return [`${label}:`, ...items.map((it) => `– ${it}`)].join("\n");
}

/** The whole cluster as a clean text block — the "gesamt" copy. */
export function clusterText(card: VibeCard): string {
  const groups: [string, string[]][] = [
    ["Funde", card.funde],
    ["Materialien", card.materialien],
    ["Bild-Referenzen", card.bildReferenzen],
  ];
  // #3: the Welt-Satz is the headline/soul — it leads; the Leitwert (committed direction) follows.
  const out: string[] = [];
  if (card.weltSatz) out.push(card.weltSatz);
  out.push(card.leitwert);
  for (const [label, items] of groups) {
    if (items.length) out.push("", groupText(label, items));
  }
  return out.join("\n").trim();
}

/**
 * The composed WORLD-prompt (#7): the cluster folded into one coherent, paste-ready paragraph for a
 * downstream image/design AI — led by the committed direction (Leitwert) + the world (Welt-Satz), then
 * the drawable forms (Funde), materials and real image-anchors. It composes the WORLD, never the design:
 * no layout, typography, UI, palette or named styles are added.
 */
export function worldPromptText(card: VibeCard): string {
  const parts: string[] = [];
  parts.push((card.weltSatz ? `${card.leitwert} — ${card.weltSatz}` : card.leitwert).trim());
  if (card.funde.length) parts.push(`Sichtbare Formen: ${card.funde.join(", ")}.`);
  if (card.materialien.length) parts.push(`Materialien: ${card.materialien.join(", ")}.`);
  if (card.bildReferenzen.length) parts.push(`Bild-Anker: ${card.bildReferenzen.join("; ")}.`);
  return parts.join(" ");
}

/**
 * The Vibe-Shaker tray folded into ONE clean, paste-ready Modifikator — the morsels the user clicked
 * out of (possibly several) cards, grouped by kind in a fixed order and deduped per group. Richtung /
 * Welt lead as single labeled lines; the rest reuse `groupText`. Composes the WORLD, prescribes no
 * design (no layout/typography/UI/palette) — same discipline as `worldPromptText`.
 */
export function shakerText(tokens: ShakerToken[]): string {
  const blocks: string[] = [];
  for (const kind of KIND_ORDER) {
    const items = [...new Set(tokens.filter((t) => t.kind === kind).map((t) => t.text))];
    if (!items.length) continue;
    blocks.push(
      kind === "leitwert" || kind === "weltSatz"
        ? `${KIND_LABELS[kind]}: ${items.join(" · ")}`
        : groupText(KIND_LABELS[kind], items),
    );
  }
  return blocks.join("\n\n").trim();
}

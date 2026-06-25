import type { VibeCard } from "./engine";

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

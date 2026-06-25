import type { VibeCard } from "./engine";

/**
 * Copy targets for a Denkanstoß-Cluster (QS-2). The cluster is raw world-material that feeds a
 * downstream design/image AI, so "export" is simply clean, paste-anywhere text at three grains:
 * a single line (einzeln — copied directly), one group (gruppiert — groupText), or the whole
 * cluster (gesamt — clusterText).
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
  const out: string[] = [card.leitwert];
  if (card.weltSatz) out.push(card.weltSatz);
  for (const [label, items] of groups) {
    if (items.length) out.push("", groupText(label, items));
  }
  return out.join("\n").trim();
}

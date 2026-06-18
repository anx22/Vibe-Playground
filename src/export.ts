import type { VibeCard } from "./engine";

/**
 * A compact, LAYERED style trigger to paste into a design/image AI (landing page · brandboard ·
 * pitch slide) — Valsecchi-style visual-prompt layering (world · material/texture · colour ·
 * light/mood · anti-cliché), not a derivation essay (E-057/E-059). The Leitwert is the trigger;
 * the layers are only the visual cues a generator needs to render it on-brand.
 */
export function buildExportPrompt(c: VibeCard): string {
  const d = c.detail;
  const worlds = d?.worlds?.length
    ? d.worlds.map((w) => w.name).join(" × ")
    : c.origin.home && c.origin.home !== "Persona"
      ? c.origin.home
      : "";
  const texture = (d?.affordances ?? []).slice(0, 5).join(", ");

  const lines = [
    `Stil-Trigger: «${c.leitwert}»`,
    worlds ? `Welt: ${worlds}` : d?.derivation ? `Quelle: ${d.derivation}` : "",
    texture ? `Material & Textur: ${texture}` : "",
    `Farbe: ${c.palette.join(" · ")}`,
    `Licht & Stimmung: ${c.mood}`,
    `Anti-Klischee: die Welt(en) visuell übersetzen, NICHT wörtlich abbilden; keine generische AI-Ästhetik, keine Stock-Verläufe.`,
    "",
    `→ Wende diesen Stil konsequent auf [Landingpage / Brandboard / Slide / Pitch] an.`,
  ].filter(Boolean);
  return lines.join("\n");
}

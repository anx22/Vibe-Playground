import type { VibeCard } from "./engine";

/**
 * A compact STYLE TRIGGER to paste into a design AI (landing page / brandboard / pitch slide) —
 * not a derivation essay (E-057). The Leitwert is the trigger; this adds only the few visual cues
 * a model needs to render it: the colliding worlds (or the person), mood, palette, key textures.
 */
export function buildExportPrompt(c: VibeCard): string {
  const d = c.detail;
  const worlds = d?.worlds?.length
    ? d.worlds.map((w) => w.name).join(" × ")
    : c.origin.home && c.origin.home !== "Persona"
      ? c.origin.home
      : "";
  const cues = (d?.affordances ?? []).slice(0, 4).join(", ");

  const lines = [
    `Stil-Trigger: «${c.leitwert}»`,
    worlds ? `Welten: ${worlds}` : d?.derivation ? `Quelle: ${d.derivation}` : "",
    `Stimmung: ${c.mood}`,
    `Palette: ${c.palette.join(" · ")}`,
    cues ? `Visuell: ${cues}` : "",
    "",
    `Wende diesen Stil auf [Landingpage / Brandboard / Slide / Pitch] an — die Welten visuell umsetzen, nicht wörtlich abbilden; keine generische AI-Ästhetik.`,
  ].filter(Boolean);
  return lines.join("\n");
}

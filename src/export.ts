import type { VibeCard } from "./engine";
import { AXES, POLES } from "./engine";

/**
 * Turn a committed direction into a ready-to-paste design brief / LLM prompt — the output
 * surface from the concept (E-024: the vibe is the deliverable). Pure & deterministic, no tokens.
 */
export function buildExportPrompt(c: VibeCard): string {
  const axes = AXES.map((ax) => {
    const val = c.vector[ax];
    const pole = val >= 0 ? POLES[ax].pos : POLES[ax].neg;
    return `- ${ax}: ${val >= 0 ? "+" : ""}${val.toFixed(2)} (${pole})`;
  }).join("\n");
  const t = c.typography;

  return [
    `Design-Direction: «${c.leitwert}»`,
    ``,
    c.scene
      ? `Vibe-Szene: ${c.scene}`
      : `Welt-Kollision: ${c.origin.home} × ${c.origin.intrusion} → ${c.origin.object}`,
    `Stimmung: ${c.mood}`,
    ``,
    `Vibe-Space (−1..+1):`,
    axes,
    ``,
    `Typografie:`,
    `- Display: ${t.display.name}`,
    `- Body: ${t.body.name}`,
    `- Data/Mono: ${t.data.name}`,
    ``,
    `Palette: ${c.palette.join(" · ")}`,
    ``,
    `Aufgabe: Erzeuge [hier Artefakt einsetzen — z. B. Landing-Page, Poster, App-Screen] strikt in`,
    `dieser Design-Direction. Halte Vibe, Typo-Rollen und Palette konsequent ein; keine generische`,
    `AI-Ästhetik (keine Inter/Roboter-Defaults, keine Klischee-Verläufe).`,
  ].join("\n");
}

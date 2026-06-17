import type { VibeCard } from "./engine";

/**
 * Turn a block into a ready-to-paste design brief / LLM prompt — the output surface (E-024:
 * the vibe is the deliverable). Pure & deterministic, no tokens. Uses the block's own content
 * (Leitwert, the colliding worlds, why-it-rhymes, object, palette) — no axes.
 */
export function buildExportPrompt(c: VibeCard): string {
  const d = c.detail;
  const lines: string[] = [`Design-Direction: «${c.leitwert}»`, ``];

  if (d?.worlds?.length) {
    lines.push(`Welten-Verschränkung:`);
    for (const w of d.worlds) lines.push(`- ${w.name} (${w.role}) — reimt: ${w.rhyme}`);
    lines.push(``);
  } else if (c.origin.home && c.origin.home !== "Persona") {
    lines.push(`Welt: ${c.origin.home}`, ``);
  }

  if (d?.object && d.object !== "—") lines.push(`Objekt-Metapher: ${d.object}`);
  if (d?.derivation ?? c.scene) lines.push(`Herleitung (warum es trägt): ${d?.derivation ?? c.scene}`);
  lines.push(`Stimmung: ${c.mood}`, ``);

  if (d?.affordances?.length) {
    lines.push(`Gestalterische Affordanzen:`, ...d.affordances.map((a) => `- ${a}`), ``);
  }

  lines.push(
    `Palette (Richtung): ${c.palette.join(" · ")}`,
    ``,
    `Aufgabe: Erzeuge [Artefakt einsetzen — Landing-Page, Poster, App-Screen] strikt in dieser`,
    `Design-Direction. Setze die Welten-Verschränkung visuell um (nicht wörtlich abbilden), halte`,
    `Stimmung und Palette-Richtung konsequent; keine generische AI-Ästhetik, keine Klischees.`,
  );
  return lines.join("\n");
}

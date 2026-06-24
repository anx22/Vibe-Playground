import type { VibeCard } from "./engine";

/**
 * Export = a usable visual style-trigger (E-057/E-059), in THREE target flavours behind tabs (C9)
 * plus one dense line that carries the whole vibe on its own. The Leitwert is the trigger; the WORLD
 * gives the surprise, and the 2–3 «denkbaren Designs» are consolidated, applicable readings of that
 * world (no atomized pattern list, no motion) — what actually lands on the clipboard (E-095).
 */
export type ExportTarget = "midjourney" | "chatgpt" | "brandboard";

function parts(c: VibeCard) {
  const d = c.detail;
  const worlds = d?.worlds?.length
    ? d.worlds.map((w) => w.name).join(" × ")
    : c.origin.home && c.origin.home !== "Persona"
      ? c.origin.home
      : "";
  const source = worlds || d?.derivation || "";
  const designs = d?.designs ?? [];
  return { worlds, palette: c.palette.join(" · "), mood: c.mood, source, designs };
}

/** One line that carries the vibe on its own — paste-anywhere, flavoured per target (C9). */
export function buildTrigger(c: VibeCard, target: ExportTarget = "brandboard"): string {
  const { worlds, palette, mood, source, designs } = parts(c);
  const lw = c.leitwert;
  const lead = designs[0]?.description ?? "";
  if (target === "midjourney") {
    return [
      lw,
      worlds && `${worlds} aesthetic`,
      lead,
      `palette ${c.palette.join(" ")}`,
      mood && `${mood} mood`,
      "editorial brand design, worlds translated visually not literally, no generic AI gradients --ar 3:2 --style raw",
    ]
      .filter(Boolean)
      .join(", ");
  }
  if (target === "chatgpt") {
    return (
      `Entwirf im Stil «${lw}»${source ? ` (${source})` : ""}: ` +
      `${[lead, `Farben ${palette}`, mood].filter(Boolean).join(", ")} — ` +
      `Welten visuell statt wörtlich übersetzen, keine generische AI-Ästhetik.`
    );
  }
  return `«${lw}» — ${[source, lead, palette, mood].filter(Boolean).join(", ")}; Welten visuell statt wörtlich, keine generische AI-Ästhetik.`;
}

/** The full, target-formatted brief/prompt. Default = brandboard (the layered style spec). */
export function buildExportPrompt(c: VibeCard, target: ExportTarget = "brandboard"): string {
  const { worlds, palette, mood, source, designs } = parts(c);
  const lw = c.leitwert;

  if (target === "midjourney") {
    return [
      lw,
      worlds && `${worlds} aesthetic`,
      ...designs.map((d) => d.description),
      `color palette ${c.palette.join(" ")}`,
      mood && `${mood} mood`,
      "editorial brand design, cinematic studio light",
      "translate the worlds visually, not literally; no generic AI gradients, no stock look",
      "--ar 3:2 --style raw",
    ]
      .filter(Boolean)
      .join(", ");
  }

  if (target === "chatgpt") {
    return [
      `Du bist Art Director. Entwirf im Stil-Trigger «${lw}».`,
      source ? `- Welt/Quelle: ${source}` : "",
      `- Farbpalette: ${palette}`,
      `- Licht & Stimmung: ${mood}`,
      designs.length ? `Wähle eine dieser gleichwertigen Design-Lesarten (oder mische sie):` : "",
      ...designs.map((d, i) => `${i + 1}. ${d.title}: ${d.description}`),
      `Übersetze die Welt(en) visuell, niemals wörtlich; vermeide generische AI-Ästhetik und Stock-Verläufe.`,
      `Liefere [Landingpage / Brandboard / Slide] konsequent in diesem Stil.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // brandboard (default) — the layered style spec
  return [
    `Stil-Trigger: «${lw}»`,
    worlds ? `Welt: ${worlds}` : c.detail?.derivation ? `Quelle: ${c.detail.derivation}` : "",
    `Farbe: ${palette}`,
    `Licht & Stimmung: ${mood}`,
    designs.length ? "Denkbare Designs (gleichwertige Lesarten derselben Welt):" : "",
    ...designs.map((d) => `  ▷ ${d.title} — ${d.description}`),
    `Anti-Klischee: die Welt(en) visuell übersetzen, NICHT wörtlich abbilden; keine generische AI-Ästhetik, keine Stock-Verläufe.`,
    "",
    `→ Wähle eine Lesart und wende sie konsequent auf [Landingpage / Brandboard / Slide / Pitch] an.`,
  ]
    .filter(Boolean)
    .join("\n");
}

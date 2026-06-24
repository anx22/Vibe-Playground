import type { VibeCard } from "./engine";

/**
 * Export = a usable visual style-trigger (E-057/E-059), now in THREE target flavours behind tabs
 * (C9) plus one dense line that carries the whole vibe on its own ("eine Zeile, die trägt"). The
 * Leitwert is the trigger; the layers are only the cues a generator needs to render it on-brand.
 */
export type ExportTarget = "midjourney" | "chatgpt" | "brandboard";

function parts(c: VibeCard) {
  const d = c.detail;
  const worlds = d?.worlds?.length
    ? d.worlds.map((w) => w.name).join(" × ")
    : c.origin.home && c.origin.home !== "Persona"
      ? c.origin.home
      : "";
  const texture = (d?.affordances ?? []).slice(0, 5).join(", ");
  const source = worlds || d?.derivation || "";
  const typo = d?.typoDirection ?? "";
  const layout = d?.layoutMotion ?? "";
  const elements = d?.elements ?? [];
  return { worlds, texture, palette: c.palette.join(" · "), mood: c.mood, source, typo, layout, elements };
}

/** One line that carries the vibe on its own — paste-anywhere, flavoured per target (C9). */
export function buildTrigger(c: VibeCard, target: ExportTarget = "brandboard"): string {
  const { worlds, texture, palette, mood, source } = parts(c);
  const lw = c.leitwert;
  if (target === "midjourney") {
    return [
      lw,
      worlds && `${worlds} aesthetic`,
      texture && `${texture} surfaces`,
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
      `${[texture, `Farben ${palette}`, mood].filter(Boolean).join(", ")} — ` +
      `Welten visuell statt wörtlich übersetzen, keine generische AI-Ästhetik.`
    );
  }
  return `«${lw}» — ${[source, texture, palette, mood].filter(Boolean).join(", ")}; Welten visuell statt wörtlich, keine generische AI-Ästhetik.`;
}

/** The full, target-formatted brief/prompt. Default = brandboard (the layered style spec). */
export function buildExportPrompt(c: VibeCard, target: ExportTarget = "brandboard"): string {
  const { worlds, texture, palette, mood, source, typo, layout, elements } = parts(c);
  const lw = c.leitwert;

  if (target === "midjourney") {
    return [
      lw,
      worlds && `${worlds} aesthetic`,
      texture && `${texture} surfaces`,
      typo && `${typo} typography`,
      layout && layout,
      ...elements.map((e) => e.element),
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
      texture ? `- Material & Textur: ${texture}` : "",
      `- Farbpalette: ${palette}`,
      `- Licht & Stimmung: ${mood}`,
      typo ? `- Typografie: ${typo}` : "",
      layout ? `- Layout & Motion: ${layout}` : "",
      ...elements.map((e) => `- ${e.layer}: ${e.element}`),
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
    texture ? `Material & Textur: ${texture}` : "",
    `Farbe: ${palette}`,
    `Licht & Stimmung: ${mood}`,
    typo ? `Typografie: ${typo}` : "",
    layout ? `Layout & Motion: ${layout}` : "",
    elements.length ? "Design-Patterns (anwendbar):" : "",
    ...elements.map((e) => `  · ${e.layer}: ${e.element}`),
    `Anti-Klischee: die Welt(en) visuell übersetzen, NICHT wörtlich abbilden; keine generische AI-Ästhetik, keine Stock-Verläufe.`,
    "",
    `→ Wende diesen Stil konsequent auf [Landingpage / Brandboard / Slide / Pitch] an.`,
  ]
    .filter(Boolean)
    .join("\n");
}

import { readFileSync } from "node:fs";
import { buildExportPrompt, buildTrigger } from "../src/export.js";

/** Shows, for ONE real eval result, the raw engine JSON vs. what the app's export
 *  actually puts on your clipboard — and checks each element for presence. No LLM. */

const all = JSON.parse(readFileSync("/tmp/eval-vibe.json", "utf8")) as any[];
const e = all[0]; // «Patina-Industrieglas»

// Build the VibeCard from the captured fields, as the store would.
const card: any = {
  id: "demo",
  leitwert: e.leitwert,
  mood: e.mood,
  scene: e.derivation,
  typography: { display: {}, body: {}, data: {} },
  palette: e.palette,
  vector: { material: 0, energy: 0, time: 0, structure: 0, density: 0, formality: 0 },
  coherence: { sharedAxes: [], ok: true },
  origin: { home: e.worlds, intrusion: "—", object: "—", engineNote: e.derivation },
  source: e.engine,
  detail: {
    derivation: e.derivation,
    typoDirection: e.typo,
    layoutMotion: e.layout,
    elements: e.elements,
    // affordances NOT captured by the eval — note: the live app would have a generic one here.
  },
};

const line = (s: string) => console.log(s);
line("════════ 1) ROHES JSON — was die Engine erzeugt hat ════════");
line(JSON.stringify(e, null, 2));

line("\n\n════════ 2) WAS BEIM EXPORT BEI DIR ANKOMMT (Brandboard) ════════");
line(buildExportPrompt(card, "brandboard"));

line("\n\n════════ 3) DIE 3 KONKRETEN ELEMENTE — stehen sie im Export? ════════");
const everywhere =
  buildExportPrompt(card, "brandboard") + "\n" +
  buildExportPrompt(card, "chatgpt") + "\n" +
  buildExportPrompt(card, "midjourney") + "\n" +
  buildTrigger(card, "brandboard");
for (const el of e.elements) {
  line(`  [${el.layer}] ${el.element}`);
  line(`      → im Export enthalten: ${everywhere.includes(el.element) ? "JA" : "NEIN"}`);
}

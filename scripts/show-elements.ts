import { readFileSync } from "node:fs";
import { buildExportPrompt } from "../src/export.js";

const all = JSON.parse(readFileSync("/tmp/eval-vibe.json", "utf8")) as any[];

console.log("════ WIE VIELE ELEMENTE bringt die Extraktion pro Ergebnis (alle 24)? ════\n");
for (const e of all) {
  console.log(`  ${e.engine.padEnd(9)} «${e.leitwert}»  →  ${e.elements.length} Elemente  [${e.elements.map((x: any) => x.layer).join(", ")}]`);
}
const counts = all.map((e) => e.elements.length);
console.log(`\n  Schnitt: ${(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1)} Elemente · min ${Math.min(...counts)} · max ${Math.max(...counts)}`);

const p = all.find((x) => x.leitwert.includes("Indigobad")) ?? all.find((x) => x.engine === "persona");
console.log(`\n\n════ EINE PERSONA, voll: «${p.leitwert}» ════`);
console.log(JSON.stringify(p, null, 2));

const card: any = {
  id: "d", leitwert: p.leitwert, mood: p.mood, scene: p.derivation,
  typography: { display: {}, body: {}, data: {} }, palette: p.palette.length ? p.palette : ["(aus Vektor)", "", ""],
  vector: { material: 0, energy: 0, time: 0, structure: 0, density: 0, formality: 0 },
  coherence: { sharedAxes: [], ok: true },
  origin: { home: "Persona", intrusion: "—", object: "—", engineNote: p.derivation },
  source: "persona",
  detail: { derivation: p.derivation, typoDirection: p.typo, layoutMotion: p.layout, elements: p.elements },
};
console.log("\n──── Export (Persona, Brandboard) — Palette kommt real aus dem Vektor, hier nicht erfasst:");
console.log(buildExportPrompt(card, "brandboard"));

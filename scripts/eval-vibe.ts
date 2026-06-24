/**
 * eval-vibe — der ehrliche Test: gibt jedes Ergebnis einen FÜHLBAREN, DIREKT
 * ANWENDBAREN Design-Vibe? Läuft die echte Synthese + Persona auf diversen
 * Briefings, druckt den vollen Design-Payload (Elemente/Typo/Layout/Palette/Mood)
 * und bewertet NUR Anwendbarkeit + Fühlbarkeit (nicht Cleverness).
 *   AI_GATEWAY_API_KEY=… npx tsx scripts/eval-vibe.ts
 */
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { fill, genObject, modelFor } from "../api/_lib/gateway.js";
import { personaListSchema, workbenchSchema } from "../api/_lib/schema.js";
import {
  PERSONA_BLANK, PERSONA_PROMPT, PERSONA_SYSTEM,
  SYNTHESE_BLANK, SYNTHESE_PROMPT, SYNTHESE_SYSTEM,
} from "../api/_lib/setup.generated.js";

const BRIEFINGS = [
  { id: "gin", text: "Craft-Gin aus Berlin, soll weg vom Wacholder-und-Botanicals-Klischee" },
  { id: "saas", text: "B2B-SaaS fürs Lager-/Logistik-Management, muss Vertrauen und Tech-Kompetenz ausstrahlen" },
  { id: "kosmetik", text: "Naturkosmetik-Marke, ehrlich und warm, ohne Greenwashing-Blätter-Optik" },
];
const N = 4;

type Design = { title: string; description: string };
type Res = {
  engine: string; leitwert: string; worlds: string; mood: string;
  palette: string[]; designs: Design[]; derivation: string;
};

async function runSynthese(ctx: string): Promise<Res[]> {
  const out = await genObject({
    model: modelFor("strong"), schema: workbenchSchema, system: SYNTHESE_SYSTEM, noCache: true,
    prompt: fill(SYNTHESE_PROMPT, { ctx: ctx || SYNTHESE_BLANK, steer: "", n: N }),
  });
  return out.candidates.map((b) => ({
    engine: "synthese", leitwert: b.leitwert, worlds: b.worlds.map((w) => w.name).join(" × "),
    mood: b.mood, palette: b.palette, designs: b.designs, derivation: b.creativeDerivation,
  }));
}
async function runPersona(ctx: string): Promise<Res[]> {
  const out = await genObject({
    model: modelFor("strong"), schema: personaListSchema, system: PERSONA_SYSTEM, noCache: true,
    prompt: fill(PERSONA_PROMPT, { ctx: ctx || PERSONA_BLANK, n: N }),
  });
  return out.personas.map((p) => ({
    engine: "persona", leitwert: p.leitwert, worlds: `Persona: ${p.persona.slice(0, 70)}`,
    mood: p.mood, palette: p.palette ?? [], designs: p.designs, derivation: p.persona,
  }));
}

const vibeJudge = z.object({
  scores: z.array(z.object({
    anwendbar: z.number().min(1).max(5),
    fuehlbar: z.number().min(1).max(5),
    versagen: z.string(),
  })),
});
const JUDGE_SYS =
  "Du bist ein knallharter Senior Art Director. Bewerte NICHT, ob eine Idee clever ist — sondern NUR, " +
  "ob sie einen FÜHLBAREN, DIREKT ANWENDBAREN Design-Vibe ergibt: konkrete Materialien/Formen/Farben/Typo/Bewegung, " +
  "aus denen ein Designer oder Bildmodell SOFORT eine Designwelt bauen kann. Cleveres Wortspiel ohne anfassbare " +
  "Designsprache = niedrig. 3 = mittelmäßig, sei streng.";

async function judge(briefing: string, rs: Res[]): Promise<{ anwendbar: number; fuehlbar: number; versagen: string }[]> {
  if (!rs.length) return [];
  const list = rs.map((r, i) =>
    `${i + 1}. «${r.leitwert}» — Mood: ${r.mood} — Designs: ` +
    `${r.designs.map((d) => `${d.title}: ${d.description}`).join("  |  ") || "—"}`).join("\n");
  const out = await genObject({
    model: modelFor("cheap"), schema: vibeJudge, system: JUDGE_SYS, maxOutputTokens: 220 + rs.length * 130,
    prompt: `Briefing: ${briefing}\nBewerte JEDE der ${rs.length} Richtungen: anwendbar (1-5), fuehlbar (1-5), ` +
      `versagen (ein Satz konkreter Schwachpunkt — oder "trägt"). Gib genau ${rs.length} scores in DERSELBEN Reihenfolge:\n${list}`,
  });
  return out.scores;
}

async function main() {
  const all: (Res & { briefing: string; anwendbar: number; fuehlbar: number; versagen: string })[] = [];
  for (const b of BRIEFINGS) {
    console.log(`\n\n████ ${b.id.toUpperCase()} — ${b.text}`);
    for (const run of [runSynthese, runPersona]) {
      try {
        const rs = await run(b.text);
        const js = await judge(b.text, rs);
        rs.forEach((r, i) => {
          const j = js[i] ?? { anwendbar: NaN, fuehlbar: NaN, versagen: "—" };
          all.push({ briefing: b.id, ...r, ...j });
          console.log(`\n  [${r.engine}] «${r.leitwert}»   anwendbar ${j.anwendbar}/5 · fuehlbar ${j.fuehlbar}/5`);
          console.log(`     Welten: ${r.worlds}`);
          console.log(`     Mood: ${r.mood} | Palette: ${r.palette.join(" ") || "(aus Vektor abgeleitet)"}`);
          r.designs.forEach((d) => console.log(`     ▷ ${d.title} — ${d.description}`));
          console.log(`     ✗ ${j.versagen}`);
        });
      } catch (err) {
        console.log(`  ✗ ${String(err).slice(0, 180)}`);
      }
    }
  }
  const byEngine: Record<string, { a: number[]; f: number[] }> = {};
  for (const r of all) {
    (byEngine[r.engine] ??= { a: [], f: [] });
    if (!Number.isNaN(r.anwendbar)) byEngine[r.engine].a.push(r.anwendbar);
    if (!Number.isNaN(r.fuehlbar)) byEngine[r.engine].f.push(r.fuehlbar);
  }
  const avg = (xs: number[]) => (xs.length ? (xs.reduce((s, x) => s + x, 0) / xs.length).toFixed(2) : "–");
  console.log("\n\n████ ZUSAMMENFASSUNG (anwendbar / fühlbar, 1–5, streng)");
  for (const [e, v] of Object.entries(byEngine)) {
    console.log(`  ${e.padEnd(10)} anwendbar ${avg(v.a)} · fühlbar ${avg(v.f)}  (n=${v.a.length})`);
  }
  writeFileSync("/tmp/eval-vibe.json", JSON.stringify(all, null, 2));
  console.log("\n→ /tmp/eval-vibe.json");
}
main().catch((e) => { console.error(e); process.exit(1); });

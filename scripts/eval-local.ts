/**
 * LOCAL eval — runs the REAL engine logic directly via genObject with the gateway key in env, so the
 * CURRENT code is evaluable without a deploy. Prompts come from the YAML (via setup.generated + fill),
 * so this stays in sync with the endpoints automatically.
 *   AI_GATEWAY_API_KEY=… npx tsx scripts/eval-local.ts
 */
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { fill, genObject, modelFor } from "../api/_lib/gateway.js";
import { judgeBatchSchema, personaListSchema, workbenchSchema } from "../api/_lib/schema.js";
import {
  JUDGE_BLANK,
  JUDGE_PROMPT,
  JUDGE_SYSTEM,
  MATERIALIST_EXTRACT_PROMPT,
  MATERIALIST_EXTRACT_SYSTEM,
  MATERIALIST_WORLD_BLANK,
  MATERIALIST_WORLD_PROMPT,
  MATERIALIST_WORLD_SYSTEM,
  PERSONA_BLANK,
  PERSONA_PROMPT,
  PERSONA_SYSTEM,
  SYNTHESE_BLANK,
  SYNTHESE_PROMPT,
  SYNTHESE_SYSTEM,
} from "../api/_lib/setup.generated.js";

const BRIEFINGS = [
  { id: "gin", text: "Craft-Gin aus Berlin, soll weg vom Wacholder-und-Botanicals-Klischee" },
  { id: "saas", text: "B2B-SaaS fürs Lager-/Logistik-Management, muss Vertrauen und Tech-Kompetenz ausstrahlen" },
  { id: "kosmetik", text: "Naturkosmetik-Marke, ehrlich und warm, ohne Greenwashing-Blätter-Optik" },
];

type Card = { engine: string; leitwert: string; world: string; scene: string; mood: string };
const worlds = (ws: { name: string }[]) => ws.map((w) => w.name).join(" × ");

async function runSynthese(ctx: string, n: number): Promise<Card[]> {
  const out = await genObject({ model: modelFor("strong"), schema: workbenchSchema, system: SYNTHESE_SYSTEM, noCache: true,
    prompt: fill(SYNTHESE_PROMPT, { ctx: ctx || SYNTHESE_BLANK, steer: "", n }) });
  return out.candidates.map((b) => ({ engine: "synthese", leitwert: b.leitwert, world: worlds(b.worlds), scene: b.creativeDerivation, mood: b.mood }));
}
async function runPersona(ctx: string, n: number): Promise<Card[]> {
  const out = await genObject({ model: modelFor("strong"), schema: personaListSchema, system: PERSONA_SYSTEM, noCache: true,
    prompt: fill(PERSONA_PROMPT, { ctx: ctx || PERSONA_BLANK, n }) });
  return out.personas.map((p) => ({ engine: "persona", leitwert: p.leitwert, world: "Persona", scene: p.persona, mood: p.mood }));
}

const mWorld = z.object({ worlds: z.array(z.object({ world: z.string(), domain: z.string(), innerLogic: z.string() })) });
const mExtract = z.object({ results: z.array(z.object({ leitwert: z.string(), anchors: z.array(z.object({ layer: z.string(), anchor: z.string(), why: z.string() })), mood: z.string() })) });
async function runMaterialist(ctx: string, n: number): Promise<Card[]> {
  const w = await genObject({ model: modelFor("strong"), schema: mWorld, system: MATERIALIST_WORLD_SYSTEM, noCache: true,
    prompt: fill(MATERIALIST_WORLD_PROMPT, { ctx: ctx || MATERIALIST_WORLD_BLANK, n }) });
  const list = w.worlds.map((x, i) => `${i + 1}. ${x.world} [${x.domain}] — innere Logik: ${x.innerLogic}`).join("\n");
  const e = await genObject({ model: modelFor("strong"), schema: mExtract, system: MATERIALIST_EXTRACT_SYSTEM, noCache: true,
    prompt: fill(MATERIALIST_EXTRACT_PROMPT, { ctx, count: w.worlds.length, list }) });
  return e.results.map((r, i) => ({ engine: "materialist", leitwert: r.leitwert, world: (w.worlds[i]?.world ?? "—").slice(0, 90), scene: r.anchors.map((a) => `${a.layer}: ${a.anchor}`).join(" · "), mood: r.mood }));
}

async function batchJudge(briefing: string, cards: Card[]): Promise<number[]> {
  if (!cards.length) return [];
  const list = cards.map((c, i) => `${i + 1}. Leitwert «${c.leitwert}» — Szene: ${c.scene || "—"} — Mood: ${c.mood || "—"}`).join("\n");
  try {
    const out = await genObject({ model: modelFor("cheap"), schema: judgeBatchSchema, system: JUDGE_SYSTEM, maxOutputTokens: 256 + cards.length * 140,
      prompt: fill(JUDGE_PROMPT, { briefing: briefing || JUDGE_BLANK, count: cards.length, list }) });
    return out.scores.map((s) => { const ax = [s.onTarget, s.surprise, s.craft, s.designValue].filter((x): x is number => typeof x === "number"); return ax.reduce((a, b) => a + b, 0) / ax.length; });
  } catch { return cards.map(() => NaN); }
}

const ENGINES = [
  { id: "synthese", run: runSynthese },
  { id: "persona", run: runPersona },
  { id: "materialist", run: runMaterialist },
];

async function main() {
  const N = 4;
  const all: Record<string, { briefing: string; cards: (Card & { score: number })[] }[]> = {};
  for (const b of BRIEFINGS) {
    console.log(`\n■ ${b.id}: ${b.text}`);
    for (const e of ENGINES) {
      try {
        const cards = await e.run(b.text, N);
        const scores = await batchJudge(b.text, cards);
        const scored = cards.map((c, i) => ({ ...c, score: scores[i] ?? NaN }));
        (all[e.id] ??= []).push({ briefing: b.id, cards: scored });
        console.log(`  ✓ ${e.id.padEnd(12)} ${cards.length} cards`);
        for (const c of scored) console.log(`     [${(c.score || 0).toFixed(1)}] ${c.leitwert}  ⟨${c.world}⟩`);
      } catch (err) {
        console.log(`  ✗ ${e.id.padEnd(12)} ${String(err).slice(0, 140)}`);
      }
    }
  }
  writeFileSync("/tmp/eval-local.json", JSON.stringify(all, null, 2));
  console.log("\n→ /tmp/eval-local.json");
}
main().catch((e) => { console.error(e); process.exit(1); });

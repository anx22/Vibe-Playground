/**
 * LOCAL eval — runs the REAL engine logic (mirrored from api/*.ts) directly via genObject with the
 * gateway key in env, so the CURRENT code is evaluable without a deploy. Mirrors the handlers' prompt
 * construction (keep in sync if they change). Includes a prototype run of the Materialist YAML method.
 *   AI_GATEWAY_API_KEY=… npx tsx scripts/eval-local.ts
 */
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { cosineDist, embed, genObject, modelFor } from "../api/_lib/gateway.js";
import {
  bridgesSchema,
  divergeSchema,
  entangleSchema,
  judgeBatchSchema,
  personaListSchema,
  workbenchSchema,
} from "../api/_lib/schema.js";
import {
  ENTANGLE_SYSTEM,
  JUDGE_SYSTEM,
  LATENT_COMPOSE_SYSTEM,
  LATENT_DIVERGE_SYSTEM,
  MATERIALIST_EXTRACT_SYSTEM,
  MATERIALIST_WORLD_SYSTEM,
  PERSONA_SYSTEM,
  WORKBENCH_SYSTEM,
} from "../api/_lib/setup.generated.js";

const BRIEFINGS = [
  { id: "gin", text: "Craft-Gin aus Berlin, soll weg vom Wacholder-und-Botanicals-Klischee" },
  { id: "saas", text: "B2B-SaaS fürs Lager-/Logistik-Management, muss Vertrauen und Tech-Kompetenz ausstrahlen" },
  { id: "kosmetik", text: "Naturkosmetik-Marke, ehrlich und warm, ohne Greenwashing-Blätter-Optik" },
];

type Card = { engine: string; leitwert: string; world: string; scene: string; mood: string };
const worlds = (ws: { name: string }[]) => ws.map((w) => w.name).join(" × ");

async function runEntangle(ctx: string, n: number): Promise<Card[]> {
  const out = await genObject({ model: modelFor("strong"), schema: entangleSchema, system: ENTANGLE_SYSTEM, noCache: true,
    prompt: `Thema/Briefing: ${ctx}.\nErzeuge ${n} Brücken, jede über VERSCHIEDENE ferne Domänen.` });
  return out.bridges.map((b) => ({ engine: "entanglement", leitwert: b.leitwert, world: worlds(b.worlds), scene: b.creativeDerivation, mood: b.mood }));
}
async function runWorkbench(ctx: string, n: number): Promise<Card[]> {
  const out = await genObject({ model: modelFor("strong"), schema: workbenchSchema, system: WORKBENCH_SYSTEM, noCache: true,
    prompt: `Briefing: ${ctx}.\nÜber-generiere intern (≥3×), eliminiere ≥⅔, und gib ${n} kuratierte Kandidaten über 3–4 orthogonale Geschmacksrichtungen zurück.` });
  return out.candidates.map((b) => ({ engine: "workbench", leitwert: b.leitwert, world: worlds(b.worlds), scene: b.creativeDerivation, mood: b.mood }));
}
async function runPersona(ctx: string, n: number): Promise<Card[]> {
  const out = await genObject({ model: modelFor("strong"), schema: personaListSchema, system: PERSONA_SYSTEM, noCache: true,
    prompt: `Briefing: ${ctx}\nErzeuge ${n} VERSCHIEDENE Personas, aus denen je ein klarer Vibe fällt.` });
  return out.personas.map((p) => ({ engine: "persona", leitwert: p.leitwert, world: "Persona", scene: p.persona, mood: p.mood }));
}
async function runLatent(ctx: string, n: number): Promise<Card[]> {
  const dv = await genObject({ model: modelFor("strong"), schema: divergeSchema, system: LATENT_DIVERGE_SYSTEM, noCache: true,
    prompt: `Thema/Briefing: ${ctx}.\nLiefere essence, forbidden[] und 14 weit gestreute Spender-Welten.` });
  let shortlist = dv.donors;
  if (dv.donors.length > 3) {
    try {
      const vecs = await embed([dv.essence, ...dv.donors.map((d) => `${d.world} — ${d.gist}`)]);
      const scored = dv.donors.map((d, i) => ({ d, dist: cosineDist(vecs[0], vecs[i + 1]) })).filter((s) => Number.isFinite(s.dist)).sort((a, b) => b.dist - a.dist);
      const keep = Math.max(4, Math.round(scored.length * 0.55));
      if (scored.length) shortlist = scored.slice(0, keep).map((s) => s.d);
    } catch { /* no embeddings → full field */ }
  }
  const cp = await genObject({ model: modelFor("strong"), schema: bridgesSchema, system: LATENT_COMPOSE_SYSTEM, noCache: true,
    prompt: `ESSENZ: ${dv.essence}\nVERBOTEN: ${dv.forbidden.join(", ")}\nGemessen-FERNE Spender-Welten:\n${shortlist.map((d) => `- ${d.world}: ${d.gist}`).join("\n")}\nKomponiere ${n} Brücken über VERSCHIEDENE Verhaltens-Zellen.` });
  return cp.bridges.map((b) => ({ engine: "latent", leitwert: b.leitwert, world: worlds(b.worlds), scene: b.creativeDerivation, mood: b.mood }));
}

// Materialist (prototype run of the YAML design): N worlds → harvest the strongest anchors from each.
const mWorld = z.object({ worlds: z.array(z.object({ world: z.string(), domain: z.string(), innerLogic: z.string() })) });
const mExtract = z.object({ results: z.array(z.object({ leitwert: z.string(), anchors: z.array(z.object({ layer: z.string(), anchor: z.string(), why: z.string() })), mood: z.string() })) });
async function runMaterialist(ctx: string, n: number): Promise<Card[]> {
  const w = await genObject({ model: modelFor("strong"), schema: mWorld, system: MATERIALIST_WORLD_SYSTEM, noCache: true,
    prompt: `Thema/Briefing: ${ctx}.\nBeschwöre ${n} VERSCHIEDENE, weit gestreute Welten (je 2–3 Sätze Kopfkino), fern vom Klischee.` });
  const list = w.worlds.map((x, i) => `${i + 1}. ${x.world} [${x.domain}] — innere Logik: ${x.innerLogic}`).join("\n");
  const e = await genObject({ model: modelFor("strong"), schema: mExtract, system: MATERIALIST_EXTRACT_SYSTEM, noCache: true,
    prompt: `Briefing: ${ctx}.\nErnte aus JEDER der ${w.worlds.length} Welten die 2–3 stärksten Design-Anker (Material/Form/Anordnung/Farbe-Licht/Geste). Gib ${w.worlds.length} results[] in DERSELBEN Reihenfolge:\n${list}` });
  return e.results.map((r, i) => ({ engine: "materialist", leitwert: r.leitwert, world: (w.worlds[i]?.world ?? "—").slice(0, 90), scene: r.anchors.map((a) => `${a.layer}: ${a.anchor}`).join(" · "), mood: r.mood }));
}

async function batchJudge(briefing: string, cards: Card[]): Promise<number[]> {
  if (!cards.length) return [];
  const list = cards.map((c, i) => `${i + 1}. Leitwert «${c.leitwert}» — Szene: ${c.scene || "—"} — Mood: ${c.mood || "—"}`).join("\n");
  try {
    const out = await genObject({ model: modelFor("cheap"), schema: judgeBatchSchema, system: JUDGE_SYSTEM, maxOutputTokens: 256 + cards.length * 140,
      prompt: `Briefing: ${briefing}\nBewerte JEDE der ${cards.length} Richtungen streng. Gib ${cards.length} scores[] in Reihenfolge:\n${list}` });
    return out.scores.map((s) => { const ax = [s.onTarget, s.surprise, s.craft, s.designValue].filter((x): x is number => typeof x === "number"); return ax.reduce((a, b) => a + b, 0) / ax.length; });
  } catch { return cards.map(() => NaN); }
}

const ENGINES = [
  { id: "entanglement", run: runEntangle },
  { id: "latent", run: runLatent },
  { id: "workbench", run: runWorkbench },
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

/**
 * Headless eval — compare the engines (Verschränkung / Latent-Agent / Werkbank / Persona) on the judge.
 *
 *   VIBE_API_BASE=https://vibedesign-two.vercel.app npm run eval -- --judge
 *   …  --judge-tier premium     # grade on Opus (strict)
 *   …  --n 3                     # candidates per briefing
 *
 * Per briefing × engine: the Leitwerte (+ world/scene) and, with --judge, the quality
 * scorecard — onTarget × surprise × craft (would a senior AD pitch this to THIS client?).
 */
import {
  generateBridges,
  generateLatent,
  generatePersonas,
  generateWorkbench,
  judge,
  setApiBase,
} from "../src/llm/client";

const BRIEFINGS = [
  { id: "synth", label: "Synth-Label", text: "Rebrand für ein Synthesizer-Label, das von Software auf modulare Hardware umstellt — technisch, aber mit Handschrift." },
  { id: "kanzlei", label: "Kanzlei", text: "Website für eine Anwaltskanzlei, traditionsbewusst und seriös, aber komplett digital und zugänglich." },
  { id: "festival", label: "Festival", text: "Identität für ein Elektronik-Festival in einer alten Industriehalle — laut, roh, körperlich." },
  { id: "euchner", label: "Sicherheitstechnik", text: "Hersteller für Sicherheitskomponenten für Industrieanlagen (Schutztüren, Zuhaltungen, Not-Halt), ingenieursgetrieben, höchste Zuverlässigkeit." },
  { id: "roesterei", label: "Rösterei", text: "Verpackung für eine Spezialitätenkaffee-Rösterei, handwerklich und warm, die sich von Retro-Nostalgie absetzen will." },
  { id: "museum", label: "Museum", text: "Leitsystem für ein archäologisches Museum, das antike Funde mit zeitgenössischer Ausstellungsarchitektur kontrastiert." },
];

const arg = (flag: string, def: string) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? String(process.argv[i + 1]) : def;
};
const has = (flag: string) => process.argv.includes(flag);
const bar = (n: number, lo = 1, hi = 5) => {
  const f = Math.max(0, Math.min(1, (n - lo) / (hi - lo)));
  return "█".repeat(Math.round(f * 10)).padEnd(10, "·");
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Judge with retry — the premium (Opus) tier rate-limits (502) without gateway fallback. */
async function judgeRetry(input: { briefing: string; leitwert: string; scene?: string; mood: string }, tier: "cheap" | "strong" | "premium", tries = 5) {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await judge(input, tier);
    } catch (e) {
      last = e;
      await sleep(2000 * 2 ** i);
    }
  }
  throw last;
}

type Card = { leitwert: string; world: string; scene: string; mood: string };
const worldsOf = (ws: { name: string }[]) => ws.map((w) => w.name).join(" × ");

async function genEntangle(briefing: string, n: number): Promise<Card[]> {
  const { bridges } = await generateBridges({ briefing, n, tier: "strong" });
  return bridges.map((b) => ({ leitwert: b.leitwert, world: worldsOf(b.worlds), scene: b.creativeDerivation, mood: b.mood }));
}
async function genLatent(briefing: string, n: number): Promise<Card[]> {
  const { bridges } = await generateLatent({ briefing, n });
  return bridges.map((b) => ({ leitwert: b.leitwert, world: worldsOf(b.worlds), scene: b.creativeDerivation, mood: b.mood }));
}
async function genWorkbench(briefing: string, n: number): Promise<Card[]> {
  const cs = await generateWorkbench({ briefing, n });
  return cs.map((c) => ({ leitwert: c.leitwert, world: worldsOf(c.worlds), scene: c.creativeDerivation, mood: c.mood }));
}
async function genPersona(briefing: string, n: number): Promise<Card[]> {
  const ps = await generatePersonas({ briefing, n, tier: "strong" });
  return ps.map((p) => ({ leitwert: p.leitwert, world: "Persona", scene: p.persona, mood: p.mood }));
}

async function main() {
  const n = Number(arg("--n", "4"));
  const useJudge = has("--judge");
  const judgeTier = arg("--judge-tier", "cheap") as "cheap" | "strong" | "premium";
  const base = process.env.VIBE_API_BASE ?? "";
  if (!base) {
    console.error("  needs a live gateway: set VIBE_API_BASE=https://<app>.vercel.app");
    process.exit(1);
  }
  setApiBase(base);

  const engines: { id: string; gen: (b: string, n: number) => Promise<Card[]> }[] = [
    { id: "entanglement", gen: genEntangle },
    { id: "latent", gen: genLatent },
    { id: "workbench", gen: genWorkbench },
    { id: "persona", gen: genPersona },
  ];

  console.log(`\n  VIBE EVAL · ${engines.map((e) => e.id).join(" · ")}   n=${n}  judge=${useJudge ? judgeTier : "off"}  (${base})`);

  type Agg = { tgt: number; surp: number; craft: number; rend: number; n: number };
  const aggs: Record<string, Agg> = Object.fromEntries(
    engines.map((e) => [e.id, { tgt: 0, surp: 0, craft: 0, rend: 0, n: 0 }]),
  );

  for (const b of BRIEFINGS) {
    console.log(`\n${"─".repeat(78)}\n■ ${b.label}   "${b.text}"`);
    for (const e of engines) {
      let cards: Card[] = [];
      try {
        cards = await e.gen(b.text, n);
      } catch (err) {
        console.log(`\n  ▸ ${e.id}\n      ✗ ${String(err)}`);
        continue;
      }
      console.log(`\n  ▸ ${e.id}`);
      for (const c of cards) {
        console.log(`      ● ${c.leitwert}  [${c.world}]  — ${c.mood}`);
        console.log(`        ${c.scene}`);
        if (useJudge) {
          try {
            const s = await judgeRetry({ briefing: b.text, leitwert: c.leitwert, scene: c.scene, mood: c.mood }, judgeTier);
            const a = aggs[e.id];
            a.tgt += s.onTarget; a.surp += s.surprise; a.craft += s.craft; a.rend += s.renderability; a.n++;
            console.log(`        \x1b[2monTgt ${s.onTarget} · surp ${s.surprise} · craft ${s.craft} · rend ${s.renderability} — ${s.note}\x1b[0m`);
          } catch (err) {
            console.log(`        ✗ judge: ${String(err)}`);
          }
        }
      }
    }
  }

  if (useJudge) {
    console.log(`\n${"─".repeat(78)}\n  SCORECARD (judge=${judgeTier})`);
    console.log(`    ${"engine".padEnd(10)} onTgt surp craft rend   overall`);
    for (const id of Object.keys(aggs)) {
      const a = aggs[id];
      if (!a.n) continue;
      const tgt = a.tgt / a.n, surp = a.surp / a.n, craft = a.craft / a.n, rend = a.rend / a.n;
      const overall = (tgt + surp + craft + rend) / 4;
      const f = (x: number) => x.toFixed(2).padStart(5);
      console.log(`    ${id.padEnd(10)}${f(tgt)}${f(surp)}${f(craft)}${f(rend)}   ${bar(overall)} ${overall.toFixed(2)}`);
    }
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

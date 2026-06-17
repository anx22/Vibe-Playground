/**
 * Headless eval — compare the two creative derivations (Analogie / Persona) on the new judge.
 *
 *   VIBE_API_BASE=https://vibedesign-two.vercel.app npm run eval -- --judge
 *   …  --judge-tier premium     # grade on Opus (strict)
 *   …  --n 3                     # directions per briefing
 *
 * Per briefing × engine: the Leitwerte (+ world/core/scene) and, with --judge, the quality
 * scorecard — onTarget × surprise × craft (would a senior AD pitch this to THIS client?).
 */
import { generateAnalogies, generatePersona, judge, setApiBase } from "../src/llm/client";
import type { Direction } from "../src/llm/schema";

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

type Card = { leitwert: string; world: string; core: string; scene: string; mood: string };

async function genAnalogy(briefing: string, n: number): Promise<Card[]> {
  const dirs: Direction[] = await generateAnalogies({ briefing, n, tier: "strong" });
  return dirs.map((d) => ({ leitwert: d.leitwert, world: d.world, core: d.core, scene: d.scene, mood: d.mood }));
}
async function genPersona(briefing: string, n: number): Promise<Card[]> {
  const ps = await Promise.all(Array.from({ length: n }, () => generatePersona({ briefing, tier: "strong" })));
  return ps.map((p) => ({ leitwert: p.leitwert, world: "Persona", core: "—", scene: p.persona, mood: p.mood }));
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
    { id: "analogy", gen: genAnalogy },
    { id: "persona", gen: genPersona },
  ];

  console.log(`\n  VIBE EVAL · Analogie vs Persona   n=${n}  judge=${useJudge ? judgeTier : "off"}  (${base})`);

  type Agg = { tgt: number; surp: number; craft: number; n: number };
  const aggs: Record<string, Agg> = { analogy: { tgt: 0, surp: 0, craft: 0, n: 0 }, persona: { tgt: 0, surp: 0, craft: 0, n: 0 } };

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
            a.tgt += s.onTarget; a.surp += s.surprise; a.craft += s.craft; a.n++;
            console.log(`        \x1b[2monTgt ${s.onTarget} · surp ${s.surprise} · craft ${s.craft} — ${s.note}\x1b[0m`);
          } catch (err) {
            console.log(`        ✗ judge: ${String(err)}`);
          }
        }
      }
    }
  }

  if (useJudge) {
    console.log(`\n${"─".repeat(78)}\n  SCORECARD (judge=${judgeTier})`);
    console.log(`    ${"engine".padEnd(10)} onTgt surp craft   overall`);
    for (const id of Object.keys(aggs)) {
      const a = aggs[id];
      if (!a.n) continue;
      const tgt = a.tgt / a.n, surp = a.surp / a.n, craft = a.craft / a.n;
      const overall = (tgt + surp + craft) / 3;
      const f = (x: number) => x.toFixed(2).padStart(5);
      console.log(`    ${id.padEnd(10)}${f(tgt)}${f(surp)}${f(craft)}   ${bar(overall)} ${overall.toFixed(2)}`);
    }
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

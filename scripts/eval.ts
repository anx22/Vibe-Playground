/**
 * Headless eval harness for the engines (Verschränkung · Latent-Agent · Werkbank · Persona).
 * Robust by construction: every network call is timeout-bounded + retried, a failed call is RECORDED
 * (engine · briefing · error · ms) and never aborts the run, and the end prints a FAILURES block plus a
 * scorecard for whatever succeeded. `--in` makes a run fully deterministic & offline (score a frozen
 * sample, zero generation) — the "exact test run".
 *
 *   VIBE_API_BASE=https://<app>.vercel.app npx tsx scripts/eval.ts [flags]
 *   npx tsx scripts/eval.ts --in fixture.json                 # deterministic, offline, no network
 *
 * Flags:
 *   --metrics              deterministic objective scorecard (default when --judge absent)
 *   --judge [--judge-tier cheap|strong|premium]   LLM-judge scorecard (subjective, costs calls)
 *   --engines a,b          subset of engine ids        --briefings x,y   subset of briefing ids
 *   --n <int>              candidates per cell (4)      --timeout <ms>    per-call cap (45000), never hang
 *   --retries <int>        per-call retries (1)         --out <file>      freeze the generated sample
 *   --in <file>            score a frozen sample        --report <file>   write a structured JSON report
 *   --quiet                less per-card chatter
 */
import { readFileSync, writeFileSync } from "node:fs";
import {
  generateBridges,
  generateLatent,
  generatePersonas,
  generateWorkbench,
  judge,
  setApiBase,
  setRequestTimeout,
} from "../src/llm/client";
import { ANTI_CORPUS } from "../api/_lib/corpus/anticorpus";
import { antiCliche, antiCorpusTokens, concreteness, distinctness, leitwertFormat } from "../src/llm/metrics";

type Tier = "cheap" | "strong" | "premium";
type Card = { leitwert: string; world: string; scene: string; mood: string; briefing?: string };

const BRIEFINGS = [
  { id: "synth", label: "Synth-Label", text: "Rebrand für ein Synthesizer-Label, das von Software auf modulare Hardware umstellt — technisch, aber mit Handschrift." },
  { id: "kanzlei", label: "Kanzlei", text: "Website für eine Anwaltskanzlei, traditionsbewusst und seriös, aber komplett digital und zugänglich." },
  { id: "festival", label: "Festival", text: "Identität für ein Elektronik-Festival in einer alten Industriehalle — laut, roh, körperlich." },
  { id: "euchner", label: "Sicherheitstechnik", text: "Hersteller für Sicherheitskomponenten für Industrieanlagen (Schutztüren, Zuhaltungen, Not-Halt), ingenieursgetrieben, höchste Zuverlässigkeit." },
  { id: "roesterei", label: "Rösterei", text: "Verpackung für eine Spezialitätenkaffee-Rösterei, handwerklich und warm, die sich von Retro-Nostalgie absetzen will." },
  { id: "museum", label: "Museum", text: "Leitsystem für ein archäologisches Museum, das antike Funde mit zeitgenössischer Ausstellungsarchitektur kontrastiert." },
];

const worldsOf = (ws: { name: string }[]) => ws.map((w) => w.name).join(" × ");
const ENGINES: { id: string; gen: (b: string, n: number) => Promise<Card[]> }[] = [
  { id: "entanglement", gen: async (b, n) => (await generateBridges({ briefing: b, n, tier: "strong" })).bridges.map((x) => ({ leitwert: x.leitwert, world: worldsOf(x.worlds), scene: x.creativeDerivation, mood: x.mood })) },
  { id: "latent", gen: async (b, n) => (await generateLatent({ briefing: b, n })).bridges.map((x) => ({ leitwert: x.leitwert, world: worldsOf(x.worlds), scene: x.creativeDerivation, mood: x.mood })) },
  { id: "workbench", gen: async (b, n) => (await generateWorkbench({ briefing: b, n })).map((x) => ({ leitwert: x.leitwert, world: worldsOf(x.worlds), scene: x.creativeDerivation, mood: x.mood })) },
  { id: "persona", gen: async (b, n) => (await generatePersonas({ briefing: b, n, tier: "strong" })).map((p) => ({ leitwert: p.leitwert, world: "Persona", scene: p.persona, mood: p.mood })) },
];

// ── cli ──
const argv = process.argv.slice(2);
const has = (f: string) => argv.includes(f);
const arg = (f: string, d: string) => { const i = argv.indexOf(f); return i >= 0 ? String(argv[i + 1]) : d; };
const list = (f: string) => arg(f, "").split(",").map((s) => s.trim()).filter(Boolean);

// ── helpers ──
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const c = { ok: (s: string) => `\x1b[32m${s}\x1b[0m`, bad: (s: string) => `\x1b[31m${s}\x1b[0m`, dim: (s: string) => `\x1b[2m${s}\x1b[0m` };
const bar = (n: number) => "█".repeat(Math.round(Math.max(0, Math.min(1, n)) * 10)).padEnd(10, "·");

interface CallResult<T> { ok: boolean; value?: T; error?: string; ms: number; tries: number; }
/** Timeout + retry around any async call; resolves to a result object — it NEVER throws or hangs. */
async function attempt<T>(fn: () => Promise<T>, retries: number): Promise<CallResult<T>> {
  const t0 = Date.now();
  let error = "";
  for (let i = 0; i <= retries; i++) {
    try {
      return { ok: true, value: await fn(), ms: Date.now() - t0, tries: i + 1 };
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      if (i < retries) await sleep(800 * 2 ** i);
    }
  }
  return { ok: false, error, ms: Date.now() - t0, tries: retries + 1 };
}

interface Failure { engine: string; briefing: string; error: string; ms: number; }
interface EngineReport { format?: number; concreteness?: number; antiCliche?: number; distinctness?: number; overall: number | null; n: number; latencyMs?: number; retries?: number; judge?: Record<string, number>; }
interface Report { mode: string; n: number; failures: Failure[]; engines: Record<string, EngineReport>; weakest: string | null; }

async function main() {
  const inFile = arg("--in", "");
  const outFile = arg("--out", "");
  const reportFile = arg("--report", "");
  const n = Number(arg("--n", "4"));
  const timeout = Number(arg("--timeout", "45000"));
  const retries = Number(arg("--retries", "1"));
  const quiet = has("--quiet");
  const useJudge = has("--judge");
  const judgeTier = arg("--judge-tier", "cheap") as Tier;
  const useMetrics = has("--metrics") || !useJudge;
  const engines = ENGINES.filter((e) => !list("--engines").length || list("--engines").includes(e.id));
  const anti = antiCorpusTokens(ANTI_CORPUS);

  const batches: Record<string, Card[][]> = {};
  for (const e of engines) batches[e.id] = [];
  const failures: Failure[] = [];
  const timing: Record<string, { ms: number; tries: number; cells: number }> = {};
  for (const e of engines) timing[e.id] = { ms: 0, tries: 0, cells: 0 };

  // ── source: frozen fixture (offline, deterministic) OR live generation (timeout-bounded) ──
  if (inFile) {
    console.log(`\n  VIBE EVAL · scoring frozen fixture ${c.dim(inFile)}  ${c.ok("(deterministic · offline)")}`);
    const loaded = JSON.parse(readFileSync(inFile, "utf8")) as Record<string, Card[][]>;
    for (const id of Object.keys(loaded)) batches[id] = loaded[id];
  } else {
    const base = process.env.VIBE_API_BASE ?? "";
    if (!base) { console.error(c.bad("  needs VIBE_API_BASE=https://<app>.vercel.app  (or --in <fixture> for offline)")); process.exit(2); }
    setApiBase(base);
    setRequestTimeout(timeout);
    const briefings = BRIEFINGS.filter((b) => !list("--briefings").length || list("--briefings").includes(b.id));
    console.log(`\n  VIBE EVAL · generate  engines=[${engines.map((e) => e.id).join(",")}]  briefings=${briefings.length}  n=${n}  timeout=${timeout}ms  retries=${retries}\n  ${c.dim(base)}`);
    for (const b of briefings) {
      console.log(`\n■ ${b.label}  ${c.dim(`"${b.text.slice(0, 60)}…"`)}`);
      for (const e of engines) {
        const r = await attempt(() => e.gen(b.text, n), retries);
        if (r.ok && r.value) {
          for (const card of r.value) card.briefing = b.text;
          batches[e.id].push(r.value);
          timing[e.id].ms += r.ms; timing[e.id].tries += r.tries; timing[e.id].cells += 1;
          console.log(`   ${c.ok("✓")} ${e.id.padEnd(12)} ${String(r.value.length).padStart(2)} cards  ${c.dim(`${r.ms}ms${r.tries > 1 ? ` ·${r.tries}t` : ""}`)}`);
          if (!quiet) for (const card of r.value) console.log(c.dim(`        ● ${card.leitwert}   [${card.world}]`));
        } else {
          failures.push({ engine: e.id, briefing: b.id, error: r.error ?? "?", ms: r.ms });
          console.log(`   ${c.bad("✗")} ${e.id.padEnd(12)} ${c.bad(r.error ?? "fail")}  ${c.dim(`${r.ms}ms`)}`);
        }
      }
    }
    if (outFile) { writeFileSync(outFile, JSON.stringify(batches, null, 2)); console.log(c.dim(`\n  sample frozen → ${outFile}`)); }
  }

  const report: Report = { mode: inFile ? "fixture" : "live", n, failures, engines: {}, weakest: null };

  // ── deterministic objective scorecard ──
  if (useMetrics) {
    console.log(`\n${"─".repeat(72)}\n  DETERMINISTIC SCORECARD ${c.dim("· objective · no judge · reproducible")}`);
    console.log(`    ${"engine".padEnd(12)} format conc  anti  distinct   overall  n`);
    const scored: { id: string; overall: number }[] = [];
    for (const e of engines) {
      const bs = (batches[e.id] ?? []).filter((b) => b.length);
      const all = bs.flat();
      if (!all.length) { console.log(`    ${e.id.padEnd(12)} ${c.bad("(no output)")}`); report.engines[e.id] = { overall: null, n: 0 }; continue; }
      const format = mean(all.map((x) => leitwertFormat(x.leitwert)));
      const conc = mean(all.map((x) => concreteness(x.leitwert)));
      const cl = mean(all.map((x) => antiCliche(`${x.leitwert} ${x.world}`, anti)));
      const dist = mean(bs.map((b) => distinctness(b.map((x) => x.leitwert))));
      const overall = 0.3 * format + 0.2 * conc + 0.25 * cl + 0.25 * dist;
      const f = (x: number) => x.toFixed(2).padStart(5);
      console.log(`    ${e.id.padEnd(12)}${f(format)} ${f(conc)} ${f(cl)} ${f(dist)}   ${bar(overall)} ${overall.toFixed(2)}  ${all.length}`);
      report.engines[e.id] = { format, concreteness: conc, antiCliche: cl, distinctness: dist, overall, n: all.length };
      scored.push({ id: e.id, overall });
    }
    scored.sort((a, b) => a.overall - b.overall);
    if (scored.length) {
      report.weakest = scored[0].id;
      console.log(`\n  ▶ weakest: ${c.bad(scored[0].id)} (${scored[0].overall.toFixed(2)})    strongest: ${c.ok(scored[scored.length - 1].id)} (${scored[scored.length - 1].overall.toFixed(2)})`);
    }
  }

  // ── observed (empirical) latency + reliability — the north-star (speed) differentiator ──
  if (!inFile && Object.values(timing).some((t) => t.cells)) {
    console.log(`\n  OBSERVED ${c.dim("· empirical latency · reliability")}`);
    console.log(`    ${"engine".padEnd(12)} latency  retries`);
    for (const e of engines) {
      const t = timing[e.id];
      if (!t.cells) { console.log(`    ${e.id.padEnd(12)} ${c.bad("—")}`); continue; }
      const meanMs = Math.round(t.ms / t.cells);
      const retries = t.tries - t.cells;
      console.log(`    ${e.id.padEnd(12)} ${(meanMs / 1000).toFixed(1).padStart(6)}s  ${String(retries).padStart(6)}`);
      report.engines[e.id] = { ...(report.engines[e.id] ?? { overall: null, n: 0 }), latencyMs: meanMs, retries };
    }
  }

  // ── LLM-judge scorecard (timeout-bounded, failures recorded) ──
  if (useJudge) {
    setApiBase(process.env.VIBE_API_BASE ?? "");
    setRequestTimeout(timeout);
    console.log(`\n${"─".repeat(72)}\n  JUDGE SCORECARD (${judgeTier}) ${c.dim("· subjective · LLM")}`);
    console.log(`    ${"engine".padEnd(12)} onTgt surp craft dVal   overall  n`);
    for (const e of engines) {
      const all = (batches[e.id] ?? []).flat();
      if (!all.length) { console.log(`    ${e.id.padEnd(12)} ${c.bad("(no output)")}`); continue; }
      let tgt = 0, surp = 0, craft = 0, dv = 0, nn = 0;
      for (const card of all) {
        const r = await attempt(() => judge({ briefing: card.briefing ?? "", leitwert: card.leitwert, scene: card.scene, mood: card.mood }, judgeTier), retries);
        if (r.ok && r.value) { tgt += r.value.onTarget; surp += r.value.surprise; craft += r.value.craft; dv += r.value.designValue; nn++; }
        else failures.push({ engine: e.id, briefing: "judge", error: r.error ?? "?", ms: r.ms });
      }
      if (!nn) { console.log(`    ${e.id.padEnd(12)} ${c.bad("(no scores)")}`); continue; }
      const o = (tgt + surp + craft + dv) / (4 * nn);
      const f = (x: number) => (x / nn).toFixed(2).padStart(5);
      console.log(`    ${e.id.padEnd(12)}${f(tgt)}${f(surp)}${f(craft)}${f(dv)}   ${bar(o)} ${o.toFixed(2)}  ${nn}`);
      report.engines[e.id] = { ...(report.engines[e.id] ?? { overall: null, n: nn }), judge: { onTarget: tgt / nn, surprise: surp / nn, craft: craft / nn, designValue: dv / nn, overall: o, n: nn } };
    }
  }

  // ── failures block — visible at malstate, quiet at success ──
  if (failures.length) {
    console.log(`\n${"─".repeat(72)}\n  ${c.bad(`FAILURES (${failures.length})`)}`);
    for (const f of failures) console.log(`    ${c.bad("✗")} ${f.engine.padEnd(12)} @${f.briefing.padEnd(10)} ${f.error}  ${c.dim(`${f.ms}ms`)}`);
  } else if (!inFile) {
    console.log(`\n  ${c.ok("✓ no failures")}`);
  }

  if (reportFile) { writeFileSync(reportFile, JSON.stringify(report, null, 2)); console.log(c.dim(`  report → ${reportFile}`)); }
  console.log("");
  const produced = Object.values(report.engines).some((e) => e.n > 0);
  process.exit(produced ? 0 : 1);
}

main().catch((e) => {
  console.error(c.bad(`fatal: ${e instanceof Error ? e.stack : String(e)}`));
  process.exit(1);
});

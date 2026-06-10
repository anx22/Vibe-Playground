/**
 * Headless Lab eval — run from the terminal to SEE and compare engine output.
 *
 *   npm run eval                       # offline methods (no key needed)
 *   npm run eval -- --seed 7 --batch 6
 *   VIBE_API_BASE=https://vibedesign-two.vercel.app npm run eval -- --llm
 *                                      # hit the live gateway proxy (LLM methods)
 *
 * Prints, per briefing × method: the metrics (coherence / diversity / novelty) and each
 * Leitwert with its scene/note + axis vector — a readable list we can assess manually.
 */
import { AXES, type AxisVector } from "../src/engine";
import { METHODS, offlineMethods, runLab, type Briefing } from "../src/lab";
import { setApiBase } from "../src/llm/client";

const BRIEFINGS: Briefing[] = [
  { id: "coffee", label: "Kaffeerösterei", text: "handwerklich warm editorial, modern vertrauenswürdig minimal" },
  { id: "co2", label: "CO₂-Dashboard", text: "tech futuristisch dicht, nicht steril warm" },
  { id: "festival", label: "Musikfestival", text: "laut roh brutal, retro vintage dicht" },
  { id: "blank", label: "Blank Slate", text: "" },
];

const arg = (flag: string, def: number) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? Number(process.argv[i + 1]) : def;
};
const has = (flag: string) => process.argv.includes(flag);

const vec = (v: AxisVector) =>
  AXES.map((a) => `${a.slice(0, 3)}${v[a] >= 0 ? "+" : ""}${v[a].toFixed(1)}`).join(" ");

const bar = (n: number, lo = 0, hi = 1) => {
  const f = Math.max(0, Math.min(1, (n - lo) / (hi - lo)));
  return "█".repeat(Math.round(f * 10)).padEnd(10, "·");
};

async function main() {
  const seed = arg("--seed", 42);
  const batch = arg("--batch", 5);
  const useLLM = has("--llm");
  const tier: "cheap" | "strong" = has("--strong") ? "strong" : "cheap";
  const base = process.env.VIBE_API_BASE ?? "";
  if (base) setApiBase(base);

  const methods = useLLM ? METHODS : offlineMethods();
  const run = await runLab(methods, BRIEFINGS, {
    seed,
    batchSize: batch,
    allowLLM: useLLM,
    modelTier: tier,
  });

  console.log(
    `\n  VIBE LAB · eval   seed=${seed} batch=${batch} llm=${useLLM ? `on · ${tier} (${base || "relative"})` : "off"}`,
  );
  if (run.skipped.length) console.log(`  skipped (need LLM): ${run.skipped.join(", ")}`);

  for (const b of BRIEFINGS) {
    console.log(`\n${"─".repeat(78)}\n■ ${b.label}   "${b.text || "(blank slate)"}"`);
    for (const mid of run.methodIds) {
      const cell = run.cells[mid]?.[b.id];
      if (!cell) continue;
      if (cell.error) {
        console.log(`\n  ▸ ${mid}\n      ✗ ${cell.error}`);
        continue;
      }
      const m = cell.metrics;
      console.log(
        `\n  ▸ ${mid.padEnd(18)}  coherence ${bar(m.coherence)} ${(m.coherence * 100).toFixed(0)}%   diversity ${bar(m.diversity, 0, 2.5)} ${m.diversity.toFixed(2)}`,
      );
      for (const c of cell.cards) {
        console.log(`      ${c.coherence.ok ? "✓" : "·"} ${c.leitwert.padEnd(36)} ${c.mood}`);
        console.log(`        ${c.scene ?? c.origin.engineNote}`);
        console.log(`        \x1b[2m${vec(c.vector)}\x1b[0m`);
      }
    }
  }

  // ── Methodology scorecard — how good/bad each method is, standalone ──────────
  console.log(`\n${"─".repeat(78)}\n  SCORECARD (avg across briefings)`);
  console.log(`    ${"method".padEnd(18)} coherence  diversity  novelty(uniq)`);
  let llmCalls = 0;
  for (const mid of run.methodIds) {
    const cells = BRIEFINGS.map((b) => run.cells[mid]?.[b.id]).filter(Boolean);
    const mean = (f: (c: NonNullable<(typeof cells)[number]>) => number) =>
      cells.reduce((s, c) => s + f(c!), 0) / (cells.length || 1);
    const coh = mean((c) => c.metrics.coherence);
    const div = mean((c) => c.metrics.diversity);
    // repetition: fraction of unique Leitwerte across all this method's cards
    const all = cells.flatMap((c) => c!.cards.map((x) => x.leitwert));
    const uniq = all.length ? new Set(all).size / all.length : 0;
    if (METHODS.find((m) => m.id === mid)?.requiresLLM) llmCalls += all.length;
    console.log(
      `    ${mid.padEnd(18)} ${bar(coh)} ${(coh * 100).toFixed(0).padStart(3)}%  ${bar(div, 0, 2.5)} ${div.toFixed(2)}  ${bar(uniq)} ${(uniq * 100).toFixed(0)}%`,
    );
  }
  if (useLLM) {
    // b-llm adds one seed-expansion call per briefing
    const seedCalls = run.methodIds.includes("b-llm") ? BRIEFINGS.length : 0;
    console.log(
      `\n  ~${llmCalls + seedCalls} model calls this run (tier=${tier})  ·  Studio uses 'strong', Lab '${tier}'`,
    );
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

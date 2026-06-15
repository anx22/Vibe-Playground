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
import { judge, setApiBase } from "../src/llm/client";

/**
 * Real sentence-briefings — what a designer actually types, not the product noun.
 * The product/category is in the sentence; the output (a Leitwert) is what we generate.
 */
const BRIEFINGS: Briefing[] = [
  {
    id: "synth",
    label: "Synth-Label",
    text: "Rebrand für ein Synthesizer-Label, das von Software auf modulare Hardware umstellt — technisch, aber mit Handschrift.",
  },
  {
    id: "kanzlei",
    label: "Kanzlei",
    text: "Website für eine Anwaltskanzlei, traditionsbewusst und seriös, aber komplett digital und zugänglich.",
  },
  {
    id: "festival",
    label: "Festival",
    text: "Identität für ein Elektronik-Festival in einer alten Industriehalle — laut, roh, körperlich.",
  },
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
  const useJudge = has("--judge");
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

  // ── LLM-judge scorecard — the quality fitness function (1..5 per criterion) ──
  if (useJudge) {
    if (!base) {
      console.error("  --judge needs a live gateway: set VIBE_API_BASE=https://<app>.vercel.app");
      process.exit(1);
    }
    console.log(`${"─".repeat(78)}\n  QUALITY (LLM-judge, 1–5, avg across briefings × cards)`);
    console.log(`    ${"method".padEnd(18)} coher trig  fit  fresh   overall`);

    type Agg = { coh: number; trig: number; fit: number; fresh: number; n: number };
    let judgeCalls = 0;
    for (const mid of run.methodIds) {
      const agg: Agg = { coh: 0, trig: 0, fit: 0, fresh: 0, n: 0 };
      for (const b of BRIEFINGS) {
        const cell = run.cells[mid]?.[b.id];
        if (!cell || cell.error) continue;
        for (const c of cell.cards) {
          try {
            const s = await judge(
              { briefing: b.text, leitwert: c.leitwert, scene: c.scene, mood: c.mood },
              tier,
            );
            judgeCalls++;
            agg.coh += s.coherence;
            agg.trig += s.trigger;
            agg.fit += s.fit;
            agg.fresh += s.freshness;
            agg.n++;
          } catch (err) {
            console.log(`      ✗ judge ${mid}/${b.id}: ${String(err)}`);
          }
        }
      }
      if (!agg.n) continue;
      const coh = agg.coh / agg.n;
      const trig = agg.trig / agg.n;
      const fit = agg.fit / agg.n;
      const fresh = agg.fresh / agg.n;
      const overall = (coh + trig + fit + fresh) / 4;
      const f = (x: number) => x.toFixed(2).padStart(5);
      console.log(
        `    ${mid.padEnd(18)}${f(coh)}${f(trig)}${f(fit)}${f(fresh)}   ${bar(overall, 1, 5)} ${overall.toFixed(2)}`,
      );
    }
    console.log(`\n  ~${judgeCalls} judge calls (tier=${tier})\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

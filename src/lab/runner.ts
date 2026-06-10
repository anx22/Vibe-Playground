import { mulberry32 } from "../engine";
import type { VibeCard } from "../engine";
import type { Method } from "./method";
import { biasFromBriefing } from "./briefing";
import { metricsFor, type Metrics } from "./metrics";

export interface Briefing {
  id: string;
  label: string;
  text: string;
}

export interface Cell {
  cards: VibeCard[];
  metrics: Metrics;
  error?: string;
}

export interface LabRun {
  methodIds: string[];
  briefingIds: string[];
  cells: Record<string, Record<string, Cell>>;
  skipped: string[];
}

export interface LabOpts {
  batchSize?: number;
  seed?: number;
  allowLLM?: boolean;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Run methods × briefings into a comparison matrix. Deterministic given a seed. */
export async function runLab(
  methods: Method[],
  briefings: Briefing[],
  opts: LabOpts = {},
): Promise<LabRun> {
  const batchSize = opts.batchSize ?? 5;
  const seed = opts.seed ?? 42;
  const allowLLM = opts.allowLLM ?? false;

  const cells: Record<string, Record<string, Cell>> = {};
  const skipped: string[] = [];
  const ranIds: string[] = [];

  for (const m of methods) {
    if (m.requiresLLM && !allowLLM) {
      skipped.push(m.id);
      continue;
    }
    ranIds.push(m.id);
    cells[m.id] = {};
    for (const b of briefings) {
      const rng = mulberry32((seed ^ hash(`${m.id}|${b.id}`)) >>> 0);
      const ctx = { rng, centroid: biasFromBriefing(b.text), spread: 0.8, briefing: b.text };
      try {
        const cards = await m.generate(ctx, batchSize);
        cells[m.id][b.id] = { cards, metrics: metricsFor(cards) };
      } catch (err) {
        cells[m.id][b.id] = { cards: [], metrics: metricsFor([]), error: String(err) };
      }
    }
  }

  return { methodIds: ranIds, briefingIds: briefings.map((b) => b.id), cells, skipped };
}

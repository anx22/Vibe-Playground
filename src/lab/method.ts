import type { AxisKey, AxisVector, VibeCard } from "../engine";
import type { World } from "../engine/pools";

/**
 * The harness is built from three swappable parts so the creative space stays open:
 *
 *   WorldSource → MixStrategy → Renderer
 *
 * A "Method" is one recipe wiring them together. Single engines, 2-way / 3-way / N-way
 * blends, and entirely new ways of mixing are all just registry entries — nothing is
 * hardwired to the C→B→A stack (E-004 stays a *composition*, not the only path).
 */

export interface MixContext {
  rng: () => number;
  /** Briefing-biased position the run samples around. */
  centroid: AxisVector;
  /** How far a draw may stray (Explore wide, Iterate tight). */
  spread: number;
}

export interface MixResult {
  /** The colliding worlds chosen this draw (1, 2, 3 … — the strategy decides). */
  worlds: World[];
  /** The blended position in axis space. */
  vector: AxisVector;
  /** Did the strategy's own coherence test pass? */
  coherent: boolean;
  /** Bridge axes — kept for explainability. */
  sharedAxes: AxisKey[];
  /** Human-readable "how it was mixed". */
  note: string;
}

/** Where candidate worlds come from. Curated pools (offline) or LLM (seed-expansion / persona). */
export interface WorldSource {
  id: string;
  label: string;
  requiresLLM: boolean;
  candidates(ctx: MixContext): World[] | Promise<World[]>;
}

/** HOW worlds collide. Bridge-rule, distance-band+λ, triad, contrast — or something new. */
export interface MixStrategy {
  id: string;
  label: string;
  /** How many worlds it collides (number, or "n"). */
  arity: number | "n";
  /** Returns null when it can't form a coherent mix this draw. */
  mix(pool: World[], ctx: MixContext): MixResult | null;
}

/** Turns a mix into a Vibe Card. Template (offline) or LLM scene-render (E-028). */
export interface Renderer {
  id: string;
  label: string;
  requiresLLM: boolean;
  render(mix: MixResult, ctx: MixContext): VibeCard | Promise<VibeCard>;
}

export interface Method {
  id: string;
  label: string;
  kind: "single" | "stack" | "experimental";
  requiresLLM: boolean;
  generate(ctx: MixContext, batchSize: number): Promise<VibeCard[]>;
}

import { dist } from "../engine";

/** Compose a Method from a source + mix + renderer (+ optional novelty filter). */
export function recipe(cfg: {
  id: string;
  label: string;
  kind: Method["kind"];
  source: WorldSource;
  mix: MixStrategy;
  render: Renderer;
  /** Min distance to everything already produced (Farthest-Point-style novelty). */
  noveltyTau?: number;
}): Method {
  const requiresLLM = cfg.source.requiresLLM || cfg.render.requiresLLM;
  return {
    id: cfg.id,
    label: cfg.label,
    kind: cfg.kind,
    requiresLLM,
    async generate(ctx, batchSize) {
      const pool = await cfg.source.candidates(ctx);
      const out: VibeCard[] = [];
      const seen: AxisVector[] = [];
      let guard = 0;
      while (out.length < batchSize && guard++ < batchSize * 24) {
        const m = cfg.mix.mix(pool, ctx);
        if (!m) continue;
        if (cfg.noveltyTau && seen.some((s) => dist(s, m.vector) < cfg.noveltyTau!)) continue;
        const card = await cfg.render.render(m, ctx);
        if (out.some((c) => c.leitwert === card.leitwert)) continue;
        out.push(card);
        seen.push(m.vector);
      }
      return out;
    },
  };
}

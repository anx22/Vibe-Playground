import type { VibeCard } from "../engine";
import { paletteFor, typoFor } from "../engine/derive";
import { generatePersona } from "../llm/client";
import type { Method } from "./method";
import { recipe } from "./method";
import { bridgeMix, lambdaBandMix, latentBandMix } from "./mix";
import { curatedSource, llmSeedSource } from "./sources";
import { llmSceneRenderer, templateRenderer } from "./render";

/**
 * The method registry — the open creative space. Add a new mixing idea, world source, or
 * composition here; the Lab picks it up automatically. Nothing forces the C→B→A stack:
 * single engines, experiments, and the LLM paths sit side by side. Offline methods run
 * without a key; LLM methods activate once the gateway proxy (api/) is reachable.
 */

// ── Offline (curated source + template render) ─────────────────────────────────
const aBridge = recipe({
  id: "a-bridge",
  label: "Katalog · Regel (offline)",
  kind: "single",
  source: curatedSource,
  mix: bridgeMix,
  render: templateRenderer,
  noveltyTau: 0.45,
});

const bLambdaOffline = recipe({
  id: "b-lambda-offline",
  label: "Katalog · Distanz (offline)",
  kind: "single",
  source: curatedSource,
  mix: lambdaBandMix,
  render: templateRenderer,
  noveltyTau: 0.35,
});

// E-041: x-triad (3 Welten) and x-contrast (Max-Distanz) were cut — the judged eval
// scored them 3.04 / 3.13, below every LLM path, with the worst briefing-fit. More worlds
// and wider collisions did not buy quality, so they no longer earn a slot.

// ── LLM paths (via the Vercel AI Gateway proxy) ────────────────────────────────
/** E-028 flagship: A proposes the skeleton, the LLM renders the evocative scene. */
const aScene = recipe({
  id: "a-scene",
  label: "Katalog + Schreibschritt",
  kind: "single",
  source: curatedSource,
  mix: bridgeMix,
  render: llmSceneRenderer,
});

/** Engine B live: LLM seed-expansion → real embeddings → cosine-band + λ → LLM scene. */
const bLLM = recipe({
  id: "b-llm",
  label: "Generativ · Embeddings",
  kind: "single",
  source: llmSeedSource,
  mix: latentBandMix,
  render: llmSceneRenderer,
  noveltyTau: 0.3,
});

/** Engine C live: a persona, whose aesthetic falls out as the vibe (own paradigm, no world-mix). */
const cPersona: Method = {
  id: "c-persona",
  label: "Persona",
  kind: "single",
  requiresLLM: true,
  async generate(ctx, batchSize) {
    const cards: VibeCard[] = [];
    for (let i = 0; i < batchSize; i++) {
      const p = await generatePersona({ briefing: ctx.briefing ?? "", tier: ctx.tier });
      cards.push({
        id: `${p.leitwert}-${Math.floor(ctx.rng() * 1e6)}`,
        leitwert: p.leitwert,
        mood: p.mood,
        scene: p.persona,
        typography: typoFor(p.vector, ctx.rng),
        palette: paletteFor(p.vector),
        vector: p.vector,
        coherence: { sharedAxes: [], ok: true }, // a person is internally consistent
        origin: { home: "Persona", intrusion: "—", object: "—", engineNote: p.persona },
      });
    }
    return cards;
  },
};

export const METHODS: Method[] = [
  aBridge,
  bLambdaOffline,
  aScene,
  bLLM,
  cPersona,
];

export const offlineMethods = () => METHODS.filter((m) => !m.requiresLLM);

import { dist } from "../engine";
import type { AxisVector, VibeCard } from "../engine";
import { OBJECTS } from "../engine/pools";
import { moodFor, paletteFor, typoFor } from "../engine/derive";
import { renderScene } from "../llm/client";
import type { Renderer } from "./method";

/** Pick from the nearest-K object metaphors — varies the grounding instead of always the nearest. */
function pickObject(v: AxisVector, rng: () => number) {
  const sorted = [...OBJECTS].sort((a, b) => dist(a.vector, v) - dist(b.vector, v));
  return sorted[Math.floor(rng() * Math.min(3, sorted.length))];
}

/** Offline compositor — "structure proposes" (the LLM scene-render is the next layer, E-028). */
export const templateRenderer: Renderer = {
  id: "template",
  label: "Template (offline)",
  requiresLLM: false,
  render(m, ctx) {
    const obj = pickObject(m.vector, ctx.rng);
    const leitwert = `${m.worlds.map((w) => w.name).join("-")}-${obj.name}`;
    return {
      id: `${leitwert}-${Math.floor(ctx.rng() * 1e6)}`,
      leitwert,
      mood: moodFor(m.vector),
      typography: typoFor(m.vector, ctx.rng),
      palette: paletteFor(m.vector),
      vector: m.vector,
      coherence: { sharedAxes: m.sharedAxes, ok: m.coherent },
      origin: {
        home: m.worlds[0].name,
        intrusion: m.worlds[1]?.name ?? "—",
        object: obj.name,
        engineNote: m.note,
      },
    } satisfies VibeCard;
  },
};

/** The LLM renders the skeleton into an evocative scene/Leitwert (E-028) via the gateway proxy. */
export const llmSceneRenderer: Renderer = {
  id: "llm-scene",
  label: "LLM-Szene",
  requiresLLM: true,
  async render(m, ctx) {
    const obj = pickObject(m.vector, ctx.rng);
    const skeleton = `${m.worlds.map((w) => w.name).join("-")}-${obj.name}`;
    const out = await renderScene(
      {
        leitwert: skeleton,
        worlds: m.worlds.map((w) => w.name),
        mood: moodFor(m.vector),
        note: m.note,
        briefing: ctx.briefing,
      },
      ctx.tier,
    );
    return {
      id: `${out.leitwert}-${Math.floor(ctx.rng() * 1e6)}`,
      leitwert: out.leitwert,
      mood: out.mood,
      scene: out.scene,
      typography: typoFor(m.vector, ctx.rng),
      palette: paletteFor(m.vector),
      vector: m.vector,
      coherence: { sharedAxes: m.sharedAxes, ok: m.coherent },
      origin: {
        home: m.worlds[0].name,
        intrusion: m.worlds[1]?.name ?? "—",
        object: obj.name,
        engineNote: m.note,
      },
    } satisfies VibeCard;
  },
};

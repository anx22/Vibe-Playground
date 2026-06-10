import { dist } from "../engine";
import type { AxisVector, VibeCard } from "../engine";
import { OBJECTS } from "../engine/pools";
import { moodFor, paletteFor, typoFor } from "../engine/derive";
import { renderScene } from "../llm/client";
import type { Renderer } from "./method";

function nearestObject(v: AxisVector) {
  return OBJECTS.reduce((best, o) => (dist(o.vector, v) < dist(best.vector, v) ? o : best));
}

/** Offline compositor — "structure proposes" (the LLM scene-render is the next layer, E-028). */
export const templateRenderer: Renderer = {
  id: "template",
  label: "Template (offline)",
  requiresLLM: false,
  render(m, ctx) {
    const obj = nearestObject(m.vector);
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
    const obj = nearestObject(m.vector);
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

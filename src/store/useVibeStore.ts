import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zero } from "../engine";
import type { VibeCard } from "../engine";
import { paletteFor, typoFor } from "../engine/derive";
import { generateBridges, generatePersona } from "../llm/client";
import type { Bridge, Persona } from "../llm/schema";
import { judgeRank } from "../llm/select";

/** Per method we generate a few extra and judge-select the strongest into the cluster (E-041). */
const PER_METHOD = 6;
const OVERSCAN = PER_METHOD + 2;
const MAX_ANCHORS = 5;
const rng = () => Math.random();

const HEX = /^#?[0-9a-fA-F]{3,8}$/;
function palette3(p: string[] | undefined): [string, string, string] {
  const ok = (p ?? []).filter((c) => HEX.test(c)).map((c) => (c.startsWith("#") ? c : `#${c}`));
  return [ok[0] ?? "#1c1c1c", ok[1] ?? "#6b6b6b", ok[2] ?? "#d9d4cc"];
}

function bridgeToCard(b: Bridge, source: string): VibeCard {
  return {
    id: `${source}-${b.leitwert}-${Math.floor(rng() * 1e6)}`,
    leitwert: b.leitwert,
    mood: b.mood,
    scene: b.creativeDerivation,
    typography: typoFor(zero(), rng),
    palette: palette3(b.palette),
    vector: zero(),
    coherence: { sharedAxes: [], ok: true },
    origin: {
      home: b.worlds.map((w) => w.name).join(" × "),
      intrusion: b.objectMetaphor,
      object: b.objectMetaphor,
      engineNote: b.creativeDerivation,
    },
    source,
    detail: {
      worlds: b.worlds,
      object: b.objectMetaphor,
      derivation: b.creativeDerivation,
      affordances: b.affordances,
    },
  };
}

function personaToCard(p: Persona, source: string): VibeCard {
  return {
    id: `${source}-${p.leitwert}-${Math.floor(rng() * 1e6)}`,
    leitwert: p.leitwert,
    mood: p.mood,
    scene: p.persona,
    typography: typoFor(p.vector, rng),
    palette: paletteFor(p.vector),
    vector: p.vector,
    coherence: { sharedAxes: [], ok: true },
    origin: { home: "Persona", intrusion: "—", object: "—", engineNote: p.persona },
    source,
    detail: { derivation: p.persona },
  };
}

/** The creative derivations, each its own constellation cluster (E-047). Pluggable — add a source here. */
export interface Source {
  id: string;
  label: string;
  accent: string;
  gen: (briefing: string, steer: string, n: number) => Promise<VibeCard[]>;
}

export const SOURCES: Source[] = [
  {
    id: "entanglement",
    label: "Verschränkung",
    accent: "#E86A4B",
    gen: async (briefing, steer, n) =>
      (await generateBridges({ briefing, steer, n, tier: "strong" })).bridges.map((b) =>
        bridgeToCard(b, "entanglement"),
      ),
  },
  {
    id: "persona",
    label: "Persona",
    accent: "#5B8BD6",
    gen: async (briefing, steer, n) =>
      (
        await Promise.all(
          Array.from({ length: n }, () => generatePersona({ briefing: briefing + steer, tier: "strong" })),
        )
      ).map((p) => personaToCard(p, "persona")),
  },
];

/** Steering folded into the brief: the anchored gold blocks pull the next wave toward them. */
function gravityText(anchors: VibeCard[]): string {
  if (!anchors.length) return "";
  return `\nGravitation — leite die nächsten Richtungen aus diesen Ankern ab, ohne den Kern zu verlassen: ${anchors
    .map((a) => a.leitwert)
    .join(", ")}.`;
}

/** Run every active source in parallel; each cluster keeps its judge-selected best. */
async function generateField(
  briefing: string,
  steer: string,
): Promise<{ cards: VibeCard[]; ok: boolean }> {
  const clusters = await Promise.all(
    SOURCES.map(async (src) => {
      try {
        const cards = await src.gen(briefing, steer, OVERSCAN);
        const ranked = await judgeRank(cards, briefing);
        return ranked.slice(0, PER_METHOD);
      } catch {
        return [] as VibeCard[];
      }
    }),
  );
  const flat = clusters.flat();
  return { cards: flat, ok: flat.length > 0 };
}

interface VibeState {
  phase: "blank" | "studio";
  seed: string;
  cards: VibeCard[];
  anchors: VibeCard[];
  focusId: string | null;
  generation: number;
  loading: boolean;
  llmFallback: boolean;

  setSeed: (w: string) => void;
  explore: () => Promise<void>;
  iterate: () => Promise<void>;
  toggleAnchor: (c: VibeCard) => void;
  focus: (id: string | null) => void;
  reset: () => void;
}

export const useVibeStore = create<VibeState>()(
  persist(
    (set, get) => ({
      phase: "blank",
      seed: "",
      cards: [],
      anchors: [],
      focusId: null,
      generation: 0,
      loading: false,
      llmFallback: false,

      setSeed: (w) => set({ seed: w }),

      explore: async () => {
        const briefing = get().seed;
        set({ phase: "studio", cards: [], anchors: [], focusId: null, generation: 1, loading: true });
        const { cards, ok } = await generateField(briefing, "");
        set({ cards, loading: false, llmFallback: !ok });
      },

      iterate: async () => {
        const { seed, anchors, generation } = get();
        set({ loading: true });
        const { cards, ok } = await generateField(seed, gravityText(anchors));
        set({ cards, focusId: null, generation: generation + 1, loading: false, llmFallback: !ok });
      },

      toggleAnchor: (c) => {
        const anchors = get().anchors;
        const has = anchors.some((a) => a.id === c.id);
        if (has) set({ anchors: anchors.filter((a) => a.id !== c.id) });
        else if (anchors.length < MAX_ANCHORS) set({ anchors: [...anchors, c] });
      },

      focus: (id) => set({ focusId: id }),

      reset: () =>
        set({ phase: "blank", seed: "", cards: [], anchors: [], focusId: null, generation: 0, loading: false }),
    }),
    {
      name: "vibe-playground",
      partialize: (s) => ({ anchors: s.anchors }),
    },
  ),
);

export { MAX_ANCHORS };

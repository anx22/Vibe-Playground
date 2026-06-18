import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zero } from "../engine";
import type { VibeCard } from "../engine";
import { paletteFor, typoFor } from "../engine/derive";
import { generateBridges, generateLatent, generatePersonas, generateWorkbench } from "../llm/client";
import type { Bridge, Persona, WorkbenchCandidate } from "../llm/schema";
import { judgeRank } from "../llm/select";

/** Per method we generate a few extra and judge-select the strongest into the cluster (E-041). */
const PER_METHOD = 5;
const OVERSCAN = PER_METHOD + 1;
const MAX_ANCHORS = 5;
// Session-unique prefix so cards minted this session can never collide with persisted cards/anchors
// rehydrated from a previous one (which restart their own counter at 0). Fixes a dup-key/anchor bug.
const SID = Math.random().toString(36).slice(2, 8);
let idSeq = 0;
const nextId = (source: string) => `${source}-${SID}-${idSeq++}`;
const rng = () => Math.random();

const HEX = /^#?[0-9a-fA-F]{3,8}$/;
function palette3(p: string[] | undefined): [string, string, string] {
  const ok = (p ?? []).filter((c) => HEX.test(c)).map((c) => (c.startsWith("#") ? c : `#${c}`));
  return [ok[0] ?? "#1c1c1c", ok[1] ?? "#6b6b6b", ok[2] ?? "#d9d4cc"];
}

function bridgeToCard(b: Bridge, source: string): VibeCard {
  return {
    id: nextId(source),
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
      domainDistance: b.domainDistance,
    },
  };
}

function personaToCard(p: Persona, source: string): VibeCard {
  return {
    id: nextId(source),
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

function candidateToCard(c: WorkbenchCandidate, source: string): VibeCard {
  const card = bridgeToCard(c, source);
  card.detail = {
    ...card.detail,
    tasteDirection: c.tasteDirection,
    operators: c.operators,
    comfortRating: c.comfortRating,
  };
  return card;
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
    accent: "#FF4B4B",
    gen: async (briefing, steer, n) =>
      (await generateBridges({ briefing, steer, n, tier: "strong" })).bridges.map((b) =>
        bridgeToCard(b, "entanglement"),
      ),
  },
  {
    id: "workbench",
    label: "Werkbank",
    accent: "#CE82FF",
    gen: async (briefing, steer, n) =>
      (await generateWorkbench({ briefing, steer, n })).map((c) => candidateToCard(c, "workbench")),
  },
  {
    id: "latent",
    label: "Latent-Agent",
    accent: "#58CC02",
    gen: async (briefing, steer, n) =>
      (await generateLatent({ briefing, steer, n })).bridges.map((b) => bridgeToCard(b, "latent")),
  },
  {
    id: "persona",
    label: "Persona",
    accent: "#1CB0F6",
    gen: async (briefing, steer, n) =>
      (await generatePersonas({ briefing: briefing + steer, n, tier: "strong" })).map((p) =>
        personaToCard(p, "persona"),
      ),
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
): Promise<{ cards: VibeCard[]; ok: boolean; failed: string[] }> {
  const failed: string[] = [];
  const clusters = await Promise.all(
    SOURCES.map(async (src) => {
      try {
        const cards = await src.gen(briefing, steer, OVERSCAN);
        const ranked = await judgeRank(cards, briefing);
        return ranked.slice(0, PER_METHOD);
      } catch (e) {
        failed.push(src.label);
        console.warn(`[${src.id}] generation failed`, e);
        return [] as VibeCard[];
      }
    }),
  );
  const flat = clusters.flat();
  return { cards: flat, ok: flat.length > 0, failed };
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
  /** Engine cluster labels that failed in the last round (empty when all succeeded). */
  failedSources: string[];

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
      failedSources: [],

      setSeed: (w) => set({ seed: w }),

      explore: async () => {
        const briefing = get().seed;
        set({ phase: "studio", cards: [], anchors: [], focusId: null, generation: 1, loading: true, failedSources: [] });
        const { cards, ok, failed } = await generateField(briefing, "");
        set({ cards, loading: false, llmFallback: !ok, failedSources: failed });
      },

      iterate: async () => {
        const { seed, anchors, generation } = get();
        set({ loading: true });
        const { cards, ok, failed } = await generateField(seed, gravityText(anchors));
        set({ cards, focusId: null, generation: generation + 1, loading: false, llmFallback: !ok, failedSources: failed });
      },

      toggleAnchor: (c) => {
        const anchors = get().anchors;
        const has = anchors.some((a) => a.id === c.id);
        if (has) set({ anchors: anchors.filter((a) => a.id !== c.id) });
        else if (anchors.length < MAX_ANCHORS) set({ anchors: [...anchors, c] });
      },

      focus: (id) => set({ focusId: id }),

      reset: () =>
        set({ phase: "blank", seed: "", cards: [], anchors: [], focusId: null, generation: 0, loading: false, failedSources: [] }),
    }),
    {
      name: "vibe-playground",
      // Persist the whole working set so a reload restores the constellation, not orphaned anchors.
      partialize: (s) => ({
        phase: s.phase,
        seed: s.seed,
        cards: s.cards,
        anchors: s.anchors,
        generation: s.generation,
      }),
    },
  ),
);

export { MAX_ANCHORS };

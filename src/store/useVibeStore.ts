import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AxisVector, Signal, VibeCard } from "../engine";
import { AXES, add, autoEngine, clamp, zero, LEXICON } from "../engine";
import { METHODS } from "../lab";
import { interpretBriefing, renderBatch } from "../llm/client";

const BATCH = 5;
const studioRng = () => Math.random();

export type Lens = "auto" | "B" | "C";

const methodFor = (lens: Lens) => METHODS.find((m) => m.id === (lens === "B" ? "b-llm" : "c-persona"));

/**
 * Studio generate. Lens "auto" = Engine A skeleton + one batch LLM scene-render (fast).
 * Lens "B"/"C" = the live Lab method (embeddings / persona) at the strong tier. Always falls
 * back to the offline skeleton when the gateway is unreachable, so the loop never dead-ends.
 */
async function generateBatch(
  centroid: AxisVector,
  spread: number,
  briefing: string,
  lens: Lens,
  tension: number,
): Promise<VibeCard[]> {
  if (lens !== "auto") {
    const m = methodFor(lens);
    if (m) {
      try {
        return await m.generate(
          { rng: studioRng, centroid, spread, briefing, tier: "strong", tension },
          BATCH,
        );
      } catch {
        /* fall through to Engine A */
      }
    }
  }

  const skeletons = autoEngine.generate(centroid, { batchSize: BATCH, spread }, studioRng);
  try {
    const scenes = await renderBatch(
      skeletons.map((c) => ({
        leitwert: c.leitwert,
        worlds: [c.origin.home, c.origin.intrusion],
        mood: c.mood,
        note: c.origin.engineNote,
        briefing,
      })),
    );
    return skeletons.map((c, i) =>
      scenes[i]
        ? { ...c, leitwert: scenes[i].leitwert, mood: scenes[i].mood, scene: scenes[i].scene }
        : c,
    );
  } catch {
    return skeletons;
  }
}

function seedVector(word: string): AxisVector {
  const v = zero();
  const w = word.trim().toLowerCase();
  if (!w) return v;
  for (const key of Object.keys(LEXICON)) {
    if (!w.includes(key)) continue;
    const bias = LEXICON[key];
    for (const ax of AXES) {
      const b = bias[ax];
      if (b !== undefined) v[ax] = clamp(v[ax] + b);
    }
  }
  return v;
}

function centroidOf(seed: AxisVector, signals: Signal[]): AxisVector {
  let c: AxisVector = { ...seed };
  for (const s of signals) c = add(c, s.vector, s.kind === "attract" ? 0.4 : -0.4);
  return c;
}

/** Spread = the "safe ↔ experimental" tension knob, tightened as steering signals accumulate. */
const spreadFromTension = (tension: number, signals: Signal[]) =>
  clamp(0.3 + tension * 0.6 - signals.length * 0.05, 0.22, 0.95);

let sigCount = 0;
const newSignal = (kind: Signal["kind"], card: VibeCard): Signal => ({
  id: `sig-${++sigCount}`,
  kind,
  vector: card.vector,
  label: card.leitwert,
});

interface VibeState {
  phase: "blank" | "studio";
  view: "studio" | "lab";
  seed: string;
  seedVec: AxisVector;
  signals: Signal[];
  centroid: AxisVector;
  spread: number;
  cards: VibeCard[];
  library: VibeCard[];
  focusId: string | null;
  commits: number;
  loading: boolean;
  // Advanced (adaptive): unlocks on first steer; persisted.
  advanced: boolean;
  lens: Lens;
  tension: number;

  setView: (v: "studio" | "lab") => void;
  setSeed: (w: string) => void;
  setLens: (l: Lens) => void;
  setTension: (t: number) => void;
  explore: () => Promise<void>;
  iterate: () => Promise<void>;
  attract: (c: VibeCard) => void;
  repel: (c: VibeCard) => void;
  commit: (c: VibeCard) => void;
  focus: (id: string) => void;
  reset: () => void;
}

export const useVibeStore = create<VibeState>()(
  persist(
    (set, get) => ({
      phase: "blank",
      view: "studio",
      seed: "",
      seedVec: zero(),
      signals: [],
      centroid: zero(),
      spread: 0.57,
      cards: [],
      library: [],
      focusId: null,
      commits: 0,
      loading: false,
      advanced: false,
      lens: "auto",
      tension: 0.45,

      setView: (v) => set({ view: v }),
      setSeed: (w) => set({ seed: w, seedVec: seedVector(w) }),
      setLens: (l) => set({ lens: l }),
      setTension: (t) =>
        set({ tension: t, spread: spreadFromTension(t, get().signals) }),

      explore: async () => {
        const briefing = get().seed;
        set({ phase: "studio", signals: [], focusId: null, cards: [], loading: true });
        let seedVec = seedVector(briefing);
        if (briefing.trim()) {
          try {
            seedVec = await interpretBriefing(briefing);
          } catch {
            /* keep lexicon fallback */
          }
        }
        const { tension, lens } = get();
        const spread = spreadFromTension(tension, []);
        const centroid = centroidOf(seedVec, []);
        set({ seedVec, centroid, spread });
        const cards = await generateBatch(centroid, spread, briefing, lens, tension);
        set({ cards, loading: false });
      },

      iterate: async () => {
        const { centroid, spread, seed, lens, tension } = get();
        set({ loading: true });
        const cards = await generateBatch(centroid, spread, seed, lens, tension);
        set({ cards, focusId: null, loading: false });
      },

      // Live-reflow (E-022): signals re-bias centroid + spread, cards stay put. First steer unlocks Advanced.
      attract: (c) => {
        const signals = [...get().signals, newSignal("attract", c)];
        set({
          signals,
          centroid: centroidOf(get().seedVec, signals),
          spread: spreadFromTension(get().tension, signals),
          focusId: c.id,
          advanced: true,
        });
      },
      repel: (c) => {
        const signals = [...get().signals, newSignal("repel", c)];
        set({
          signals,
          centroid: centroidOf(get().seedVec, signals),
          spread: spreadFromTension(get().tension, signals),
          focusId: c.id,
          advanced: true,
        });
      },

      commit: (c) => {
        const { library, commits } = get();
        if (library.some((l) => l.id === c.id)) return;
        set({ library: [c, ...library], commits: commits + 1, focusId: c.id, advanced: true });
      },

      focus: (id) => set({ focusId: id }),

      reset: () =>
        set({
          phase: "blank",
          seed: "",
          seedVec: zero(),
          signals: [],
          centroid: zero(),
          spread: spreadFromTension(get().tension, []),
          cards: [],
          focusId: null,
          loading: false,
        }),
    }),
    {
      name: "vibe-playground",
      partialize: (s) => ({
        library: s.library,
        commits: s.commits,
        advanced: s.advanced,
        lens: s.lens,
        tension: s.tension,
      }),
    },
  ),
);

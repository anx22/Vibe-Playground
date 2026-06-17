import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AxisVector, Signal, VibeCard } from "../engine";
import { AXES, add, autoEngine, clamp, zero, LEXICON } from "../engine";
import { paletteFor, typoFor } from "../engine/derive";
import { generateAnalogies, interpretBriefing } from "../llm/client";
import type { Direction } from "../llm/schema";
import { judgeRank } from "../llm/select";

const BATCH = 5;
/** Generate a few extra, then judge-select down to BATCH — the production fitness step (E-041). */
const OVERSCAN = BATCH + 2;
const studioRng = () => Math.random();

/** Kept for persistence back-compat; the single Analogy Engine ignores it (E-046). */
export type Lens = "auto" | "B" | "C";

/** One analogy direction → a Studio card (palette/typo derive from its 6-axis projection). */
function directionToCard(d: Direction): VibeCard {
  return {
    id: `${d.leitwert}-${Math.floor(studioRng() * 1e6)}`,
    leitwert: d.leitwert,
    mood: d.mood,
    scene: d.scene,
    typography: typoFor(d.vector, studioRng),
    palette: paletteFor(d.vector),
    vector: d.vector,
    coherence: { sharedAxes: [], ok: true },
    origin: { home: d.world, intrusion: "—", object: "—", engineNote: d.core },
  };
}

/** Steering folded into the brief: pull toward kept directions, away from rejected ones. */
function steerText(signals: Signal[]): string {
  const near = signals.filter((s) => s.kind === "attract").map((s) => s.label);
  const far = signals.filter((s) => s.kind === "repel").map((s) => s.label);
  if (!near.length && !far.length) return "";
  let t = "\nSteuerung —";
  if (near.length) t += ` näher an Richtungen wie: ${near.join(", ")};`;
  if (far.length) t += ` weg von: ${far.join(", ")};`;
  return `${t} der funktionale Kern bleibt.`;
}

/**
 * Studio generate — the Analogy Engine (E-046): brief → functional core → distant domains that
 * embody the same core → Leitwerte, judge-selected best-first. Falls back to the offline skeleton
 * only when the gateway is unreachable, so the loop never dead-ends.
 */
async function generateBatch(
  briefing: string,
  steer: string,
  fallbackCentroid: AxisVector,
  spread: number,
): Promise<{ cards: VibeCard[]; sceneOk: boolean }> {
  try {
    const dirs = await generateAnalogies({ briefing: briefing + steer, n: OVERSCAN, tier: "strong" });
    const cards = dirs.map(directionToCard);
    const ranked = await judgeRank(cards, briefing);
    return { cards: ranked.slice(0, BATCH), sceneOk: true };
  } catch {
    const skeletons = autoEngine.generate(fallbackCentroid, { batchSize: BATCH, spread }, studioRng);
    return { cards: skeletons, sceneOk: false }; // offline / rate-limited fallback
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
  /** True when the last generate fell back to skeletons (rate-limited / gateway unreachable). */
  llmFallback: boolean;
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
      llmFallback: false,
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
        const { tension } = get();
        const spread = spreadFromTension(tension, []);
        const centroid = centroidOf(seedVec, []);
        set({ seedVec, centroid, spread });
        const { cards, sceneOk } = await generateBatch(briefing, "", centroid, spread);
        set({ cards, loading: false, llmFallback: !sceneOk });
      },

      iterate: async () => {
        const { centroid, spread, seed, signals } = get();
        set({ loading: true });
        const { cards, sceneOk } = await generateBatch(seed, steerText(signals), centroid, spread);
        set({ cards, focusId: null, loading: false, llmFallback: !sceneOk });
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

import { create } from "zustand";
import type { AxisVector, Signal, VibeCard } from "../engine";
import { AXES, add, autoEngine, clamp, zero, LEXICON } from "../engine";

const BATCH = 5;
const studioRng = () => Math.random();

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

const spreadOf = (signals: Signal[]) => clamp(0.85 - signals.length * 0.05, 0.22, 0.85);

let sigCount = 0;
const newSignal = (kind: Signal["kind"], card: VibeCard): Signal => ({
  id: `sig-${++sigCount}`,
  kind,
  vector: card.vector,
  label: card.leitwert,
});

interface VibeState {
  phase: "blank" | "studio";
  seed: string;
  seedVec: AxisVector;
  signals: Signal[];
  centroid: AxisVector;
  spread: number;
  cards: VibeCard[];
  library: VibeCard[];
  focusId: string | null;
  commits: number;

  setSeed: (w: string) => void;
  explore: () => void;
  iterate: () => void;
  attract: (c: VibeCard) => void;
  repel: (c: VibeCard) => void;
  commit: (c: VibeCard) => void;
  focus: (id: string) => void;
  reset: () => void;
}

export const useVibeStore = create<VibeState>((set, get) => ({
  phase: "blank",
  seed: "",
  seedVec: zero(),
  signals: [],
  centroid: zero(),
  spread: 0.85,
  cards: [],
  library: [],
  focusId: null,
  commits: 0,

  setSeed: (w) => set({ seed: w, seedVec: seedVector(w) }),

  explore: () => {
    const { seedVec } = get();
    const centroid = centroidOf(seedVec, []);
    const spread = spreadOf([]);
    set({
      phase: "studio",
      signals: [],
      centroid,
      spread,
      focusId: null,
      cards: autoEngine.generate(centroid, { batchSize: BATCH, spread }, studioRng),
    });
  },

  iterate: () => {
    const { centroid, spread } = get();
    set({
      cards: autoEngine.generate(centroid, { batchSize: BATCH, spread }, studioRng),
      focusId: null,
    });
  },

  // Live-reflow (E-022): signals re-bias centroid + spread, cards stay put.
  attract: (c) => {
    const signals = [...get().signals, newSignal("attract", c)];
    set({
      signals,
      centroid: centroidOf(get().seedVec, signals),
      spread: spreadOf(signals),
      focusId: c.id,
    });
  },
  repel: (c) => {
    const signals = [...get().signals, newSignal("repel", c)];
    set({
      signals,
      centroid: centroidOf(get().seedVec, signals),
      spread: spreadOf(signals),
      focusId: c.id,
    });
  },

  commit: (c) => {
    const { library, commits } = get();
    if (library.some((l) => l.id === c.id)) return;
    set({ library: [c, ...library], commits: commits + 1, focusId: c.id });
  },

  focus: (id) => set({ focusId: id }),

  reset: () =>
    set({
      phase: "blank",
      seed: "",
      seedVec: zero(),
      signals: [],
      centroid: zero(),
      spread: 0.85,
      cards: [],
      focusId: null,
    }),
}));

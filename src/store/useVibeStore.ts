import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zero } from "../engine";
import type { VibeCard } from "../engine";
import { paletteFor, typoFor } from "../engine/derive";
import { generateBridges, generatePersonas, generateWorkbench } from "../llm/client";
import type { Bridge, Persona, WorkbenchCandidate } from "../llm/schema";
import { judgeRank, passesFloor, spreadByRegister } from "../llm/select";

/** Per method we generate a few extra and judge-select the strongest into the cluster (E-041). */
const PER_METHOD = 5;
/** Over-generate above the floor so it can cut weak cards and still fill the cluster — trimmed 8→6 to cut spend (E-076). */
const OVERSCAN = 6;
/** Cross-round novelty memory (E-063): how many produced Leitwerte to remember, and how many to repel per prompt. */
const NOVELTY_CAP = 200;
const NOVELTY_INJECT = 20;
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
    id: "persona",
    label: "Persona",
    accent: "#1CB0F6",
    gen: async (briefing, steer, n) =>
      (await generatePersonas({ briefing: briefing + steer, n, tier: "strong" })).map((p) =>
        personaToCard(p, "persona"),
      ),
  },
];

/** Steering folded into the brief — a NUDGE, not a collapse. Anti-convergence so we don't get clones. */
function gravityText(anchors: VibeCard[]): string {
  if (!anchors.length) return "";
  return (
    `\nInspiration (NICHT wiederholen, NICHT kopieren): ${anchors.map((a) => a.leitwert).join(", ")}. ` +
    `Bewege dich in ihre Richtung, aber liefere klar EIGENSTÄNDIGE, untereinander stark VERSCHIEDENE ` +
    `Ergebnisse — keine Varianten desselben, keine Near-Duplicates.`
  );
}

/** Normalised leitwert for dedup (a round of clones is the main "many identical entries" bug). */
const normLw = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöü]/g, "");

/**
 * Cross-round novelty memory (E-063): repel the Leitwerte already produced so round 100 stays as
 * fresh as round 1. Text-level for now (exact/near-form repeats); embedding-semantic dedup is Tier-1.
 */
export function noveltyText(produced: string[]): string {
  if (!produced.length) return "";
  const recent = produced.slice(-NOVELTY_INJECT);
  return (
    `\nBEREITS ERZEUGT (NICHT wiederholen, keine Near-Variants, andere Wort- UND Objektformen): ` +
    `${recent.join(", ")}. Wähle bewusst FRISCHE Welten/Domänen, die hier noch nicht vorkamen.`
  );
}

/** Append produced Leitwerte to the memory, deduped by normalized form and capped (most-recent-last). */
export function pushProduced(produced: string[], add: string[]): string[] {
  const seen = new Set(produced.map(normLw));
  const merged = [...produced];
  for (const lw of add) {
    const k = normLw(lw);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(lw);
  }
  return merged.slice(-NOVELTY_CAP);
}

/**
 * One source's pipeline: generate → judge-rank → quality FLOOR (+ in-source dedup). Thin stays thin —
 * if few cards clear the floor the cluster simply comes back small; there is no second pass (E-064,
 * reversing E-063's regenerate-once). An honest, sometimes-sparse board beats a best-effort "best of
 * bad" refill — and it halves the worst-case latency/cost of a weak round. Survivors are then
 * re-threaded to span render/material registers (E-065) so the visible top-N doesn't collapse into
 * one material feel.
 */
async function produceForSource(src: Source, briefing: string, steer: string): Promise<VibeCard[]> {
  const seen = new Set<string>();
  const keep = (cards: VibeCard[]): VibeCard[] => {
    const out: VibeCard[] = [];
    for (const c of cards) {
      if (!passesFloor(c)) continue;
      const k = normLw(c.leitwert);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(c);
    }
    return out;
  };
  const ranked = await judgeRank(await src.gen(briefing, steer, OVERSCAN), briefing);
  return spreadByRegister(keep(ranked));
}

/** Monotonic round id so late results from a superseded round are dropped. */
let roundSeq = 0;

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
  /** Source ids still generating this round — each lane shows a spinner until its id clears. */
  pendingSources: string[];
  /** Cross-round novelty memory — Leitwerte already produced, repelled in later rounds (E-063). */
  produced: string[];

  setSeed: (w: string) => void;
  explore: () => Promise<void>;
  iterate: () => Promise<void>;
  toggleAnchor: (c: VibeCard) => void;
  focus: (id: string | null) => void;
  reset: () => void;
}

export const useVibeStore = create<VibeState>()(
  persist(
    (set, get) => {
      /**
       * Streaming round (E-056): each engine runs INDEPENDENTLY and streams its judge-selected
       * cards into its lane the moment it finishes — no engine waits for the slowest. A round id
       * drops late results from a superseded round; loading/pending clear as each settles.
       */
      const runRound = (briefing: string, baseSteer: string) => {
        const round = ++roundSeq;
        // Read the novelty memory ONCE per round — it repels PAST rounds; same-round dedup is below.
        const steer = baseSteer + noveltyText(get().produced);
        set({
          loading: true,
          cards: [],
          focusId: null,
          failedSources: [],
          pendingSources: SOURCES.map((s) => s.id),
        });
        const settle = (srcId: string) =>
          set((s) => {
            const pendingSources = s.pendingSources.filter((id) => id !== srcId);
            const done = pendingSources.length === 0;
            return {
              pendingSources,
              loading: !done,
              llmFallback: done ? s.cards.length === 0 : s.llmFallback,
            };
          });
        for (const src of SOURCES) {
          produceForSource(src, briefing, steer)
            .then((survivors) => {
              if (round !== roundSeq) return;
              set((s) => {
                const seen = new Set(s.cards.map((c) => normLw(c.leitwert)));
                const fresh = survivors
                  .filter((c) => {
                    const k = normLw(c.leitwert);
                    if (seen.has(k)) return false;
                    seen.add(k);
                    return true;
                  })
                  .slice(0, PER_METHOD);
                return {
                  cards: [...s.cards, ...fresh],
                  produced: pushProduced(s.produced, fresh.map((c) => c.leitwert)),
                };
              });
            })
            .catch((e) => {
              if (round !== roundSeq) return;
              console.warn(`[${src.id}] generation failed`, e);
              set((s) => ({ failedSources: [...s.failedSources, src.label] }));
            })
            .finally(() => {
              if (round === roundSeq) settle(src.id);
            });
        }
      };

      return {
      phase: "blank",
      seed: "",
      cards: [],
      anchors: [],
      focusId: null,
      generation: 0,
      loading: false,
      llmFallback: false,
      failedSources: [],
      pendingSources: [],
      produced: [],

      setSeed: (w) => set({ seed: w }),

      explore: async () => {
        const briefing = get().seed;
        set({ phase: "studio", cards: [], anchors: [], focusId: null, generation: 1 });
        runRound(briefing, "");
      },

      iterate: async () => {
        const { seed, anchors, generation } = get();
        set({ generation: generation + 1 });
        runRound(seed, gravityText(anchors));
      },

      toggleAnchor: (c) => {
        const anchors = get().anchors;
        const has = anchors.some((a) => a.id === c.id);
        if (has) set({ anchors: anchors.filter((a) => a.id !== c.id) });
        else if (anchors.length < MAX_ANCHORS) set({ anchors: [...anchors, c] });
      },

      focus: (id) => set({ focusId: id }),

      reset: () => {
        roundSeq++; // cancel any in-flight round
        set({ phase: "blank", seed: "", cards: [], anchors: [], focusId: null, generation: 0, loading: false, failedSources: [], pendingSources: [], produced: [] });
      },
      };
    },
    {
      name: "vibe-playground",
      // Persist the whole working set so a reload restores the constellation, not orphaned anchors.
      partialize: (s) => ({
        phase: s.phase,
        seed: s.seed,
        cards: s.cards,
        anchors: s.anchors,
        generation: s.generation,
        produced: s.produced,
      }),
    },
  ),
);

export { MAX_ANCHORS };

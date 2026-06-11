# NOW.md — Vibe Playground

> Current state. Update after every meaningful step.

## Current Goal

The end-to-end loop is **live on Vercel** (briefing → LLM-interpreted axes → structure → LLM scene →
card → commit → export). Remaining: Advanced mode, real embeddings for B, persistence. Subjective
quality in the Lab is the first success metric (E-018); north star is speed to a credible direction
(E-014). **Cost is bounded** (Studio=Sonnet, Lab=Haiku, no Opus); the gateway free-tier is
rate-limited until credits are topped up.

## What Exists

- **App — Vite + React + TS, client-side** (`src/`): Studio loop blank → Explore → live-reflow Steer
  → Iterate → Commit → Library; live **Pentagon** (5-axis radar, spread cloud); **Vibe Cards**
  (real-font typo trio, coherence pulse, Herkunft collapser, magnet controls); Speed-to-Direction
  tacho. Duolingo×Pro design tokens, accent inherits from the focused direction.
  **Main flow renders real scenes:** Engine A proposes the skeleton, the LLM renders the evocative
  scene (E-028) in one batch round-trip, with offline fallback when no key is present.
- **Engine A** behind a shared `Engine` interface (`src/engine/`): curated pools + bridge rule,
  axis-derived palette/typo/mood, deterministic seedable RNG.
- **Lab — method framework** (`src/lab/`): `WorldSource × MixStrategy × Renderer`, fully swappable.
  Mix strategies live: bridge (A), distance+λ (B-methodology, offline), triad, contrast. Metrics
  (coherence/diversity/novelty), seeded runner, side-by-side comparison matrix UI, Vitest (3 passing).
- **LLM layer — Vercel AI Gateway** (`src/llm/` + `api/`, E-029): thin proxy, model registry +
  **tiers** (Studio=Sonnet, Lab=Haiku, no Opus, E-030), `caching:'auto'`, fallbacks, usage logging.
  Endpoints: `render` · `batch` · `seeds` · `persona` · `interpret` (briefing→axes, E-034) · `health`.
- **Briefing → LLM-interpreted axes** (E-034): Explore projects the briefing onto the 5 axes via the
  model (lexicon fallback) — the briefing steers the Pentagon, not just the scene text.
- **Single-screen Studio** (E-032): rail (compact Pentagon + controls) · card grid · Library panel.
- **Library export** (E-033): any/committed direction → copy-ready prompt/brief (client-side).
- **Engine variety + novelty** (E-031): uniqueness 60%→100% at full coherence; Studio & Lab consistent.
- **Eval** (`scripts/eval.ts`, `npm run eval`): methodology scorecard (coherence/diversity/uniqueness)
  + model-call estimate; `VIBE_API_BASE=… --llm` runs against the live gateway.
- **Docs:** `PROJECT.md` · `KONZEPT.md` v0.2 · `DESIGN.md` · `DECISIONS.md` (E-001…E-034).

## What Does NOT Exist Yet

- **Advanced mode** UI (axis controls, λ/distance band, engine lens). Only a Studio/Lab toggle exists.
- **Real embeddings for B** — seeds are LLM-projected onto the axes (concept-valid stand-in).
- **Persistence** beyond in-memory (localStorage / accounts).
- **Paid gateway credits** — free tier is rate-limited; renders fall back to skeletons when throttled.

## Next Steps (in order)

1. **Top up gateway credits** (your action) to lift the free-tier rate limit → full live scenes.
2. **Advanced mode** — axis controls, engine lens, distance/λ, Lab access; offered adaptively (E-020).
3. **Engine B real embeddings** (replace LLM-axis-projection); λ/distance becomes a live slider.
4. **Persistence** — keep the Library across sessions.

## Known Issues / Watch-outs

- **Tonal fit:** Duolingo×Pro chosen (E-019); keep calibrating "chunky but not kiddie".
- **Pool size:** Engine A pools intentionally small → novelty ceiling (expected, KONZEPT §6-A).
- **Input mechanism:** briefing + LLM orchestration (E-026); the lexicon bias is a fixture, not the product.
- **Legacy salvage:** Pattern Library + Canvas + Export (direction→system→code) out of MVP scope.

## Open Questions

- 5 or 6 axes (add Formality)?
- Default batch size per Explore round (currently 5)?
- LLM gateway / provider choice — simplicity vs. cost (research in progress).
- When / under what conditions to open to external users?

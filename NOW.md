# NOW.md — Vibe Playground

> Current state. Update after every meaningful step.

## Current Goal

Wire the **LLM layer** (scene-render + Engine B/C) onto the working Studio + Lab, and pressure-test
the methods on real briefings. Subjective quality in the Lab is the first success metric (E-018);
north star is speed to a credible direction (E-014).

## What Exists

- **App — Vite + React + TS, client-side** (`src/`): Studio loop blank → Explore → live-reflow Steer
  → Iterate → Commit → Library; live **Pentagon** (5-axis radar, spread cloud); **Vibe Cards**
  (real-font typo trio, coherence pulse, Herkunft collapser, magnet controls); Speed-to-Direction
  tacho. Duolingo×Pro design tokens, accent inherits from the focused direction.
- **Engine A** behind a shared `Engine` interface (`src/engine/`): curated pools + bridge rule,
  axis-derived palette/typo/mood, deterministic seedable RNG.
- **Lab — method framework** (`src/lab/`): `WorldSource × MixStrategy × Renderer`, fully swappable.
  Mix strategies live: bridge (A), distance+λ (B-methodology, offline), triad, contrast. Metrics
  (coherence/diversity/novelty), seeded runner, side-by-side comparison matrix UI, Vitest (3 passing).
- **LLM layer — Vercel AI Gateway** (`src/llm/` + `api/`, E-029): thin proxy with model registry,
  `caching:'auto'`, model fallbacks, batch fan-out. Scene renderer (E-028), Engine B (seed-expansion)
  and Engine C (persona) wired as real Lab methods — activate with a gateway key.
- **Docs:** `PROJECT.md` (facts), `KONZEPT.md` v0.2 (full vision), `DESIGN.md` (interface),
  `DECISIONS.md` (E-001…E-028).

## What Does NOT Exist Yet

- **Gateway key not provisioned** — the LLM scene-render (E-028) + Engine B/C are built but inert
  until `AI_GATEWAY_API_KEY` / Vercel OIDC is set; offline methods run without it.
- **Real embeddings for B** — seeds are LLM-projected onto the axes (concept-valid stand-in).
- **Briefing → LLM orchestration** in the Studio (E-026) — the offline keyword lexicon is still the
  Studio's input; the Lab already passes the briefing to the LLM methods.
- **Advanced mode** UI (axis controls, λ/distance band, engine lens). Only a Studio/Lab toggle exists.
- Persistence beyond in-memory; expanded pools.

## Next Steps (in order)

1. **Provision the gateway key → go live**: set the key, `vercel dev` / deploy, then pressure-test
   `a-scene` / `b-llm` / `c-persona` on real briefings in the Lab.
2. **Wire the Studio to the LLM** — briefing input + scene render in the main loop (not just the Lab).
3. **Engine B real embeddings** (replace LLM-axis-projection); λ/distance becomes a live slider.
4. **Advanced mode** — expose axis controls, engine lens, Lab; offered adaptively (E-020).
5. Pool expansion; persistence.

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

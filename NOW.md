# NOW.md — Vibe Playground

> Current state. Update after every meaningful step.

## Current Goal

Build and validate the **MVP: Studio loop with Engine A**.
Validate via the **internal Eval/Lab harness** — subjective quality on real batch outputs is the first success metric.

## What Exists

- `vibe-playground-shell.jsx` — Duolingo-style React shell with Sidebar routing, all three engine UIs (client-side combinatorial logic), XP/Streak gamification, Vibe Card with axis-derived palette, Library screen.
- `KONZEPT.md` — full living concept doc (v0.2, German)
- `ALT-KONZEPT-ARCHIV.md` — legacy 3.0 archive with salvage candidates
- `PROJECT.md` / `DECISIONS.md` / `NOW.md` — this handoff package

## What Does NOT Exist Yet

- Real Studio loop with Explore → Steer → Iterate → Commit flow
- Attract/repel control primitive in the UI
- Simple/Advanced mode toggle (app-wide)
- Headless eval harness / Lab screen with batch runs
- Real LLM calls (engines are fully client-side/simulated)
- Persistence of any kind

## Next Steps (in order)

### Step 1 — Eval Harness (Lab, headless)

Build a headless test harness around the existing Engine A functions (`genA`).

- Runs N generations with given axis-bias params
- Outputs: Leitwert, engine note, axis vector, palette
- Auto-metrics: coherence (shared axes count), diversity (pairwise vector distance), novelty (distance to previous batch)
- Output format: readable list we can assess manually
- Entry point: runnable from the Lab screen in Advanced mode

### Step 2 — Studio Loop refactor

Refactor the current shell so the main screen is the Studio loop, not the engine-picker:

- Single “Generate” action (engine hidden in Simple, selectable in Advanced)
- Vibe Card batch (3–5 cards per round)
- Attract/repel on each card (👍/👎 + optional text input)
- Signals accumulate and bias next generation
- “Commit” saves to Library

### Step 3 — Simple/Advanced toggle

Add app-wide mode toggle:

- Simple: hides engine lens, axis controls, distance/λ params
- Advanced: exposes all machinery + Lab access

## Known Issues / Watch-outs

- **Tonal fit:** Duolingo-style playfulness may clash with the professional designer audience. Needs tonal calibration (chunky/rounded but less “kiddie”).
- **Engine B/C** are simulated — no real embeddings. λ/distance UI is real but naming step needs LLM call to be genuinely generative.
- **Pool size:** current Engine A pools are intentionally small for prototyping; need expansion once quality baseline is set.
- **Attract/repel → axis mapping:** typed keyword needs to resolve to an axis-space vector. Mechanism not yet defined (keyword lookup vs. LLM vs. embedding).
- **Legacy salvage:** Pattern Library + Canvas + Export from 3.0 are interesting as downstream modules (direction → system → code), but explicitly out of MVP scope.

## Open Questions

- Pools expand first vs. real LLM call as render step — which unblocks quality faster?
- 5 or 6 axes (add Formality)?
- Default batch size per Explore round?
- First open to external users: when / under what conditions?
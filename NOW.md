# NOW.md — Vibe Playground

> Current state. Update after every meaningful step.

## Current Goal

The full loop is **live on Vercel** and the internal Pro-MVP is essentially feature-complete:
briefing → LLM-interpreted 6 axes → one of three paths → result card → steer → save → export.
Gateway credits are topped up (live render confirmed). Subjective quality in the Lab is the first
success metric (E-018); north star is speed to a credible direction (E-014). Cost is bounded
(Studio = Sonnet, Lab = Haiku, no Opus).

## What Exists

- **App — Vite + React + TS, client-side** (`src/`): blank → Explore → live steer (Mehr so / Weniger
  so) → Iterate → Merken (Library) → Export. **Single-screen** (rail with the hexagon + controls,
  card grid, collapsible Library). Compact cards (scene + palette up front, typo/Herkunft behind Details).
- **6 axes** (E-039): material · energy · time · structure · density · **formality** — shown as a
  **hexagon**; drives palette/typo/the radar. Components are generic over AXES.
- **Three generation paths** (Studio lens, plain-named E-040):
  - **Katalog** — curated style list, rule-combined, then the LLM writes name + scene.
  - **Generativ** — the model invents terms, embeds them (`text-embedding-3-small`, 1536-dim),
    picks two by cosine distance in a tension band, blends, then the LLM writes name + scene (E-036).
  - **Persona** — the model invents a fictional originator and writes everything in one call.
- **Briefing → axes via the model** (E-034): Explore projects the briefing onto the 6 axes (lexicon
  fallback) so the briefing steers the hexagon, not just the wording.
- **LLM layer — Vercel AI Gateway** (`src/llm/` + `api/`, E-029): thin proxy, model tiers (E-030),
  `caching:'auto'`, fallbacks, usage logging. Endpoints: `interpret · render · batch · seeds ·
  persona · health`. Rate-limit/offline → skeleton fallback + banner with top-up link.
- **Advanced (adaptive, E-037)**: unlocks on first steer; **lens** (Katalog/Generativ/Persona) +
  **tension knob** (safe↔experimental → spread + cosine band width).
- **Persistence (E-035)**: localStorage — Library, commits, advanced/lens/tension survive reload.
- **Judge-select (E-041)**: every Explore/Iterate round generates a few extra candidates, the
  cheap LLM-judge scores each (1–5 coherence/trigger/fit/freshness), and the Studio keeps the best —
  the score shows on the card. The production fitness step the eval proved is the real quality lever
  (not the mixing math). Degrades to original order if the judge is unreachable.
- **Lab** (`src/lab/`): the remaining methods side by side on the same briefings. Structural metrics
  (coherence/diversity/uniqueness) for reference + the **LLM-judge scorecard** (`npm run eval -- --judge`)
  for actual quality. Runs on Haiku. Cut: x-triad / x-contrast (judged 3.04/3.13, below every LLM path).
- **Docs:** `PROJECT.md` · `KONZEPT.md` · `DESIGN.md` · `DECISIONS.md` (E-001…E-041).

## What Does NOT Exist Yet

- **Accounts / sharing / backend** (Supabase/Neon) — deferred; only needed if it goes public.
- **Axis sliders & model/batch controls** in Advanced — deferred (kept the surface lean).
- **Stacking** the three paths (Persona → Generativ → Katalog as one pipeline) — currently you pick one.

## Quality, measured (E-041…E-044)

The eval has a real **LLM-judge** fitness function. Validated on the strict **Opus** grader
(9 briefings, 88 calls): the three LLM paths (Generativ 3.68 · Persona 3.61 · Katalog 3.60) sit a
clear ~0.65 above the offline template baselines (~2.95). The **fit fix (E-042) is confirmed** —
`fit` went from the weakest sub-score to the strongest (b-llm 4.08). Remaining lower bound is
**freshness** (~3.2): the next quality lever, if we chase one, is originality — not fit or the mixer.

## Next Steps (in order)

1. **Watch judge-select cost/latency** in the Studio: OVERSCAN = BATCH+2 (7 renders → keep 5) + 7
   parallel cheap judges per round. If latency hurts the "speed to direction" north star, drop OVERSCAN
   to BATCH (rank-only) or make it opt-in.
2. **(Optional) Freshness lever** — push renders away from cliché toward more singular worlds
   (the only sub-score the strict judge still marks down).
3. **Tune the tension band** (Generativ) against real briefings so "safe ↔ experimental" is felt.
4. Optional: a "stacking" path; accounts/persistence-backend if public.

## Known Issues / Watch-outs

- **Pool size:** the curated Katalog list is intentionally small; Generativ (embeddings) is the path
  that lifts variety.
- **Lens B/C latency:** Generativ/Persona render per card sequentially → slower than Katalog's one batch.

## Open Questions

- Default batch size per Explore round (currently 5)?
- When / under what conditions to open to external users?

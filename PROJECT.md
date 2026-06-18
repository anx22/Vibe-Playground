# PROJECT.md — Vibe Playground

> Stable facts. No chat history. Update when architecture changes.

## What this is

A **design-direction generator** for professional designers/art directors. It produces
**Leitwerte** — compressed world-references (e.g. *Black-Box-Vigilanz*) that translate into
coherent, non-cliché design output when fed to a design AI. Core job: zero → a credible,
*surprising-yet-apt* direction, fast.

## The core idea

A Leitwert names **the opposite that unexpectedly fits**: the brief's deep structure (Wirkstruktur)
leapt into a far-off domain that *rhymes* with it. Surprise comes from **domain distance**, aptness
from **structural resonance** — decoupled, so both maximize at once. Two non-negotiables:

- **No invented axes in generation.** Coordinates flatten analogy and breed cliché. Coherence comes
  from one distilled essence, not a shared coordinate. (Axes may live only in measurement/steering.)
- **Leitwert (directive) ≠ Creative Derivation (why it holds).** Never blur them — that prevents the
  "decorative scene as if it were a spec" failure (the *Eisblumen* trap).

## The engines (each a creative derivation; one harness)

| Engine | Principle | Cost |
|---|---|---|
| **D · Verschränkung** | essence → burn clichés → far-but-rhyming worlds → affordance≥5 → bridge → name. One call. | fast |
| **F · Werkbank** | Volume→Filter→Curation: wide field × operators, over-generate 3× / cut ⅔, cluster into orthogonal taste-directions. | fastest, pure prompt |
| **Persona** | a fictional originator whose aesthetic falls out as the vibe. | fast |

Detailed specs: [`docs/engines/`](./docs/engines). Adding a method = **1 endpoint + 1 client fn +
1 `Source` entry**; the bridge contract, card mapping and constellation are shared.

## Interface — the constellation

The **Leitidee** (briefing) sits at the center; each engine forms its own accent-coded **cluster**
around it. Up to **5 gold anchors** pull into a ring near the center and gravitate the next wave
(center stays). Click a block → flyout (worlds + rhyme, object, derivation, affordances, palette) →
**anchor** or **copy/export** as a ready design-brief prompt. The control primitive is the anchor;
all feedback resolves there.

## Quality measurement

An **LLM-judge** scores each block (on-target × surprise × craft) and selects the strongest per
cluster (judge-select). Headless eval: `npm run eval -- --judge [--judge-tier premium]` compares
engines on the same briefings; Opus is the strict grader. Human verdict is primary.

## Tech

- **Vite + React + TS**, client-side; **Framer-Motion** for the constellation.
- **Vercel AI Gateway** via a thin `api/` serverless proxy (key never client-side; OIDC on Vercel).
  Model tiers: cheap=Haiku, strong=Sonnet, premium=Opus (judge only).
- **Deploy chain:** Claude → GitHub → Vercel. Production builds from `main`.

## Reference docs

`README.md` (run + layout) · `KONZEPT.md` (concept) · `DESIGN.md` (UI) · `DECISIONS.md` (decisions) ·
`NOW.md` (state) · `docs/engines/` (engine specs D/E/F).

# PROJECT.md — Vibe Playground

> Stable facts. No chat history. Update when architecture changes.

## What this is

A **Denkanstoß generator** for professional designers/art directors. From a briefing it produces open
**clusters** of raw world-material — a vivid Welt-Satz, a Leitwert anchor, and loose Funde /
Materialien / Bild-Referenzen — that a downstream design/image AI turns into something beautiful. It
prescribes **no design itself**. Core job: zero → a credible, *surprising-yet-premium* direction, fast.

## The core idea

Each result is a **Denkanstoß-Cluster**, not a finished design. A **Leitwert** is a 2–4-token compound of
concrete, tangible world/material terms (e.g. *Letterpress-Seidenband*) that triggers a visual world. Each
engine mixes two registers per round, **unlabeled**: **nah/premium** (best-in-class from the brief's own
world, conventions OK) and **fern/surprising** (a far, rhyming collision). The user feels the mix.

## The engines (each a creative derivation; one harness)

| Engine | Principle |
|---|---|
| **Synthese** (`api/synthese`) | collision: sense the brief's core, find nah-premium and far-rhyming worlds, emit each as a cluster. |
| **Persona** (`api/persona`) | a fictional originator whose world — and cluster — falls out of its existence. |

Adding a method = **1 endpoint + 1 client fn + 1 `Source` entry**; the cluster contract, card mapping and
field are shared. The prompts — the quality knob — live entirely in `api/_lib/setup/*.yaml`.

## Interface — the bento field

Each engine is a **panel** (hero tile + satellites) under the **Leitidee** header and **anchor strip**.
Click a tile → a drawer renders the full cluster (Welt-Satz + the three lists), **discreetly copyable** at
three grains (einzeln / gruppiert / gesamt). The control primitive is the **anchor** (max 5); it
gravitates the next wave.

## Quality measurement

An **LLM-judge** scores each cluster (on-target × surprise × craft × **formSubstanz**); onTarget +
formSubstanz are non-negotiable **gates**, surprise + craft rank the survivors per panel; `spreadByMix`
interleaves nah/fern. Headless eval: `npm run eval` compares engines on
the same briefings; Opus is the strict grader. Human verdict is primary.

## Tech

- **Vite + React + TS**, client-side; **Framer-Motion** for the drawer.
- **Vercel AI Gateway** via a thin `api/` serverless proxy (key never client-side; OIDC on Vercel).
  Model tiers: cheap=Haiku, strong=Sonnet, premium=Opus (judge only).
- **Deploy chain:** Claude → GitHub → Vercel. Production builds from `main`.

## Reference docs

`README.md` (run + layout) · `KONZEPT.md` (concept) · `DESIGN.md` (UI) · `DECISIONS.md` (decisions) ·
`NOW.md` (state). The living engine spec is the prompt YAML in `api/_lib/setup/`.

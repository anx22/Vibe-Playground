# PROJECT.md — Vibe Playground

> Stable facts. Do not encode transient chat history. Update when architecture changes.

## What This Is

A **design-direction generator** for professional designers and art directors.
It produces **Leitwerte** (compressed world-references like “Editorial-Tech-Atlas”) that reliably translate into coherent design output when fed to an LLM.
Core job: get from zero to a credible design direction, fast.

## The Core Concept

### Leitwert Anatomy

A Leitwert is NOT a style label — it’s a **collision of two worlds + a grounding object metaphor**:

- `[Home world] × [Intrusion] → [Object metaphor]` → e.g. “Editorial-Tech-Atlas”
- The collision creates tension; the shared axis between the two worlds makes it coherent (not noise).

### Vibe Space (5 axes, each –1..1)

|Key      |–1              |+1          |
|---------|----------------|------------|
|material |cold/synthetic  |warm/organic|
|energy   |quiet/restrained|loud/raw    |
|time     |historic        |futuristic  |
|structure|organic         |grid/system |
|density  |sparse          |dense       |

### Coherence Rule

Two worlds may only collide if they **share at least one axis sign**. Shared value = bridge. No shared axis = incoherent noise.

## Three Engines (all produce Leitwerte, different coherence principles)

|Engine          |Principle                                                                       |Status                             |
|----------------|--------------------------------------------------------------------------------|-----------------------------------|
|A · Grammar     |Curated pools + bridge rule (≥1–2 shared axes)                                  |✅ Implemented (client-side)        |
|B · Latent-Space|Cosine distance bands (0.4–0.7 = tension), λ-interpolation, novelty filter      |🟡 Simulated, no real embeddings yet|
|C · Author      |Fictional persona (origin × client × quirk); coherence via narrative consistency|🟡 Simulated                        |

**Stacking plan (future):** C seeds → B ensures distance/novelty → A pools act as safety net.

## Control Primitive (single, app-wide)

Everything collapses into **attract (+) / repel (−)**:

- Typed goal word = attract
- Typed exclusion = repel
- 👍 on a card = attract
- 👎 on a card = repel
  All signals bias the axis-space sampling. No other input type needed.

## User Flow

`Explore → Steer → Iterate → Commit`

1. Optional context input (theme word) or blank slate — both valid
1. Explore: max spread batch (novelty logic)
1. Steer: attract/repel signals accumulate
1. Iterate: re-generate, narrower
1. Commit: keep one direction → Library

## Two Faces of the App

- **Studio** — user-facing generation loop
- **Lab** — internal eval harness (us); batch runs, quality assessment, pool tuning

## Simple / Advanced Mode (app-wide toggle)

- **Simple:** engine hidden, clean loop only
- **Advanced:** engine lens (A/B/C), axis controls, distance band, λ, temperature, Lab access

## Minimum Output per Direction (Vibe Card)

- Leitwert (the compound word)
- Mood modifier
- Typography trio: Display font / Body font / Data font (with roles)
- 3-tone palette derived from axis vector

## Primary User

Professional designers / art directors. High standards, want control + speed. Advanced mode is core for them, not a niche feature.

## Tech Stack (current)

- React (JSX), client-side only
- No backend, no auth, no persistence (in-memory)
- No real LLM calls yet — engines run combinatorially
- Existing shell: `vibe-playground-shell.jsx`

## Reference Docs

- `KONZEPT.md` — full living concept doc (German)
- `DECISIONS.md` — append-only decision log
- `NOW.md` — current goal, next steps, known issues
- `ALT-KONZEPT-ARCHIV.md` — legacy Playground 3.0 archive (salvage candidates)

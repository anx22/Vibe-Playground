# NOW.md — Vibe Playground

> Current state. Update after every meaningful step.

## Where it stands

Live on Vercel. The app is the **constellation**: briefing → four engine clusters of hex blocks →
anchor up to 5 gold → "aus Ankern ableiten" → flyout → copy/export. All four generators run live
(Verschränkung · Latent-Agent · Werkbank · Persona), judge-selected per cluster. Glossy-plastic
theme. North star: speed to a credible, surprising direction.

## What exists

- **Constellation UI** (`components/Constellation.tsx`) — center Leitidee, per-engine clusters,
  anchors-as-gravity, draggable canvas, focus flyout, copy/export. Framer-Motion.
- **Four engines** as a pluggable `Source` registry (`store/useVibeStore.ts`), each an `api/`
  endpoint sharing one bridge contract + `bridgeToCard`: `entangle` (D) · `latent` (E) ·
  `workbench` (F) · `persona`. Plus `judge`, `interpret`, `health`.
- **Judge-select + quality floor** (`llm/select.ts`, E-063) — over-generate (guard-max), score
  on-target×surprise×craft×**designValue** (a derivable design-value, not a story/bullshit — the
  north-star fail-conditions), drop everything under the floor; a cluster that comes back thin
  **stays thin** — no refill pass (E-064), an honest sparse lane over "best of bad". A persisted **novelty memory** (`useVibeStore`) repels
  already-produced Leitwerte each round so quality stays consistent at scale.
- **Eval** (`scripts/eval.ts`) — `npm run eval -- --judge` compares engines on shared briefings.
- **Gateway proxy** (`api/_lib/`) — tiers, `caching:'auto'`, fallbacks; `embed`/`cosineDist` for E.

## Deferred / not yet built

- **Engine E Tier-1**: external concept corpus + pgvector (Supabase/Neon connected), multi-generation
  QD/MAP-Elites archive. Cross-session novelty now exists at the **text level** (E-063); the upgrade is
  **embedding-semantic** novelty — catching paraphrase-dups, not just exact/normalized repeats. Today E
  is single-round, in-request.
- **Courage dial** (F) and **attract/repel beyond anchors** — feedback currently = anchors only.
- **Sub-clustering F's taste-directions** visually inside its cluster (now a flat cluster + flyout tag).
- **Accounts / sharing / persistence backend** — only if it goes public.

## Watch-outs

- **Latency:** a round runs 4 engines in parallel; **Engine E is the slow path** (2 strong calls +
  embeddings). If speed bites, gate E behind a toggle (its spec marks it Phase-2).
- **Cost:** judge-select adds parallel cheap-judge calls per round; Opus only in the eval.
- **Palette from F/D/E is model-suggested hex** (sanitized), not axis-derived.

## Open questions

- Should Engine E stay always-on, or gated until it beats D/F in the Lab on surprise/diversity?
- Default blocks-per-cluster (now 6) and anchor-derivation behaviour — branch vs. blend?

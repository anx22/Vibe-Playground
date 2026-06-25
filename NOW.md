# NOW.md — Vibe Playground

> Current state. Update after every meaningful step.

## Where it stands

Live on Vercel. Briefing → two engine panels (**Synthese** · **Persona**) → each result is an open
**Denkanstoß-Cluster** (a vivid Welt-Satz + Leitwert + Metaphern / Materialien / Bild-Vergleiche) that
feeds a downstream design/image AI — the playground prescribes **no design itself**. Anchor up to 5 gold
→ „aus Ankern ableiten" → detail drawer with the full cluster, copyable. North star: speed to a credible,
surprising **and** premium-when-wanted direction.

## What exists

- **Bento-field Studio** (`components/Board.tsx`) — two engine panels, each a **hero** tile (judge-#1,
  Leitwert + Welt-Satz teaser) over satellite tiles; a tile opens a **detail drawer** rendering the
  cluster via the reusable **`ClusterCard`**, with discreet hover-copy at three grains — single line,
  group, whole cluster. Leitidee header + anchor strip on top. Framer-Motion.
- **Two engines** as a pluggable `Source` registry (`store/useVibeStore.ts`), each an `api/` endpoint
  sharing one cluster contract + `clusterToCard`: **Synthese** (collision) · **Persona** (fictional
  source). Plus `judge`, `health`. Each engine mixes **nah/premium** (best-in-class from the brief's own
  world, conventions OK) and **fern/surprising** per round — felt, never labeled.
- **Judge-select + quality floor + mix-spread** (`llm/select.ts`) — over-generate, score
  on-target × surprise × craft × **designValue** (a derivable world/material value, not a story), drop
  everything under the floor; `spreadByMix` interleaves nah/fern so the field feels the mix. A persisted
  **novelty memory** repels already-produced Leitwerte each round. A thin lane stays thin (no refill).
- **Prompts in YAML** (`api/_lib/setup/*.yaml`) — the whole creative surface (engine roles, the shared
  `cluster` / `mix` / `diversity` / `compass` / `leitwert` / `register` / `render_probe` rules, the judge
  rubric) in one editable place; `npm run setup` assembles `setup.generated.ts`.
- **Eval** (`scripts/eval*.ts`) — headless harness over shared briefings (deterministic metrics + LLM
  judge); `npm run eval`.
- **Gateway proxy** (`api/_lib/`) — model tiers, caching, fallbacks, input guards (`guard.ts`).

## Watch-outs

- **Latency:** a round runs both engines in parallel + one batched judge call.
- **Cost:** judge-select adds one batched cheap-judge call per round; Opus only in the eval.

## Open questions

- Default results-per-panel (now ~5) and anchor-derivation — branch vs. blend?
- Is the nah/fern split landing ~half/half in practice, or does one pole dominate per brief?

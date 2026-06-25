# Vibe Playground

A **Denkanstoß generator** for designers/art directors. From a briefing it produces open **clusters** of
raw world-material — a vivid Welt-Satz, a Leitwert anchor, and loose Metaphern / Materialien /
Bild-Vergleiche — that a downstream design/image AI turns into something beautiful. It prescribes **no
design itself**. Core job: zero → a credible, *surprising-yet-premium* direction, fast.

## Docs

| Doc | Purpose |
|-----|---------|
| [`PROJECT.md`](./PROJECT.md) | Stable facts — concept, engines, tech |
| [`KONZEPT.md`](./KONZEPT.md) | Concept (German) |
| [`DESIGN.md`](./DESIGN.md) | The Studio UI (bento field) |
| [`DECISIONS.md`](./DECISIONS.md) | Decision log |
| [`NOW.md`](./NOW.md) | Current state, watch-outs |

The living engine spec is the prompt YAML in [`api/_lib/setup/`](./api/_lib/setup).

## Run

```bash
npm install
npm run dev            # Vite dev server (app only; engines need the gateway)
npm run build          # setup + typecheck + production build
npm test               # vitest
npm run typecheck:api  # type-check the serverless functions
VIBE_API_BASE=https://<app>.vercel.app npm run eval -- --judge   # compare engines on the judge
```

## Engines (one harness)

Two serverless endpoints emit the shared **cluster contract**; the client maps it via `clusterToCard`
into the Board field. Adding one = **1 endpoint + 1 client fn + 1 `Source` entry**.

- **Synthese** (`api/synthese`) — collision: nah-premium + far-rhyming worlds → cluster.
- **Persona** (`api/persona`) — a fictional originator → cluster.

Each engine mixes nah/premium + fern/surprising per round. Quality via the **LLM-judge** (on-target ×
surprise × craft × designValue): judge-select in the Studio, `--judge` in the eval. All prompts live in
`api/_lib/setup/*.yaml` (`npm run setup` assembles them into `setup.generated.ts`).

## LLM layer — Vercel AI Gateway

One key for every model. A thin proxy (`api/`) holds the key (never client-side; `VERCEL_OIDC_TOKEN` on
Vercel). `MODELS` tiers: cheap=Haiku, strong=Sonnet, premium=Opus (judge only). `caching:'auto'` +
per-instance cache + model failover. `guard.ts` caps the public endpoints.

## Layout

```
src/
  engine/      types (VibeCard · Quality) · index
  llm/         schema (zod cluster contract) · client (fetchers) · select (judge-rank · spreadByMix) · metrics (eval)
  store/       useVibeStore (zustand) — SOURCES registry, anchors, explore/iterate
  lab/         ClusterCard (title + Welt-Satz + copyable lists) · LabPreview
  studio/      Studio · StudioApp (#studio preview)
  components/  Board (bento field + detail drawer)
  export.ts    cluster → clusterText (gesamt) + groupText (gruppiert)
api/           synthese · persona · judge · health
  _lib/        gateway (tiers · caching) · prompts · schema · guard · setup/*.yaml
scripts/       eval · eval-vibe · eval-local · show-one · build-setup
```

## Deploy

Claude → GitHub → Vercel. Production builds from `main`.

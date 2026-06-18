# Vibe Playground

A **design-direction generator** for professional designers/art directors. It produces **Leitwerte**
— compressed world-references (e.g. *Black-Box-Vigilanz*) that translate into coherent, non-cliché
design output when fed to a design AI. Core job: zero → a credible, *surprising-yet-apt* direction,
fast.

## Docs

| Doc | Purpose |
|-----|---------|
| [`PROJECT.md`](./PROJECT.md) | Stable facts — concept, engines, tech |
| [`KONZEPT.md`](./KONZEPT.md) | Concept (German) |
| [`DESIGN.md`](./DESIGN.md) | The Studio UI (bento field) |
| [`DECISIONS.md`](./DECISIONS.md) | Decision log |
| [`NOW.md`](./NOW.md) | Current state, deferred, watch-outs |
| [`docs/engines/`](./docs/engines) | Engine specs D · E · F |

## Run

```bash
npm install
npm run dev            # Vite dev server (app only; engines need the gateway)
npm run build          # typecheck + production build
npm test               # vitest
npm run typecheck:api  # type-check the serverless functions
VIBE_API_BASE=https://<app>.vercel.app npm run eval -- --judge   # compare engines on the judge
```

## Engines (one harness)

Each engine is a serverless endpoint emitting the shared **bridge contract**; the client maps it via
`bridgeToCard` into the Board field. Adding one = **1 endpoint + 1 client fn + 1 `Source` entry**.

- **D · Verschränkung** (`api/entangle`) — essence → burn clichés → far-but-rhyming worlds → bridge.
- **F · Werkbank** (`api/workbench`) — Volume→Filter→Curation; over-generate, cut ⅔, taste-directions.
- **Persona** (`api/persona`) — a fictional originator.

No invented axes in generation. Quality via the **LLM-judge** (on-target × surprise × craft):
judge-select in the Studio, `--judge` in the eval.

## LLM layer — Vercel AI Gateway

One key for every model, no per-provider tokens. A thin proxy (`api/`) holds the key (never
client-side; `VERCEL_OIDC_TOKEN` injected on Vercel). `MODELS` tiers: cheap=Haiku, strong=Sonnet,
premium=Opus (judge only). `caching:'auto'` + per-instance cache + model failover.

## Layout

```
src/
  engine/      types · axes · derive (palette/typo) · pools (fonts + lexicon) · index
  llm/         schema (zod, shared) · client (fetchers) · select (judge-rank)
  store/       useVibeStore (zustand) — SOURCES registry, anchors, explore/iterate
  components/  Board (bento field + detail drawer) · ExportModal
  export.ts    block → one-line trigger + target prompt (MJ/ChatGPT/Brandboard)
api/           entangle · workbench · persona · judge · interpret · health
  _lib/        gateway (tiers · caching · embed · cosineDist) · prompts · schema
scripts/eval.ts   headless engine comparison on the judge
```

## Deploy

Claude → GitHub → Vercel. Production builds from `main` (`vercel.json`: pinned install, `dist`).

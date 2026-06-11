# Vibe Playground

A **design-direction generator** for professional designers and art directors.
It produces **Leitwerte** — compressed world-references (e.g. “Editorial-Tech-Atlas”) that
translate into coherent design output when fed to an LLM. Core job: get from zero to a
credible design direction, fast.

## Docs

| Doc | Purpose |
|-----|---------|
| [`PROJECT.md`](./PROJECT.md) | Stable facts — architecture, core concept, tech stack |
| [`KONZEPT.md`](./KONZEPT.md) | Living concept doc (German) |
| [`DECISIONS.md`](./DECISIONS.md) | Append-only decision log |
| [`NOW.md`](./NOW.md) | Current goal, next steps, known issues |
| [`ALT-KONZEPT-ARCHIV.md`](./ALT-KONZEPT-ARCHIV.md) | Legacy Playground 3.0 archive |

## Run

```bash
npm install
npm run dev      # Vite dev server
npm run build    # typecheck + production build
npm test         # vitest (Lab harness)
```

## Lab — method framework (open creative space)

The Lab (toggle top-right) is the eval harness, built as swappable parts so the creative space
stays open — **not** hardwired to the C→B→A stack:

```
WorldSource  →  MixStrategy  →  Renderer        (one wiring = one "Method")
curated (A)     bridge (A)       template (offline)
llm-seed (B)    distance+λ (B)   llm-scene (E-028, needs key)
persona (C)     triad / contrast / …
```

Add a new mixing idea, world source, or composition as a registry entry in `src/lab/methods.ts` —
single engines, 2-/3-/N-way blends and experiments all show side by side, each scored on
**coherence · diversity · novelty**. LLM-gated methods activate via the "LLM aktiv" toggle once the
gateway proxy is reachable. Briefings drive the run (offline keyword stand-in for the LLM
orchestration, E-026).

## LLM layer — Vercel AI Gateway (E-029)

One key for every model, **no per-provider token management**. A thin serverless proxy (`api/`) holds
the key and talks to the gateway via the AI SDK; the key is **never client-side**.

```
src/llm/      schema (zod, shared) · client (fetchers, graceful offline fallback)
api/          health · interpret (briefing→axes, E-034) · render (scene, E-028) · seeds · persona · batch
api/_lib/     gateway (model registry · caching:'auto' · model fallbacks · in-instance cache) · prompts
```

- **Caching:** `providerOptions.gateway.caching: 'auto'` adds Anthropic `cache_control` automatically;
  plus a per-instance response cache. Token-level savings come from the gateway.
- **Model management:** `MODELS` registry (cheap = Haiku, strong = Sonnet, premium = Opus) with
  per-model failover (`gateway.models`) and `sort: 'cost'` — swap a role in one place.
- **Batch:** `api/batch` fans out renders with a concurrency limit. (The async 50%-off Anthropic
  Batch API needs a direct key + polling; left as a future BYOK adapter — same interface.)

**Run locally with LLM:** set `AI_GATEWAY_API_KEY` in `.env.local`, then `vercel dev` (plain `vite`
serves the app; the offline methods work without any key). On Vercel, `VERCEL_OIDC_TOKEN` is injected
automatically — no key to manage.

## Status

First slice of the Studio is live: **Vite + React + TypeScript**, client-side only — no backend,
no auth, in-memory state. Engine A (`src/engine/`) runs combinatorially behind the shared `Engine`
interface (no real LLM yet). The Studio implements the blank-slate → Explore → live-reflow Steer →
Iterate → Commit loop with the live Pentagon, Vibe Cards, and the Speed-to-Direction tacho.
See `DESIGN.md` for the interface concept and `NOW.md` for the current focus.

### Layout

```
src/
  engine/      types · axes · pools · derive (palette/typo/mood) · engineA · index (registry)
  lab/         method framework (WorldSource·MixStrategy·Renderer) · mix · sources · render
               · metrics · runner · methods (registry) · lab.test.ts
  store/       useVibeStore (zustand) — signals → centroid/spread, live-reflow, view toggle
  hooks/       useTweenVector — the pentagon's spring
  components/  Pentagon · VibeCard · Collapser · Tacho · Lab
  App.tsx      Studio loop + Library drawer + Lab view
```

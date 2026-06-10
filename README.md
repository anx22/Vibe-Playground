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
```

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
  store/       useVibeStore (zustand) — signals → centroid/spread, live-reflow
  hooks/       useTweenVector — the pentagon's spring
  components/  Pentagon · VibeCard · Collapser · Tacho
  App.tsx      Studio loop + Library drawer
```

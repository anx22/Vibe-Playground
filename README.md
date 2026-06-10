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

## Status

Early scaffold. React (JSX), client-side only — no backend, no auth, no persistence yet.
Engines run combinatorially (no real LLM calls). See `NOW.md` for the current focus.

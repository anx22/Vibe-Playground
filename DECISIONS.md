# DECISIONS.md — Vibe Playground

> Append-only. Never delete or edit past entries. Add new ones at the bottom.

|ID   |Decision                                                                         |Rationale                                                                           |
|-----|---------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
|E-001|Leitwert is the core primitive; modifiers are optional                           |The compound word alone triggers coherent LLM output; everything else individualizes|
|E-002|Categorize via **axis space**, not a fixed style list                            |Fixed lists overfit and exhaust; axes give infinite positions between named styles  |
|E-003|Coherence via **bridge rule** (shared axis) + object metaphor                    |Shared axis = coherent tension; no shared axis = noise                              |
|E-004|Three engines with orthogonal coherence principles (Rule / Metric / Person)      |Each covers the other’s weakness; stackable                                         |
|E-005|Concept doc as **Markdown** (living), not Word                                   |Developer-friendly, version-controllable, always open                               |
|E-006|Shell in **Duolingo style**, routing via state, client-side prototype first      |Fast to build, no infra needed, proves the concept                                  |
|E-007|Tool = **direction generator**; engine choice is machinery, not UX               |Users want directions, not algorithm selection                                      |
|E-008|**Simple / Advanced mode app-wide** instead of hiding engine completely          |Avoids “magic box” feeling for power users; one toggle scales to future features    |
|E-009|Two faces: **Studio** (user) ↔ **Lab** (internal eval)                           |Lab is the quality instrument, not a future nice-to-have                            |
|E-010|**Single control primitive: attract/repel** — feedback collapses into it         |Radically simple; typed goals, exclusions, thumbs = same signal type                |
|E-011|User flow: **Explore → Steer → Iterate → Commit**, context-optional              |Blank slate must work; context biases but never gates                               |
|E-012|Internal **eval engine / headless harness** for batch test runs                  |Subjective quality assessed in Lab is the first success metric                      |
|E-013|Primary user = **professional designers / art directors** → Advanced mode is core|High standards, want control; Duolingo playfulness may need tonal adjustment        |
|E-014|North star = **speed to a credible design direction**                            |Tempo is the lead metric                                                            |
|E-015|Minimum output = **Leitwert + Mood + Typography trio**                           |Defines Vibe Card floor; everything else is additive                                |
|E-016|MVP = **Studio loop with Engine A** (client-side, no LLM)                        |Deterministic, debuggable, no infra risk in v1                                      |
|E-017|Simple-mode default lens = **Auto/mixed** (= A in MVP)                           |Neutral label; B/C blend in later without breaking the contract                     |
|E-018|First success metric = **subjective quality in Lab** (auto-signals supporting)   |Right for the sharpening phase; add user-side metric later                          |
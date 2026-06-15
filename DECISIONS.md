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
|E-019|Design language = **Duolingo × Pro** (playful, chunky, tactile — but elevated)   |Max fun while vibing, pro standards; "chunky/rounded but less kiddie" (NOW risk)     |
|E-020|Engine visibility = **Simple default**, lens = Auto/mixed; Advanced is offered    |Pros land in the clean loop; machinery unfolds on demand, not a hard mode switch    |
|E-021|Vibe Space = **live Pentagon/radar as the heartpiece** (not a pro control)       |The radar is the toy you vibe with; attract/repel springs the vector + spread cloud |
|E-022|Steering = **live-reflow, no regenerate**; new batch only on explicit Iterate     |Predictable, no jank; maps 1:1 to Explore→Steer→Iterate→Commit                       |
|E-023|First build = **Vite + React + TS**, Engine behind an interface (`Engine`)        |Keeps client-side MVP; LLM/embedding step plugs in later without a rewrite          |
|E-024|Output = **the vibe itself** (evocative world-collision, scene-like); palette/typo/mood co-generated but secondary|"Vibe is king" — the Leitwert/scene is the deliverable, not a prompt/render/system export|
|E-025|Object metaphor = **functional grounding** (pulls the axis vector, shapes output)  |Not decorative; the metaphor is a real coherence + output lever (strongest hebel)    |
|E-026|Input = **natural-language briefing** (idea/product/direction); an **LLM orchestrates** brief→vibe|No keyword→axis lexicon; the user briefs, the model interprets and steers the space  |
|E-027|Vibe Card floor = **Leitwert + Mood + Typo-trio**; 3-tone palette is **additive**  |Resolves PROJECT.md vs E-015; palette stays generated but is not the minimum         |
|E-028|Leitwert generation = **structure proposes, LLM renders**; the compound skeleton alone is not the deliverable|Engine A "sits in the structure; the LLM renders" — the evocative render is the magic, currently missing|
|E-029|LLM layer = **Vercel AI Gateway** via a thin `api/` proxy; one key, no per-provider token management|Zero markup, `caching:'auto'`, model fallbacks; key server-side only. Model registry (cheap/strong/premium); batch = concurrent fan-out (Anthropic Batch a future BYOK adapter)|
|E-030|**Model tiers**: Studio = `strong` (Sonnet), Lab/eval = `cheap` (Haiku), Opus never called|Bounds token cost; Lab compares methodology, not polish. Usage logged per call.|
|E-031|Engine A gets **variety (top-K) + novelty filter** + bigger pools; mirrored into Lab mix/render|Kills the repetition (a-bridge uniqueness 60%→100%) at full coherence; Studio & Lab consistent|
|E-032|**Single-screen Studio**: sticky rail (Pentagon + controls) · scrollable card grid · collapsible Library panel; compact card (details behind collapser)|Everything visible at once, no long scroll (the prior vertical stack)|
|E-033|**Library export**: a committed direction → a copy-ready prompt/brief (client-side, no tokens)|Closes the output surface (E-024) — the vibe becomes reusable in any LLM/tool|
|E-034|Input = **LLM-interpreted briefing → axis vector** (`/api/interpret`, cheap), lexicon as fallback|Realises E-026 for the *structure*, not just the scene; the briefing actually steers the Pentagon|
|E-035|Finish line = **internal Pro-MVP**; persistence = **localStorage** (zustand persist: library, commits, advanced, lens, tension)|No login/backend; survives reload. Supabase/Neon deferred unless it goes public|
|E-036|Engine B = **real embeddings** (`text-embedding-3-small`); collisions by cosine-band (continuous bridge rule), 5-axis λ-blend for visuals|"Coherence by metric" made real (KONZEPT §6-B); breaks the novelty ceiling; band is the tension knob|
|E-037|**Advanced = adaptive** (unlocks on first steer); exposes **engine lens** (Auto/B/C) + **tension knob** (safe↔experimental). Axis sliders / model+batch deferred|Pros get depth without a "magic box" or clutter; matches E-020. Lens swaps the Studio engine; tension = spread + latent band width|
|E-038|Polish: gamification **toned down** (Speed-to-Direction tacho kept, streak/XP removed); **rate-limit banner** with top-up link on fallback; blank-slate **minimal** (no example-briefing chips)|Pro audience over Duolingo kiddie-ness; honest about throttling; a briefing is the user's own brief, not a canned category|
# ENGINE-D-SPEC — Structural Entanglement Engine

> **Role:** Specification of the *creative core* of Vibe Playground — the engine that generates highly creative, non-cliché Leitwerte. Evolution beyond Engines A/B/C.
> **Audience:** Claude Code (implementer).
> **Altitude:** Behavior, contracts, guardrails, acceptance criteria. **No implementation prescribed.** No microcode. Specify the *thinking*.
> **Complements:** `PROJECT.md`, `DECISIONS.md`, `NOW.md`, `KONZEPT.md`. Domain terms kept in German on purpose (Leitwert, Wirkstruktur).

---

## 1. Purpose

Generate Leitwerte by finding **the opposite that unexpectedly fits** — a structural analogy between maximally distant domains.

One sentence: *Read a topic's deep structure, leap to a far-off domain that rhymes with it, and name the collision.*

This engine reproduces, deliberately and controllably, the move a strong LLM makes when it freestyles a design direction for an arbitrary topic and lands on something like "Archiv-Editorial-Goldschuppen" for a knowledge-graph/RAG topic — surprising, never from buzzwords, yet apt.

---

## 2. Core Principle — Structural Entanglement

Two forces, **both maximized at once**:

- **Domain Distance ↑** — the further the source world sits from the topic's literal domain, the more surprising.
- **Structural Resonance ↑** — the more the source world's *inner logic* matches the topic's essence, the more it fits.

The tension *between* these two is the creativity. Mental model: two **entangled particles** — different locations, identical latent state.

**Where coherence comes from:** NOT a shared coordinate. Axes are **banned from generation** (they flatten analogy into coordinates and kill surprise). Coherence comes from the fact that every chosen world descends from **one distilled essence** (the Wirkstruktur). Distance and binding originate from the same source.

> Axes survive ONLY in the steering layer (attract/repel) and the eval layer (measurement). The generative engine never touches them.

---

## 3. Definitions

- **Essence (Wirkstruktur):** the topic's relational/dynamic core, stated abstractly, stripped of surface domain. Example: knowledge-graph/RAG → "networked retrieval of precious items from a vast, ordered abundance."
- **Source Domain / World:** a concrete real-world realm (craft, geology, ritual, industry, antiquity, street, kitchen, deep sea…) used as the metaphor donor.
- **Domain Distance:** how far the source world is from the topic's literal subject. High is the target.
- **Structural Resonance:** how strongly the source world's inner logic *rhymes* with the essence.
- **Affordance Richness:** how many concrete design decisions a material/world generates by itself (the Tape-vs-Tresor test — see §5.4).
- **Bridge:** one composed result = essence ↔ N entangled worlds + grounding object.
- **Constellation:** the visible spread of candidate bridges around the central essence — selectable, combinable, testable.
- **Leitwert:** the final compound name (the *design directive*).
- **Creative Derivation:** the short explanation of *why* the bridge fits structurally (the *kreative Herleitung*) — NOT a design instruction, NOT decorative prose.
- **Modifier:** optional individualizers (mood, directional typography, qualitative palette direction).

---

## 4. Inputs

| Input | Required | Notes |
|---|---|---|
| `context` | no | Free text topic/theme. **Blank slate must work** (see §11). |
| `attract[]` / `repel[]` | no | The single control primitive (E-010). Themes, words, kept/rejected bridges all resolve here. |
| `N` | default 2 | Worlds per bridge, 2–4. More = richer + riskier. |
| `batchSize` | default 6 | Bridges to surface per round (range 5–8). |
| `noveltyMemory` | yes | Log of prior outputs to diverge from across rounds and sessions. |
| `mode` | yes | simple/advanced — affects exposure of internals, NOT the core algorithm. |

---

## 5. Pipeline (behavioral phases)

Each phase = **intent + I/O contract + guardrail.** Phases are conceptually separate LLM reasoning steps; the **essence from Phase 1 is carried forward verbatim** as the anchor for every later phase (prevents drift).

### 5.1 Phase 1 — Distill Essence
- **Intent:** extract the topic's Wirkstruktur, not keywords. Re-state the topic as 1–2 abstract relational statements with no surface-domain words.
- **Out:** `essence` (abstract sentence[s]).
- **Guardrail:** reject any essence that still names the literal subject (e.g. contains "security", "graph"). Force one level of abstraction up.

### 5.2 Phase 2 — Name & Burn Clichés
- **Intent:** explicitly list the 3–5 *obvious* design reflexes for this topic, then **forbid them** for the rest of the run.
- **Out:** `forbidden[]` (the cliché list).
- **Guardrail:** this list is a hard exclusion downstream. Any bridge that lands inside it is rejected. (This is the single most important anti-LLM step — see §7.)

### 5.3 Phase 3 — Entanglement Search
- **Intent:** find source worlds **far in domain** from the topic but whose inner logic **rhymes** with `essence`. Deliberately scan non-obvious, non-canonical, pre-digital, vernacular, non-Western, non-design realms.
- **Out:** candidate worlds, each with: `world`, `theRhyme` (one line: how its structure matches the essence), `domainDistance` (qualitative high/med/low), `resonance` (qualitative).
- **Guardrail:** reject **topical neighbors** (surface-similar donors, e.g. knowledge-graph → "neural network"/"web"). Reject low domain distance. Require breadth: candidates must span *different* far domains, not variants of one.

### 5.4 Phase 4 — Affordance Filter
- **Intent:** keep only worlds rich in physical/design affordances; drop single-note tropes.
- **Test:** the world must yield **≥5 concrete design affordances** (e.g. Tape → torn edges, overlap, matte/gloss, translucency, handwritten labels, provisional, layering, masking). If it can't, drop it (e.g. Tresor → heavy/metal/retro → exhausted → drop).
- **Out:** surviving worlds + their `affordances[]`.
- **Guardrail:** affordance list must be concrete and design-actionable, not adjectives.

### 5.5 Phase 5 — Compose Bridges → Constellation
- **Intent:** assemble `batchSize` bridges. Each bridge collides **N worlds** that are *all co-entangled with the same essence*.
- **Coherence rule (replaces the old axis rule):** the N worlds need NOT share a coordinate; they must each independently rhyme with the one essence. That common ancestor is what stops an N-world mix from becoming mush.
- **Friction rule:** preserve each world's distinct contribution — do **not** average the worlds into a bland blend.
- **Out:** the **Constellation** = essence at center, bridges around it, each bridge tagged with its worlds, distance, resonance.
- **Guardrail:** the batch must span distinct domains/essence-facets (no near-duplicate bridges).

### 5.6 Phase 6 — Ground & Name
- **Intent:** anchor each bridge in an **object metaphor** (the vessel) and compress into a **Leitwert compound** (2–4 tokens).
- **Out:** `leitwert`, `objectMetaphor`.
- **Guardrail:** object metaphor must itself pass the affordance + anti-cliché tests.

### 5.7 Phase 7 — Output Assembly
- Assemble the full output contract (§6), including the **Creative Derivation** whose sole job is to make the structural rhyme legible.

---

## 6. Output Contract

**Per bridge:**
- `leitwert` — the compound (design directive)
- `worlds[]` — each with `name`, `role`, `theRhyme`
- `objectMetaphor`
- `creativeDerivation` — 1–2 sentences explaining *why the rhyme holds* (the Herleitung). MUST justify the structural match; MUST NOT be a decorative literary scene and MUST NOT be a design instruction.
- `modifiers` — `mood`; `typography` (directional, role-tagged Display/Body/Data — see §7 weakness 6); `paletteDirection` (qualitative, e.g. "cold greys + one alarm accent")
- `provenance` — `essence`, `sourceDomains[]`, `domainDistance`, `resonance`, `affordances[]`
- `noveltyDistance` — divergence from `noveltyMemory`

**Per batch:**
- `constellation` — essence center + bridges, visibly spanning distinct domains; selectable, combinable, testable.

> Hard separation: **Leitwert = directive**, **Creative Derivation = why**. They are different fields and must never blur (this prevents the "story-as-design" failure where decorative prose like an engraved vault leaks in as if it were a spec).

---

## 7. LLM Failure Modes & Built-in Countermeasures

> The "think in the other direction" section. Each weakness below would sabotage the concept if unhandled. The countermeasure is **part of the spec**, not optional.

| # | LLM weakness | Countermeasure baked into the engine |
|---|---|---|
| 1 | **Cliché gravity** — regresses to the most common association (security→lock/shield/blue) | Phase 2 forces explicit cliché list, then hard-excludes it downstream. Distance requirement (Phase 3) forces escape from the mean. |
| 2 | **Surface matching** — picks topically-adjacent donors, not structural ones | Phase 1 strips surface; Phase 3 rejects topical neighbors and scores *structural* rhyme only. |
| 3 | **Sycophantic collapse under steering** — over-complies with attract/repel, kills surprise | §9 reserves a **novelty fraction** of every batch that is steered only weakly; steering biases but never collapses to duplicates. |
| 4 | **Mode collapse** — 8 ideas = 8 variants of one | Phase 5 requires distinct far domains per bridge; batch diversity is a hard gate (§8). |
| 5 | **Verbosity / explanation drift** | Strict output contract; Leitwert carries no prose; derivation capped at 1–2 sentences. |
| 6 | **Hallucinated specifics** — invents fake fonts/technical details | Typography is **directional, not literal**; validated against a known whitelist downstream. Spec marks all specifics as directional. |
| 7 | **Cross-step drift** in a multi-phase pipeline | `essence` is carried **verbatim** as the anchor into every later phase; each phase must reference it. |
| 8 | **Cultural narrowness** — pulls only the design-canon (Bauhaus/Swiss/brutalist) | Phase 3 explicitly demands non-canonical, non-Western, pre-digital, vernacular, non-design domains; canon over-use is penalized. |
| 9 | **Safe metaphor** — apt but no spark | Two-force scoring: low domain distance is rejected; model self-rates surprise and rejection-samples below threshold. |
| 10 | **Over-coherence** — smooths a collision into bland average | Friction rule (Phase 5): each world's distinct contribution must stay visible; blending into mush is rejected. |
| 11 | **Determinism** — same input → same output every run/session | `noveltyMemory` enforces farthest-point divergence across rounds AND sessions; forced domain rotation. |
| 12 | **Affordance blindness** — picks dead materials (Tresor) | Phase 4 hard test: ≥5 concrete affordances or drop. |
| 13 | **Literal depiction** — designs *about* the subject (draws locks for security) | Bridge must come from a *different* domain; literal depiction of the subject is forbidden. |

---

## 8. Quality Gates (hard rejects)

A bridge or batch is rejected if any of:
- contains / resolves into a `forbidden[]` cliché (weakness 1)
- domain distance below threshold (weakness 2, 9)
- < 5 concrete affordances (weakness 12)
- literal depiction of the subject (weakness 13)
- output-contract violation (weakness 5)
- batch diversity below threshold — near-duplicate bridges (weakness 4)
- novelty distance below `τ` vs `noveltyMemory` (weakness 11)
- creative derivation reads as decorative scene or as design instruction (the Eisblumen failure)

Rejections trigger re-generation of *that item only*, not the whole batch.

---

## 9. Steering Integration (attract/repel without novelty collapse)

- **attract** biases essence emphasis and the domain search toward the signalled region.
- **repel** removes domains/worlds and adds to `forbidden[]`.
- All feedback (typed goal, exclusion, 👍/👎, kept/rejected bridge) collapses into attract/repel (E-010).
- **Novelty reserve:** a fixed fraction of each batch (e.g. ~⅓) is generated under *weak* steering, so iteration converges without ever collapsing into near-duplicates. Steering tightens the field; it must never empty it of surprise.

---

## 10. Eval Hooks (Lab)

Engine D must be runnable headless for batch evaluation. Surfaced metrics:
- **Surprise** — average domain distance
- **Aptness** — human verdict (primary; E-018)
- **Cliché-rate** — % of outputs that drift toward `forbidden[]`
- **Affordance richness** — avg concrete affordances per bridge
- **Batch diversity** — pairwise dissimilarity
- **Repeat-rate** — duplicates across sessions

Human-in-the-loop judgment is the primary metric; auto-signals are supporting.

---

## 11. Degradation & Fallbacks

- **Thin essence** (topic too vague to distill) → request a one-line clarifier OR broaden to the nearest rich essence; never proceed on surface keywords.
- **Blank slate** (empty `context`) → sample diverse essences across unrelated life-domains and produce a **maximum-spread explore batch** so the user discovers the space (matches the Explore step of the user flow).
- **No far domain rhymes** → relax domain-distance *gradually*; **never** relax the anti-cliché gate or the affordance gate.
- **Steering over-constrains** (attract+repel leave no room) → surface the conflict to the user rather than emit mush.

---

## 12. Non-Goals / Boundaries

- **No axes in generation.** (Steering/eval only.)
- **No literal depiction** of the subject matter.
- **Not a style list.** Worlds are donors, not presets.
- **Typography/fonts are directional**, validated downstream — never invented as fact.
- **No implementation prescribed here.** Data-structure field names are conceptual, not a schema mandate.

---

## 13. Tunable Parameters (for the Lab)

`N` (worlds/bridge) · `batchSize` · domain-distance threshold · resonance threshold · novelty `τ` · novelty-reserve fraction · affordance minimum (default 5) · canon-penalty weight.

---

## Appendix — Worked Example (illustrative, not a fixture)

**Input:** "manufacturer of safety components for industrial plants" (the Euchner case).

1. **Essence:** *"vigilant control that quietly guarantees a vast, dangerous, moving system stays in safe order."*
2. **Burn clichés:** locks, shields, hi-vis yellow/black, blue-tech HUD, dark-mode network nodes → forbidden.
3. **Entanglement search (far + rhyming):**
   - *Lighthouse keeping* — solitary vigilance over a dangerous expanse (rhymes; far domain).
   - *Surgical theatre* — sterile, instrumented control where error is catastrophic (rhymes; far domain).
   - *Cartography of tides* — mapping invisible forces to keep movement safe (rhymes; far domain).
4. **Affordance filter:** Lighthouse → beam logic, rotation, signal rhythm, fog, lens optics, stark contrast (≥5 ✓). (A "vault/Tresor" donor would be dropped: dead + cliché.)
5. **Compose (N=2, co-entangled):** Lighthouse × Surgical-instrumentation, both rhyming with "vigilant control of a dangerous system."
6. **Ground & name:** object = Logbuch → **`Leuchtfeuer-Instrumentarium-Logbuch`**.
7. **Creative derivation:** "A lighthouse and a surgical theatre both run on instrumented vigilance — calm, exact, and absolute, because failure is not survivable. That is the structure of industrial safety, rendered without a single lock or shield."

→ Surprising, far from the subject, yet structurally exact. No Eisblumen.

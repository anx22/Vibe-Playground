# ENGINE-F-SPEC — Technique Workbench ("Viele Töpfe")

> **Role:** The fast, prompt-only creative engine. Lifts the architecture of the proven `naming-generator` skill — **Volume → Filter → Curation** — and swaps its pots from *word* operators to *vibe-world* operators.
> **Relationship:** Engine A = fixed pools (rules). Engine D = the *criteria* (entanglement, anti-cliché, affordance). Engine E = the *heavy machinery* (latent agents, embeddings). **Engine F = the fast workbench**: pure prompt, no infrastructure, battle-tested lineage. F borrows D's criteria as gates and can feed E's corpus.
> **Audience:** Claude Code. **Altitude:** behavior, contracts, gates, robustness. No code prescribed.

---

## 1. Purpose & Core Principle

Generate design directions (Leitwerte) with a **workbench of small thinking-operators** wrapped in one discipline:

> **Volume → Filter → Curation.** Generate 3× more than you show. The system *eliminates* weak vibes; it does not present them. Elimination is the system, not a bug.

Many pots (operators) × generous semantic field = many colors (candidates). Then hard gates cut, and the survivors are curated into a few **taste-directions** (Geschmacksrichtungen) — the constellation.

---

## 2. Why F Matters Strategically

- **Pure prompt.** No embeddings, no vector store, no evolutionary loop, no infra.
- **Fastest engine** → best fit for the speed north-star (E-014). Strong candidate for the *first real-LLM* engine, ahead of the heavy Engine E.
- **Proven lineage.** Its backbone is established brand-naming practice (Lexicon, Interbrand, Tungsten; Placek), not invented math.

---

## 3. Pipeline

Each step: **intent + I/O contract + guardrail.**

### 3.1 Strategy First (Diamond)
- **Intent:** before any generation, fix the strategic brief in 1–2 lines each: *what must the design WIN* (trust / attention / premium / tech-credibility / warmth), *what ONE impression must remain*, *how must it FEEL*, *no-gos*.
- **Out:** `brief` (carried verbatim to every later step — drift anchor).
- **Guardrail:** if the brief is already clear from context, fill it internally; don't interrogate the user.

### 3.2 Build the Semantic Field (Volume)
- **Intent:** gather a generous field of associations across 5 layers. Thin field → generic output.
  - **A Direct** (what it is) · **B Metaphor** (what it feels like) · **C Emotion/Promise** (the result for the user) · **D Foreign-language** equivalents · **E Unrelated Reframing** — *"if this were not a product but a ship / ritual / geological process / kitchen tool…"* — the prime source of surprise.
- **Out:** `field` (20–30 seeds, Layer E mandatory).
- **Guardrail:** enforce minimum breadth; Layer E must reach **far, non-canon, non-Western, non-design** domains.

### 3.3 Run the Operators (Volume)
- **Intent:** apply the operators (§4) to the field, each producing 3–6 candidates. Brief-adaptive weighting decides which pots to favor/suppress (§5.2).
- **Out:** candidate pool (intentionally over-generated, ≥3× final count).
- **Guardrail:** each operator call is **isolated** and starts from a *different* field-seed, so operators don't collapse onto one association (Risk R1).

### 3.4 Gates (Filter)
- Apply the hard gates (§6) — anti-cliché, comfort-test, concreteness, no literal depiction. **Enforce an elimination quota** (see §5.5).

### 3.5 Cluster into Taste-Directions (Curation)
- **Intent:** sort survivors into 3–4 **orthogonal** taste-directions (e.g. *cold-authority / grounded-craft / sharp-with-a-break*), each a distinct strategic pole.
- **Out:** the **Constellation**: directions × candidates.
- **Guardrail:** directions must be genuinely orthogonal and each must contain a *different donor world* (Risk R9).

### 3.6 Curate Shortlist
- Per candidate: `Leitwert` · operator(s) used · comfort-rating · one-line concrete justification.
- Mark 2–3 favorites with a strategy-linked reason.

---

## 4. The Operators (the Pots)

Each: **intent / input / output / guardrail.** Not every operator fits every brief — weak ones drop to 0–1 candidates, never forced.

1. **Unrelated Reframing** *(flagship; lightweight Verschränkung)* — "if this were a [far domain], what would it be?" → donor world. *Guardrail:* far + non-canon; reject topical neighbors.
2. **Concrete Metaphor** — an image-world carrying the core feeling without direct depiction. *Guardrail:* concrete bridge required; vague virtue-words (Vision/Synergy-class) auto-reject.
3. **Cross-Culture Loanword** — pull the world from another culture/era (kintsugi, kanban, wabi). *Guardrail:* must carry a *design-relevant* connotation, not just exotic flavor.
4. **Classical Root** — Latin/Greek register for timeless gravitas (Vigil, Lumen). *Guardrail:* only when the brief wants gravitas.
5. **Place / Era / Maker** *(Engine C-lite)* — the vibe of a specific place, era, or maker. *Guardrail:* specific and affordance-rich ("1970s control room", not "modern office").
6. **Gesture / Action** *(→ Motion)* — the vibe as a movement/verb (Arm · Latch · Glide). *Guardrail:* must translate to interaction/motion feel, not just a word.
7. **Sound → Texture** *(cross-modal — new)* — map a word's phonetic class to **visual texture**: plosives (k,t,p) → angular/hard/technical; sonorants (m,n,l,r) → soft/rounded; fricatives (f,s,sh) → refined; back vowels (o,u) → heavy/bold; front vowels (i,e) → light/precise. *Guardrail:* must output concrete design attributes, applied consistently.
8. **Controlled Break** *(Pun analog)* — inject **one** deliberate contradiction into an otherwise coherent vibe (a dry-wit accent in a clinical system). *Guardrail:* exactly one break, not chaos; suppress for pure-premium/B2B unless it sharpens.
9. **Compositor** *(Portmanteau — final step, not a generator)* — fuse the chosen worlds into the Leitwert compound; the break must *sound*. *Guardrail:* affordance + anti-cliché survive.

> Word-form tricks from naming (truncation, vowel-drop, anagram, palindrome, alliteration) do **not** translate to vibes. Use them at most to make the finished Leitwert *label* punchier — never as engine operators.

---

## 5. Elevations (the new level)

### 5.1 Operator Chaining
Apply two operators in sequence for richer results (Reframe → Sound→Texture; Place/Era → Controlled-Break). The naming skill runs operators in parallel; chaining is the upgrade.

### 5.2 Brief-Adaptive Operator Weighting
The engine picks *which pots to dip into* from the brief: B2B-premium → favor Classical Root + Place/Era, suppress Controlled-Break; consumer-playful → favor Reframing + Gesture + Break. Smart selection, not a fixed checklist.

### 5.3 Cross-Modal Sound→Texture
Operator 7 made systematic: a real, repeatable bridge from phonetic feel to design texture. A distinctive capability F has and the other engines lack.

### 5.4 Courage Dial (Placek, tunable)
The comfort-test becomes a **slider** (safe ↔ uncomfortable), surfaced in Advanced mode, integrated with the temperature/steering lineage. *"Slightly uncomfortable > too comfortable."*

### 5.5 Enforced Elimination Quota
Hard rule: generate ≥3× the final count; **eliminate at least ⅔**. A run that keeps most of what it generated has failed its own discipline.

### 5.6 Attract/Repel Integration
The brief and all feedback collapse into attract/repel (E-010): attract reshapes the field + operator weighting; repel feeds the anti-cliché reject-list.

---

## 6. Quality Gates (hard rejects)

A candidate is cut if any of:
- hits the **anti-cliché reject-list** (overused prefixes/suffixes, vague virtue-words, summit/peak metaphors, generic animal/element tropes, "train-wreck" adjective+noun mashups, trend-tags)
- fails the **Comfort-Test** — "safe and forgettable" rather than "uncomfortable in a good way" (Placek)
- fails **Concreteness** — no specific, non-obvious bridge (justification is vague)
- fails **Distinctiveness** — the anti-generic self-test: *would 5 other AI tools produce this same direction?* If yes, cut.
- **literal depiction** of the subject
- collapses taste-direction diversity (near-duplicate of a kept candidate)

Cuts trigger re-generation of *that slot*, not the batch.

---

## 7. LLM Failure Modes & Countermeasures

| # | Weakness | Countermeasure |
|---|---|---|
| R1 | **Operator collapse** — every operator bends to one association | Isolate operator calls; each starts from a *different* field-seed; forbid reusing the prior operator's donor. |
| R2 | **Cliché gravity** | Anti-cliché reject-list as a hard gate (§6). |
| R3 | **Comfort bias / safe outputs** | Placek comfort-test gate + quota: ≥1 "uncomfortable" candidate per taste-direction; courage dial. |
| R4 | **Fake volume** — 60 trivial variants of one idea | Measure diversity by donor-**domain spread**, not count; require multiple operators + layers represented; reject a near-duplicate field. |
| R5 | **Lenient self-grading** — the model passes its own weak work | Separate generation from judgment (different role/call); eliminate by tournament/pairwise, not absolute scores; enforce the ⅔ elimination quota. |
| R6 | **Justification theater** — plausible "why it works" for weak candidates | Every kept candidate needs a **concrete** bridge; vague justification → auto-reject (Konkretheit criterion). |
| R7 | **Thin field → generic** | Enforce minimum field breadth before generation; Layer E mandatory; run the anti-generic self-test. |
| R8 | **Forcing ill-fitting operators** | Brief-adaptive weighting; weak operators drop to 0–1 candidates, never forced. |
| R9 | **Bland taste-directions** — 3–4 near-duplicate directions | Directions defined by *orthogonal* strategic poles; each must hold a different donor world. |
| R10 | **Canon narrowness** (Bauhaus/Swiss reflex) | Layer E + Loanword must reach non-Western/vernacular/non-design; penalize canon over-use. |
| R11 | **Literal depiction** of the subject | Forbidden; donor must be a different domain. |
| R12 | **Verbosity** | Strict output contract; Leitwert carries no prose; justification 1 line, derivation ≤2 sentences. |

---

## 8. Output Contract

Per candidate: `leitwert` · `operators[]` (which pots, incl. chains) · `worlds[]` with `theRhyme` · `objectMetaphor` · `creativeDerivation` (≤2 sentences, why the bridge holds — not decoration, not a spec) · `modifiers` {mood, directional typography, qualitative palette} · `comfortRating` · `tasteDirection` · `concreteJustification` (1 line).

Batch: the **Constellation** = 3–4 orthogonal taste-directions × candidates, plus 2–3 marked favorites with strategy-linked reasons.

---

## 9. Eval Hooks (Lab)

- **Comfort distribution** — are outputs clustering "safe" (bad) or spread toward "uncomfortable-good"?
- **Operator diversity** — share of operators/chains represented per batch.
- **Cliché-rate** — survivors that drift toward the reject-list.
- **Distinctiveness** — pass-rate on the "5-other-AIs" self-test.
- **Elimination ratio** — verify ≥⅔ cut.
- **Human verdict** — primary (E-018).

---

## 10. Feasibility & Positioning

- **Feasibility:** pure prompt + curation. Optional single use of embeddings: a nearness check against the cliché set (else none).
- **Build order:** strongest candidate for the **first real-LLM creative engine** — faster and lighter than E, richer than A. Recommend F as the bridge between the Engine-A MVP and the heavy Engine E.
- **Composition:** F's Reframing operator *is* D's entanglement in lightweight form; F can populate E's corpus; F's taste-directions match the constellation concept across all engines.

---

## 11. Non-Goals / Boundaries

- Not the word-form tricks (label polish only).
- No invented axes.
- No literal depiction of the subject.
- Typography directional, validated downstream.
- F does not replace D/E — it is the fast front; D supplies criteria, E supplies depth when speed is not the constraint.

---

## 12. Tunable Parameters

operator set & weights (brief-adaptive) · candidates-per-operator · field breadth minimum · courage dial · elimination quota (default ⅔) · number of taste-directions (3–4) · final shortlist size.

---

## Appendix — Worked Example (illustrative)

**Brief:** safety components for industrial plants. *Win:* trust + tech-credibility. *Feel:* exact, vigilant, unshowy. *No-gos:* locks, shields, hi-vis, blue-tech HUD.

**Field (Layer E sample):** *if not a security product but a…* lighthouse · surgical theatre · tide table · forge · air-traffic tower.

**Operators →**
- Reframing × Place/Era → **Leuchtfeuer-Instrumentarium-Logbuch**
- Classical Root × Sound→Texture (plosives → angular grid) → **Vigil-Schaltwerk-Kodex**
- Place/Era × Concrete Metaphor → **Werkstatt-Gezeiten-Almanach**
- Place/Era × Controlled Break (one dry accent) → **Reinraum-mit-Notiz-Register**

**Constellation (3 orthogonal directions):**
- 🔵 **Kühle Autorität:** `Leuchtfeuer-Instrumentarium-Logbuch` · `Vigil-Schaltwerk-Kodex`
- 🟢 **Geerdetes Handwerk:** `Werkstatt-Gezeiten-Almanach`
- 🟡 **Klarheit mit Bruch:** `Reinraum-mit-Notiz-Register`

**Favorite:** `Leuchtfeuer-Instrumentarium-Logbuch` — vigilance over a dangerous expanse, instrumented and calm; far from the subject, structurally exact, not a lock in sight.

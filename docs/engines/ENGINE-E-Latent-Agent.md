# ENGINE-E-SPEC — Latent Agent Engine

> \*\*Role:\*\* The most advanced creative core. Where Engine D \*encodes\* creativity as a phase pipeline, Engine E \*orchestrates\* the model's own latent creativity with an agentic search loop and real embeddings.
> \*\*Relationship:\*\* Engine D's principles (Verschränkung, anti-cliché, affordance, story-as-derivation) survive as the \*\*agents' evaluation criteria\*\*. D = the \*criteria\*. E = the \*machinery\*.
> \*\*Audience:\*\* Claude Code. \*\*Altitude:\*\* architecture, contracts, feasibility, risks. Real techniques named; no final code prescribed.
> \*\*Honesty mandate:\*\* this spec names where the latent-space dream hits walls. Do not paper over them.

\---

## 1\. Purpose \& Core Shift

Stop *encoding* creativity in rules and hand-made math. Instead, **harvest the generating model's latent creativity** with an autonomous search loop, and use real embeddings **only where measuring is honest**.

Retire from the concept entirely:

* the invented 5-axis space (a human crutch, not the real latent space)
* magic absolute distance bands (0.4–0.7) — replaced by distribution-relative ranking
* hand-curated pools and keyword lexicons as the *generative* source

\---

## 2\. The Honest Foundation (read before building)

Three truths that dictate the whole architecture:

1. **Embeddings measure and retrieve — they do not generate.** You cannot interpolate two embeddings and decode a *new* concept; the embedding space is a similarity space, not a generator. Anything "between" must be **retrieved** from a corpus, not decoded.
2. **Embeddings capture *surface/topical* similarity, not <i>structural</i> analogy.** Ask an embedding index for neighbors of "knowledge graph" and you get "neural network, web, mind map" — the exact topical neighbors Engine D *forbids*. Embeddings alone **cannot** find the entanglement.
3. **The associative leap lives in the generator's weights.** That is the only component that can find "lighthouse keeping" for "industrial safety."

**Resulting division of labor (the key design move):**

* **Generator LLM (weights):** makes the analogical leaps; judges structural rhyme; names.
* **Embeddings + vector store:** measure *distance* (the "far" half of Verschränkung), measure *novelty/coverage*, detect *cliché-nearness*, and **retrieve far donors** to ground divergence.
* **Agent orchestrator:** runs the autonomous search/selection loop.

Verschränkung, realized technically: **embedding-distance supplies the "far in surface"; the LLM supplies the "rhymes in structure."** Neither does both. That split is the whole trick.

\---

## 3\. Architecture Overview

|Component|Responsibility|Real options|
|-|-|-|
|**Generator LLM**|divergence, rhyme-judgment, mutation, naming|strong chat model (final naming) + small/fast model (inner-loop judgments)|
|**Embedding model**|concept geometry|text-embedding-3-large, Cohere embed, or open (BGE/e5/nomic)|
|**Vector store**|corpus + generated-set index|pgvector (Supabase/Neon — already in the stack) or HNSW (qdrant/local)|
|**Concept corpus**|the pool divergence retrieves *from*|LLM-seeded donor corpus + Wikidata/Wikipedia/ConceptNet for breadth|
|**Orchestrator**|the agentic evolutionary loop|custom loop (preferred for control) or LangGraph|

> \*\*Corpus is not optional.\*\* Retrieval-from-the-between has nothing to retrieve without a broad concept corpus. Corpus breadth = creativity ceiling. Invest in non-Western, vernacular, pre-digital, non-design domains. Let the LLM extend the corpus on demand where a region is thin.

\---

## 4\. The Two Latent Operations, Done Right

### 4.1 Retrieval-from-the-Between (replaces axis interpolation)

1. Embed the **essence** (Wirkstruktur), not the surface topic.
2. Retrieve corpus concepts in a **relative distance band** — e.g. the 70th–95th percentile of distance *within the actual distribution*, not an absolute threshold. (Avoids the high-dim "everything is \~orthogonal" trap — see Risk R2.)
3. Hand the far candidates to the **LLM Resonator**, which keeps only those that **structurally rhyme** with the essence. Embeddings found "far"; the LLM confirms "fits."

### 4.2 Novelty as Coverage (replaces magic `τ`)

* Index every generated bridge's embedding.
* Score new candidates by **min-distance to the generated set** (farthest-point), expressed as a **percentile/rank**, never an absolute number.
* Push generation into **empty regions**: retrieve donors far from *both* the essence-neighborhood *and* the already-generated set.

\---

## 5\. The Agent Society + Evolutionary Loop

Roles (each = a prompt/call with a single job; the essence is carried verbatim to all):

* **Diverger** — proposes far donor worlds, grounded by retrieval (§4.1) so it doesn't just hallucinate from a narrow prior.
* **Resonator** — rates structural rhyme to essence; filters topical neighbors.
* **Critic** — burns clichés (§ Engine D Phase 2) and applies the affordance test (≥5 concrete affordances or drop).
* **Namer** — composes the Leitwert + object metaphor + the *derivation* (why the rhyme holds).
* **Judge/Selector** — decides keep / mutate / kill.

**Loop (quality-diversity, not single-objective):**

1. Seed a population of candidate bridges.
2. Evaluate each: novelty (embedding, real) + rhyme/aptness/affordance (LLM).
3. Select survivors; **mutate** (swap a donor, push domain distance up, recombine two strong bridges, aim at an empty region).
4. Repeat K generations (K small — see Risk R4 on cost).

### Two research-grounded algorithms that fit exactly

* **Novelty Search (Lehman \& Stanley):** reward candidates for being *unlike everything generated*, not for maximizing a fitness score. This is the principled form of "be surprising" and it structurally resists convergence/cliché. Use novelty as a first-class objective, not an afterthought.
* **Quality-Diversity / MAP-Elites (Mouret \& Clune):** keep the best bridge in each cell of a discretized **behavior space**, producing a *diverse archive of high-quality* outputs rather than one winner.

  * **Behavior descriptors** come from LLM tags or embedding clusters (e.g. donor-domain family × mood × era) — **never our invented axes.**
  * **The MAP-Elites archive *is* the visible Constellation.** The "surprising variety" the user wants is literally what QD produces. This is the cleanest fit in the whole design.

\---

## 6\. Steering Integration

All feedback collapses into **attract/repel** (E-010), now as **movement in real latent space + corpus filtering**:

* **attract** → shift the retrieval centroid toward the signalled region; bias donor sampling.
* **repel** → remove regions/donors; add their embeddings to a **forbidden set**; reject candidates whose embedding sits too near it (a place embeddings *do* help — measuring nearness to a banned region).
* **Novelty reserve:** a fraction of each generation stays weakly steered, so iteration converges without collapsing into near-duplicates (counters sycophantic collapse).

\---

## 7\. Technical Feasibility — Tiers

* **Tier 0 — doable now (API + embeddings + pgvector):** everything in §3–§6. Generator via chat API, embeddings via embedding API, corpus + generated-set in pgvector (Supabase/Neon), orchestration as serverless functions (Vercel). **No model-internal access required.** This is the buildable Engine E.
* **Tier 1 — heavier infra:** self-hosted embedding model, large corpus, aggressive caching/batching, an offline corpus-embedding job.
* **Tier 2 — research-tier, NOT a web-app feature:** literal **weight/activation steering** — control vectors, activation addition, LoRA. This is the only sense in which we "tune creativity in the weights." Needs open weights, GPU, an ML pipeline, logit/activation access. Flag as aspiration, not MVP. Do not let the word "weights" lure the build here prematurely.

\---

## 8\. Implementation Pitfalls \& Risks

|#|Risk|Mitigation|
|-|-|-|
|R1|**Embeddings ≠ structural analogy** — retrieval returns topical neighbors, the cliché trap|Split roles: embeddings for "far" only; LLM Resonator for "rhyme". Never ask embeddings for analogy.|
|R2|**High-dim anisotropy \& hubness** — cosine compresses; "hub" concepts sit near everything; absolute thresholds are meaningless|Whiten/center embeddings; use **rank/percentile** retrieval, not absolute distance; detect and down-weight hubs.|
|R3|**Corpus dependency** — narrow corpus → narrow creativity|Invest in breadth (non-Western, vernacular, non-design); LLM extends thin regions on demand; periodically audit coverage.|
|R4|**Latency \& cost vs. the speed north-star (E-014)** — an agentic QD loop is many LLM + embedding calls|Cap generations K; parallelize; cache all embeddings; small/fast model inner-loop, strong model only for final naming; precompute corpus embeddings once. **This tension is real — Engine E is not the fast path.**|
|R5|**LLM-as-judge is noisy \& biased** (favors verbose/safe, inconsistent)|Prefer **pairwise comparison** over absolute scores; aggregate multiple judgments; human-in-loop is ground truth in the Lab (E-018).|
|R6|**Mode collapse in the evolutionary loop** — population converges to one attractor|Novelty Search as a first-class objective; QD niching; explicit diversity pressure via embedding coverage.|
|R7|**Reproducibility / debuggability** — stochastic + agentic = hard to trace a good result|Log full **lineage** per bridge (seed, essence, donors, judgments); deterministic seeds where possible; expose lineage in the Lab.|
|R8|**Cliché leakage despite burning** — the model's gravity is strong|Cliché-burn agent **plus** embedding check vs. the forbidden set; reject near-cliché candidates.|
|R9|**Over-engineering** — heavy machinery for a tool whose MVP is Engine A and whose star is speed|**Gate Engine E behind proven value.** It is a Phase 2+ capability, not MVP. Ship A first; introduce E where its surprise/diversity measurably beats A in the Lab.|
|R10|**Embedding-model drift** — switching models invalidates the index|Abstract the embedding provider; version the index; re-embed on model change.|
|R11|**Cold start** — empty novelty memory / generated set|Blank-slate seeds from diverse essence sampling across unrelated life-domains (max-spread explore batch).|
|R12|**Behavior-descriptor design for MAP-Elites** — bad descriptors = bad archive|Derive descriptors from LLM tags/embedding clusters; validate that cells correspond to perceptibly different vibes; iterate descriptors in the Lab.|

\---

## 9\. Eval Hooks (Lab)

* **Surprise:** mean embedding distance of donors from the topic (real).
* **Aptness:** pairwise LLM-judge + **human verdict as primary** (E-018).
* **Diversity/coverage:** fraction of MAP-Elites cells filled; pairwise dissimilarity.
* **Cliché-rate:** share of outputs near the forbidden set.
* **Cost/latency:** calls and seconds per accepted bridge (guards R4).
* **Lineage replay:** reproduce any output from its logged lineage.

\---

## 10\. Output Contract

Reuse Engine D's contract (Leitwert / worlds+rhyme / object metaphor / creativeDerivation / modifiers / provenance), plus:

* `lineage` — seed, essence, retrieved donors, judge decisions, generation index.
* `coverageCell` — the MAP-Elites cell this bridge occupies.
* `noveltyRank` — percentile novelty vs. the generated set.

Constellation = the filled MAP-Elites archive, rendered as the selectable/combinable/testable board.

\---

## 11\. Non-Goals / Boundaries

* **No invented axes** in generation (steer/measure only).
* **No literal depiction** of the subject.
* **Embeddings never asked to do analogy.**
* **Engine E is Phase 2+**, gated behind Engine A's MVP and a Lab-proven advantage. Do not let its ambition delay the fast, simple core (E-016, E-014).
* **Tier 2 (weight steering) is research**, not a deliverable here.

\---

## 12\. Suggested Concrete Stack (Tier 0, matches current connectors)

* **Generator:** chat API (strong model for naming; small model for inner-loop judgments).
* **Embeddings:** a current embedding model behind a provider abstraction.
* **Vector store:** pgvector on **Supabase or Neon** (both already connected) — two indexes: `corpus` (donor concepts) and `generated` (novelty memory).
* **Orchestration:** serverless functions (**Vercel**) running the agent loop; corpus embedding as an offline job.
* **Lab:** a headless harness over the same functions for batch eval (per `NOW.md` Step 1).

> Build order sanity: this stack is for \*later\*. The MVP remains Engine A + Lab. Engine E earns its place only once it beats A on surprise/diversity in the Lab without breaking the speed budget.



HERLEITUNG:
Alles klar. Ich nutze, was real geht — und sage präzise, wo die Wände stehen. Das wird die technisch fundierteste Spec bisher: echte Komponenten, ehrliche Grenzen, und zwei research-erprobte Algorithmen (Novelty Search + Quality-Diversity), die exakt auf „überraschend \*und\* vielfältig" passen — plus ein eigener Risiko-Abschnitt.`ENGINE-E-SPEC.md` steht — die technisch ehrlichste Spec im Paket. Die wichtigsten Punkte:



\*\*Die ehrliche Grundlage (§2), die alles diktiert.\*\* Drei Wahrheiten, die ich nicht weichgespült habe: Embeddings \*generieren\* nicht, sie messen und finden. Embeddings fangen \*Oberflächen\*-Ähnlichkeit, nicht \*strukturelle\* Analogie — frag den Index nach „Knowledge Graph" und du kriegst „neuronales Netz, Web, Mindmap", also genau die Klischee-Nachbarn, die D verbietet. Der eigentliche Sprung sitzt in den \*\*Gewichten\*\* des Generators. Daraus folgt der Kern-Trick: \*\*Embedding-Distanz liefert das „fern an der Oberfläche", das LLM liefert das „reimt sich in der Struktur".\*\* Keiner macht beides — diese Teilung \*ist\* die Verschränkung, technisch umgesetzt.



\*\*Zwei research-erprobte Algorithmen, die exakt passen (§5).\*\* Novelty Search (belohne Andersartigkeit statt Zielerreichung → strukturell klischee-resistent) und Quality-Diversity / MAP-Elites (behalte das beste Ergebnis pro Zelle eines Verhaltensraums → ein \*vielfältiges\* Archiv statt eines Gewinners). Der schönste Fund: \*\*das MAP-Elites-Archiv \*ist\* deine sichtbare Konstellation.\*\* Die „überraschende Vielfalt", die du willst, ist wörtlich das, was QD produziert. Und die Verhaltens-Dimensionen kommen aus LLM-Tags/Embedding-Clustern — \*nicht\* aus unseren erfundenen Achsen.



\*\*Der Risiko-Abschnitt (§8), den du wolltest\*\* — zwölf reale Fallstricke mit Gegenmaßnahmen. Die wichtigsten, weil sie unbequem sind:



R2 ist subtil und wird oft übersehen: In hochdimensionalen Embedding-Räumen ist Cosine-Distanz komprimiert und anisotrop, manche „Hub"-Konzepte sitzen nah an allem — absolute Schwellen sind dort bedeutungslos. Lösung: Rang/Perzentil statt absoluter Distanz, Whitening. Genau das tötet die Milchmädchen-Mathematik auch hier ab.



R4 und R9 sind die, bei denen ich gegen die Idee denke, nicht für sie: Eine agentische QD-Schleife ist viele LLM- plus Embedding-Calls — das steht in direkter Spannung zu deinem Nordstern Tempo. Engine E ist \*\*nicht\*\* der schnelle Weg. Deshalb habe ich sie klar als Phase-2+-Fähigkeit markiert, hinter dem Engine-A-MVP, die ihren Platz erst verdient, wenn sie im Lab messbar mehr Überraschung/Vielfalt liefert als A — ohne das Speed-Budget zu sprengen.



\*\*Tier-Trennung (§7) ehrlich:\*\* Tier 0 (API + Embeddings + pgvector) ist heute baubar, komplett. „Gewichte justieren" im wörtlichen Sinn (Control-Vektoren, LoRA, Activation Steering) ist Tier 2 — Research, kein Web-App-Feature. Ich lasse das Wort „Gewichte" den Build nicht voreilig dorthin locken.



Und §12 dockt an deinen real verbundenen Stack an: pgvector auf Supabase/Neon, Orchestrierung auf Vercel — beides schon da.




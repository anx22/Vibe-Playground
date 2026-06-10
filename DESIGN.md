# DESIGN.md — Vibe Playground

> Interface & user-flow guidance for the Studio. Pairs with `KONZEPT.md` (concept) and
> `DECISIONS.md` (E-019…E-023 capture the choices below). Update when the design system shifts.

## Tonal Resolution — "Duolingo für Erwachsene mit Geschmack" (E-019)

Keep the Duolingo DNA — chunky rounded shapes, bold friendly type, tactile buttons with a
bottom-shadow, springy micro-interactions, a dopamine loop. Elevate it to pro in three places so
it never reads kiddie:

- **Color:** *one* confident accent instead of a rainbow. The accent **inherits live from the
  focused direction** — the app chrome subtly tints toward the Vibe Card you're working on.
- **Type contrast deliberately extreme:** Leitwert XXL as hero, everything else stepped down hard.
  Mono for *values* (axes, λ, distance), rounded sans for UI, a characterful display for the Leitwert.
- **Motion:** spring physics, but short and controlled; confetti exists but muted and one-shot.

## First State (Blank Slate, E-011)

Three vertical zones on warm off-white:

1. **Thin top:** wordmark left; Speed-to-Direction tacho + streak right. **No engine lens** (Simple, E-017).
2. **Center, the hero:** the **Vibe Pentagon**, idle-breathing, neutral-centered. Invites a nudge.
3. **Bottom, one focus:** a generous input *"Wirf ein Wort rein – oder leg blank los"* + a fat
   primary **Explore** button. No card grid, no axis sliders. Maximum reduction.

## The Pentagon — Live Heartpiece (E-021)

Three layers, not a generic chart:

- **Vector shape** (filled, accent-tinted): current sampling centroid across the 5 axes.
- **Spread cloud** (translucent band): variance of the next batch — tight = focused, wide = exploratory.
- **Axis poles** labelled at the tips (−1/+1); values in mono, on hover/tap only.

Real-time: every attract/repel **springs the shape**. No direct dragging of the pentagon — the only
control primitive is attract/repel (E-010). The instrument stays honest.

## The Vibe Card — Smart Component (not a default card)

Top → bottom: **Leitwert XXL** (hero, ~80% of the card, E-001) · **Mood modifier** caption ·
**Typo trio rendered in the real fonts** (Display/Body/Data, each in its actual face + role tag in
mono) · **Palette** as 3 fat rounded swatches (hex on demand) · **Coherence pulse** (green pulse when
the bridge rule holds, E-003 — the one Lab signal that bleeds into Simple, as a feeling not a number) ·
**Collapser "Herkunft"** (default closed): unfolds engine note + axis vector + the two colliding
worlds. **This collapser is the bridge to Advanced** — frequent openers get offered Advanced mode.

Per-card control: **magnet metaphor** — Anziehen (+) / Abstoßen (−). On tap a particle trail flies
from the card into the pentagon — the visible causal chain "my signal → biases the space".

## Steering Loop in Real Time (E-022)

- attract/repel on a card → **instant**: pentagon springs, spread cloud changes, accent drifts.
  Existing cards **stay put**, only their mini-indicator updates (nearer/farther from target).
  No reshuffle.
- The fat **Iterate** button pulls the next, narrower batch (old cards recede, new ones spring in).
- `Commit` saves a direction to the **Library** + the one muted confetti moment + tacho progress.

## Instruments & Smart Components (no standard patterns)

- **Speed-to-Direction tacho** = North Star (E-014) as a playful gauge; replaces generic XP.
  Streak = "Tage am Viben", not learning goals — defuses the kiddie tone, keeps the loop.
- **Size/contrast system:** three hard tiers — Hero (Leitwert), Instrument (pentagon/tacho),
  Values (mono, small). Nothing in between → exact, instrumental feel despite the playfulness.
- **Collapsers everywhere, default collapsed:** Herkunft (card), later axis controls / λ / distance (Advanced).
- **No generic grid:** the batch is a slightly staggered "hand of cards" (3–5), not a sterile table.

## Engine Visibility & Advanced Path (E-020)

Simple-default: lens is internally **Auto** (= A in the MVP, E-016/E-017), neutral label, no A/B/C.
Advanced is **offered**, not toggled, when behaviour calls for it (frequent Herkunft-unfolds, many
iterations) — then a side "console drawer" unfolds: engine lens, axis sliders, distance band, λ, Lab.

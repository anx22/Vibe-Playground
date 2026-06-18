# DESIGN.md — Vibe Playground

> The Studio interface. Update when the design system shifts.

## Model — a bento field (E-067)

Not linear lanes: a **masonry field** of engine **panels**. The **Leitidee** (briefing) sits in a
header strip above the field; the **anchor strip** (the gold set) sits just below it. Each engine is a
panel, accent-coded and labelled (Verschränkung orange · Latent-Agent green · Werkbank violet ·
Persona blue), laid out as masonry columns so each panel takes its natural height.

## Panel — hero over satellites

Each panel leads with a **hero tile** — its judge-#1 direction, larger, with a one-line teaser — over a
grid of smaller **satellite tiles**, so the strongest direction in each engine is visually dominant
instead of one flat list. **Werkbank** sub-clusters its satellites by **taste-direction** (D12): each
orthogonal direction is a labelled sub-group. Every tile shows its **Leitwert**, a 3-swatch palette, and
a **register** chip (the render/material register, E-065) so material variety reads at a glance.

## Tile → detail drawer

Click a tile → a **detail drawer** slides in (frosted glass, right): source · taste-direction (F) ·
Leitwert · mood + pots · register/distance/comfort tags · palette · **derivation (why)**, then a
**"Tiefe zeigen"** fold for the rich dossier — the colliding **worlds and their rhyme** · object ·
affordances (progressive depth, E-066) → **anchor** or **copy/export**.

## Interaction — anchors as gravity

The one steering primitive is the **anchor** (max 5). Anchored tiles join the gold strip; **Aus Ankern
ableiten** runs the next wave, pulled toward the anchors. Copy/export turns a direction into a ready
design-brief prompt for a design AI.

## Tone — glossy plastic, pro

Cool light glass base (not retro paper). Frosted topbar/drawer; gradient buttons with sheen and soft
drop-shadows; tactile tiles with a colored spine per engine. Motion is spring-based, short, controlled.
One confident accent per engine.

## Removed (superseded)

The spatial **hex constellation/canvas** (`Constellation.tsx`, E-053) with its draggable flower-clusters
— replaced by the Board (E-055) and then this bento field (E-067). Earlier: the pentagon/axis radar, the
A/B/C lens, the tension knob, the Lab view, the Duolingo paper styling — gone with the axis/collision
architecture (DECISIONS E-047).

import type { VibeCard } from "../engine";
import type { LabCollision } from "../lab/CollisionCard";
import type { LabPersona } from "../lab/PersonaChip";

/** Adapters: map a real VibeCard onto the bespoke component props (defensive fallbacks). */

export function cardToCollision(c: VibeCard): LabCollision {
  const d = c.detail;
  const worlds = d?.worlds?.length
    ? d.worlds
    : [{ name: c.origin.home || "Welt", role: "Spender", rhyme: d?.derivation ?? "" }];
  const two =
    worlds.length >= 2
      ? worlds.slice(0, 2)
      : [worlds[0], { name: c.origin.object && c.origin.object !== "—" ? c.origin.object : "Gegenwelt", role: "Gegenwelt", rhyme: "" }];
  return {
    leitwert: c.leitwert,
    distance: d?.domainDistance ?? "—",
    mood: c.mood,
    palette: c.palette,
    worlds: two,
    object: d?.object && d.object !== "—" ? d.object : c.origin.object || "—",
    derivation: d?.derivation ?? c.scene ?? "",
    taste: d?.tasteDirection ?? "",
    comfort: d?.comfortRating ?? "",
  };
}

export function cardToPersona(c: VibeCard): LabPersona {
  const d = c.detail;
  return {
    leitwert: c.leitwert,
    source: c.origin.home && c.origin.home !== "Persona" ? c.origin.home : "fiktive Quelle",
    persona: d?.derivation ?? c.scene ?? "",
    mood: c.mood,
    palette: c.palette,
    typo: d?.typoDirection ?? "",
    layout: d?.layoutMotion ?? "",
    elements: d?.elements ?? [],
  };
}

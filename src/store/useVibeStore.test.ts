import { beforeEach, describe, expect, it } from "vitest";
import type { VibeCard } from "../engine";
import { MAX_ANCHORS, noveltyText, pushProduced, useVibeStore } from "./useVibeStore";

/** Anchors are the gold-set primitive (E-047): toggle on/off, capped at MAX_ANCHORS. */
const fakeCard = (id: string): VibeCard => ({
  id,
  source: "synthese",
  leitwert: id,
  weltSatz: "x",
  register: "nah",
  funde: [],
  materialien: [],
  bildReferenzen: [],
});

describe("anchors", () => {
  beforeEach(() => useVibeStore.getState().reset());

  it("toggles a card on and off the anchor set", () => {
    const c = fakeCard("a");
    useVibeStore.getState().toggleAnchor(c);
    expect(useVibeStore.getState().anchors.map((a) => a.id)).toEqual(["a"]);
    useVibeStore.getState().toggleAnchor(c);
    expect(useVibeStore.getState().anchors).toHaveLength(0);
  });

  it("caps the anchor set at MAX_ANCHORS", () => {
    for (let i = 0; i < MAX_ANCHORS + 3; i++) useVibeStore.getState().toggleAnchor(fakeCard(`c${i}`));
    expect(useVibeStore.getState().anchors).toHaveLength(MAX_ANCHORS);
  });
});

/** Novelty memory (E-063): produced Leitwerte are remembered and repelled so quality stays fresh at scale. */
describe("novelty memory", () => {
  beforeEach(() => useVibeStore.getState().reset());

  it("accumulates produced Leitwerte, deduping by normalized form", () => {
    // "frostige-glas" and "Frostige Glas" normalize to the same key → kept once.
    expect(pushProduced(["Frostige-Glas"], ["frostige glas", "Tape-Style"])).toEqual([
      "Frostige-Glas",
      "Tape-Style",
    ]);
  });

  it("repels recent Leitwerte in the prompt, and is empty when there is nothing to repel", () => {
    expect(noveltyText([])).toBe("");
    expect(noveltyText(["Frostglas-Wabe"])).toContain("Frostglas-Wabe");
    expect(noveltyText(["Frostglas-Wabe"])).toMatch(/NICHT wiederholen/);
  });

  it("starts empty and is cleared by reset", () => {
    expect(useVibeStore.getState().produced).toEqual([]);
    useVibeStore.getState().reset();
    expect(useVibeStore.getState().produced).toEqual([]);
  });
});

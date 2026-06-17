import { beforeEach, describe, expect, it } from "vitest";
import type { VibeCard } from "../engine";
import { zero } from "../engine";
import { MAX_ANCHORS, useVibeStore } from "./useVibeStore";

/** Anchors are the gold-set primitive (E-047): toggle on/off, capped at MAX_ANCHORS. */
const fakeCard = (id: string): VibeCard => ({
  id,
  leitwert: id,
  mood: "x",
  scene: "x",
  typography: { display: {} as never, body: {} as never, data: {} as never },
  palette: ["#000", "#111", "#222"],
  vector: zero(),
  coherence: { sharedAxes: [], ok: true },
  origin: { home: "—", intrusion: "—", object: "—", engineNote: "—" },
  source: "entanglement",
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

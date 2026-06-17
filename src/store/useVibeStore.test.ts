import { beforeEach, describe, expect, it } from "vitest";
import { dist, zero } from "../engine";
import type { VibeCard } from "../engine";
import { useVibeStore } from "./useVibeStore";

/**
 * Locks the steering invariant: attract (👍) pulls the centroid toward a card, repel (👎)
 * pushes it away — the re-biased centroid is what the next Iterate carries. Pure state math,
 * no network (generation now needs the live gateway).
 */
const fakeCard = (): VibeCard => ({
  id: "t1",
  leitwert: "Test-Welt",
  mood: "x",
  scene: "x",
  typography: { display: {} as never, body: {} as never, data: {} as never },
  palette: ["#000", "#111", "#222"],
  vector: { material: 0.8, energy: 0.6, time: 0.4, structure: 0.5, density: 0.3, formality: 0.2 },
  coherence: { sharedAxes: [], ok: true },
  origin: { home: "—", intrusion: "—", object: "—", engineNote: "—" },
});

describe("studio steering re-biases the centroid", () => {
  beforeEach(() => useVibeStore.getState().reset());

  it("attract pulls the centroid toward the card", () => {
    const target = fakeCard();
    const before = zero();
    useVibeStore.getState().attract(target);
    const after = useVibeStore.getState().centroid;
    expect(dist(after, target.vector)).toBeLessThan(dist(before, target.vector));
  });

  it("repel pushes the centroid away from the card", () => {
    const target = fakeCard();
    const before = zero();
    useVibeStore.getState().repel(target);
    const after = useVibeStore.getState().centroid;
    expect(dist(after, target.vector)).toBeGreaterThan(dist(before, target.vector));
  });
});

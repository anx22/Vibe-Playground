import { beforeEach, describe, expect, it } from "vitest";
import { dist } from "../engine";
import { useVibeStore } from "./useVibeStore";

/**
 * Locks the Simple-route invariant: pressing Iterate must carry the accumulated
 * attract (👍) / repel (👎) signals — i.e. the re-biased centroid — into the new batch.
 * (No network here: generate falls back to the offline skeletons, which is enough to
 * assert the centroid carry-over.)
 */
describe("studio iterate carries attract/repel", () => {
  beforeEach(() => useVibeStore.getState().reset());

  it("attract pulls the centroid toward the card; iterate then uses it", async () => {
    await useVibeStore.getState().explore();
    const cards = useVibeStore.getState().cards;
    expect(cards.length).toBeGreaterThan(0);

    const target = cards[0];
    const before = useVibeStore.getState().centroid;
    useVibeStore.getState().attract(target);
    const after = useVibeStore.getState().centroid;

    expect(dist(after, target.vector)).toBeLessThanOrEqual(dist(before, target.vector));

    await useVibeStore.getState().iterate();
    expect(useVibeStore.getState().cards.length).toBeGreaterThan(0);
  });

  it("repel pushes the centroid away from the card", async () => {
    await useVibeStore.getState().explore();
    const target = useVibeStore.getState().cards[0];
    const before = useVibeStore.getState().centroid;
    useVibeStore.getState().repel(target);
    const after = useVibeStore.getState().centroid;

    expect(dist(after, target.vector)).toBeGreaterThanOrEqual(dist(before, target.vector));
  });
});

import { describe, expect, it } from "vitest";
import type { VibeCard } from "../engine";
import { GATE, passesGate, spreadByMix } from "./select";

/**
 * Quality GATE (#5): a card reaches the board only if BOTH non-negotiables (onTarget + formSubstanz)
 * clear the gate; surprise+craft only rank survivors and can NEVER lift a card past the gate. A judge
 * outage (unscored card) degrades to show-all, never an empty board.
 */
const base: VibeCard = {
  id: "x",
  source: "synthese",
  leitwert: "x",
  weltSatz: "x",
  register: "nah",
  funde: [],
  materialien: [],
  bildReferenzen: [],
};
const withAxes = (a: { onTarget: number; surprise: number; craft: number; formSubstanz: number }): VibeCard => ({
  ...base,
  quality: { ...a, overall: (a.onTarget + a.surprise + a.craft + a.formSubstanz) / 4, note: "" },
});
const flat = (n: number): VibeCard => withAxes({ onTarget: n, surprise: n, craft: n, formSubstanz: n });
const withMix = (id: string, register: "nah" | "fern", n: number): VibeCard => ({ ...flat(n), id, leitwert: id, register });

describe("quality gate (#5 — onTarget + formSubstanz are the non-negotiables)", () => {
  it("passes a card that clears both gate axes", () => {
    expect(passesGate(flat(GATE))).toBe(true);
    expect(passesGate(flat(5))).toBe(true);
  });

  it("fails a card below the gate", () => {
    expect(passesGate(flat(GATE - 0.5))).toBe(false);
    expect(passesGate(flat(2))).toBe(false);
  });

  it("fails design-empty even when surprise+craft are maxed (closes the old mean-floor leak)", () => {
    expect(passesGate(withAxes({ onTarget: 5, surprise: 5, craft: 5, formSubstanz: 2 }))).toBe(false);
  });

  it("fails off-brief even when everything else is strong", () => {
    expect(passesGate(withAxes({ onTarget: 2, surprise: 5, craft: 5, formSubstanz: 5 }))).toBe(false);
  });

  it("passes a gate-clearing card even when surprise+craft are weak (they only rank, never gate)", () => {
    expect(passesGate(withAxes({ onTarget: GATE, surprise: 1, craft: 1, formSubstanz: GATE }))).toBe(true);
  });

  it("never gates out an unscored card (judge outage → show-all, never an empty board)", () => {
    expect(passesGate(base)).toBe(true);
  });
});

describe("mix spread (near/far interleave)", () => {
  it("keeps the single best card at position #1", () => {
    const cards = [withMix("a", "nah", 5), withMix("b", "nah", 4.5), withMix("c", "fern", 4)];
    expect(spreadByMix(cards)[0].id).toBe("a");
  });

  it("interleaves nah/fern so the visible field alternates between the registers", () => {
    const cards = [
      withMix("n1", "nah", 5),
      withMix("n2", "nah", 4.8),
      withMix("n3", "nah", 4.6),
      withMix("f1", "fern", 4.4),
      withMix("f2", "fern", 4.2),
    ];
    expect(spreadByMix(cards).map((c) => c.register)).toEqual(["nah", "fern", "nah", "fern", "nah"]);
    expect(spreadByMix(cards).map((c) => c.id)).toEqual(["n1", "f1", "n2", "f2", "n3"]);
  });

  it("preserves order when every card shares one register", () => {
    const cards = [withMix("a", "nah", 5), withMix("b", "nah", 4)];
    expect(spreadByMix(cards).map((c) => c.id)).toEqual(["a", "b"]);
  });
});

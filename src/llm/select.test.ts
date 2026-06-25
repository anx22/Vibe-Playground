import { describe, expect, it } from "vitest";
import type { VibeCard } from "../engine";
import { QUALITY_FLOOR, passesFloor, spreadByMix } from "./select";

/** Quality floor (E-063): nothing under the bar reaches the board; a judge outage degrades to show-all. */
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
const withScore = (overall: number): VibeCard => ({
  ...base,
  quality: { onTarget: overall, surprise: overall, craft: overall, formSubstanz: overall, overall, note: "" },
});
const withMix = (id: string, register: "nah" | "fern", overall: number): VibeCard => ({
  ...base,
  id,
  leitwert: id,
  register,
  quality: { onTarget: overall, surprise: overall, craft: overall, formSubstanz: overall, overall, note: "" },
});

describe("quality floor (E-063)", () => {
  it("keeps cards at or above the floor", () => {
    expect(passesFloor(withScore(QUALITY_FLOOR))).toBe(true);
    expect(passesFloor(withScore(5))).toBe(true);
  });

  it("rejects cards below the floor", () => {
    expect(passesFloor(withScore(QUALITY_FLOOR - 0.5))).toBe(false);
    expect(passesFloor(withScore(2))).toBe(false);
  });

  it("never floors out an unscored card (judge outage → show-all, never an empty board)", () => {
    expect(passesFloor(base)).toBe(true);
  });
});

describe("mix spread (round 5 — near/far interleave)", () => {
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

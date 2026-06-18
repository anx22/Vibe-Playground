import { describe, expect, it } from "vitest";
import type { VibeCard } from "../engine";
import { zero } from "../engine";
import { QUALITY_FLOOR, passesFloor } from "./select";

/** Quality floor (E-063): nothing under the bar reaches the board; a judge outage degrades to show-all. */
const base: VibeCard = {
  id: "x",
  leitwert: "x",
  mood: "x",
  typography: { display: {} as never, body: {} as never, data: {} as never },
  palette: ["#000", "#111", "#222"],
  vector: zero(),
  coherence: { sharedAxes: [], ok: true },
  origin: { home: "—", intrusion: "—", object: "—", engineNote: "—" },
  source: "entanglement",
};
const withScore = (overall: number): VibeCard => ({
  ...base,
  quality: { onTarget: overall, surprise: overall, craft: overall, renderability: overall, overall, note: "" },
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

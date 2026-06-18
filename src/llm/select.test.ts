import { describe, expect, it } from "vitest";
import type { VibeCard } from "../engine";
import { zero } from "../engine";
import { QUALITY_FLOOR, passesFloor, spreadByRegister } from "./select";

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
  quality: { onTarget: overall, surprise: overall, craft: overall, designValue: overall, overall, note: "" },
});
const withReg = (id: string, register: string | undefined, overall: number): VibeCard => ({
  ...base,
  id,
  leitwert: id,
  quality: { onTarget: overall, surprise: overall, craft: overall, designValue: overall, overall, note: "", register },
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

describe("register spread (E-065)", () => {
  it("keeps the single best card at position #1", () => {
    const cards = [
      withReg("a", "Papier-Archiv", 5),
      withReg("b", "Papier-Archiv", 4.5),
      withReg("c", "Metall-Industrie", 4),
    ];
    expect(spreadByRegister(cards)[0].id).toBe("a");
  });

  it("interleaves registers so the visible top spans material feels, not one register", () => {
    const cards = [
      withReg("p1", "Papier-Archiv", 5),
      withReg("p2", "Papier-Archiv", 4.8),
      withReg("p3", "Papier-Archiv", 4.6),
      withReg("m1", "Metall-Industrie", 4.4),
      withReg("g1", "Glas-Flüssig", 4.2),
    ];
    const top3 = spreadByRegister(cards).slice(0, 3).map((c) => c.quality?.register);
    expect(new Set(top3).size).toBe(3);
  });

  it("sinks unlabeled (judge-outage) cards below labeled ones, order-stable", () => {
    const cards = [
      withReg("u1", undefined, 4),
      withReg("r1", "Stein-Keramik", 3.9),
      withReg("u2", undefined, 3.8),
    ];
    expect(spreadByRegister(cards).map((c) => c.id)).toEqual(["r1", "u1", "u2"]);
  });

  it("preserves order when every card shares one register", () => {
    const cards = [withReg("a", "Textil-Faser", 5), withReg("b", "Textil-Faser", 4)];
    expect(spreadByRegister(cards).map((c) => c.id)).toEqual(["a", "b"]);
  });
});

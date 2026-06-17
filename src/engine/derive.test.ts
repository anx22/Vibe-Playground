import { describe, expect, it } from "vitest";
import type { AxisVector } from "./types";
import { moodFor, paletteFor, typoFor } from "./derive";

const HEX = /^#[0-9a-f]{6}$/;
const v = (o: Partial<AxisVector> = {}): AxisVector => ({
  material: 0, energy: 0, time: 0, structure: 0, density: 0, formality: 0, ...o,
});

describe("derive", () => {
  it("paletteFor returns three valid hex colors for any vector (incl. extremes)", () => {
    for (const vec of [v(), v({ material: 1, energy: 1, density: 1, structure: 1, time: 1 }),
                       v({ material: -1, energy: -1, density: -1, structure: -1, time: -1 })]) {
      const p = paletteFor(vec);
      expect(p).toHaveLength(3);
      for (const c of p) expect(c).toMatch(HEX);
    }
  });

  it("moodFor names the two most decisive axes", () => {
    const m = moodFor(v({ energy: 0.9, density: 0.6 }));
    expect(m).toMatch(/^[A-ZÄÖÜ][a-zäöü]+-[a-zäöü]+$/);
    expect(m.toLowerCase()).toContain("roh"); // energy+ dominant
  });

  it("typoFor returns a display/body/data trio with real font names", () => {
    const t = typoFor(v({ time: 0.8 }), () => 0);
    expect(t.display.role).toBe("Display");
    expect(t.body.role).toBe("Body");
    expect(t.data.role).toBe("Data");
    for (const slot of [t.display, t.body, t.data]) {
      expect(slot.name.length).toBeGreaterThan(0);
      expect(slot.family).toContain(slot.name);
    }
  });
});

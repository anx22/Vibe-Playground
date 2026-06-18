import { describe, expect, it } from "vitest";
import { antiCliche, antiCorpusTokens, concreteness, distinctness, leitwertFormat, scoreEngine } from "./metrics";

describe("leitwertFormat (E-071)", () => {
  it("rewards a concrete 2–4 noun-compound", () => {
    expect(leitwertFormat("Black-Box-Vigilanz")).toBeGreaterThan(0.8);
    expect(leitwertFormat("Reinraum-Almanach")).toBeGreaterThan(0.8);
  });
  it("punishes abstract value-words and sentence/verb forms", () => {
    expect(leitwertFormat("Stille Würde")).toBeLessThan(0.3);
    expect(leitwertFormat("Messung ist Mut")).toBeLessThan(0.3);
    expect(leitwertFormat("Black-Box-Vigilanz")).toBeGreaterThan(leitwertFormat("Stille Würde"));
  });
});

describe("concreteness (E-071)", () => {
  it("is 1 for a concrete compound, 0 for a wholly abstract one", () => {
    expect(concreteness("Black-Box-Vigilanz")).toBe(1);
    expect(concreteness("Stille Würde")).toBe(0);
  });
});

describe("antiCliche (E-071)", () => {
  const anti = antiCorpusTokens(["Uhrmacherei, Uhrwerk, Zahnräder", "Leuchtturm, Leuchtfeuer"]);
  it("scores cliché-overlapping output below fresh output", () => {
    expect(antiCliche("Schleimpilz-Netz", anti)).toBe(1);
    expect(antiCliche("Uhrwerk-Kartograf", anti)).toBeLessThan(1);
    expect(antiCliche("Schleimpilz-Netz", anti)).toBeGreaterThan(antiCliche("Leuchtturm-Logbuch", anti));
  });
});

describe("distinctness (E-071)", () => {
  it("punishes a suffix-collapsed batch vs. a varied one", () => {
    const collapsed = distinctness(["Fels-Logbuch", "Moos-Logbuch", "Tang-Logbuch"]);
    const varied = distinctness(["Ebru-Schwarm", "Curling-Drift", "Orisha-Takt"]);
    expect(varied).toBeGreaterThan(collapsed);
  });
  it("is 1 for a single item", () => {
    expect(distinctness(["Solo-Wert"])).toBe(1);
  });
});

describe("scoreEngine determinism + discrimination (E-071)", () => {
  const anti = antiCorpusTokens(["Uhrwerk, Zahnräder", "Leuchtturm"]);
  it("scores the same sample identically twice (exact, reproducible)", () => {
    const cards = [{ leitwert: "Ebru-Schwarm", world: "Ebru" }, { leitwert: "Curling-Drift", world: "Curling" }];
    expect(scoreEngine(cards, anti)).toEqual(scoreEngine(cards, anti));
  });
  it("ranks concrete compounds above abstract value-words", () => {
    const concrete = scoreEngine([{ leitwert: "Black-Box-Vigilanz" }, { leitwert: "Reinraum-Almanach" }], anti);
    const abstract = scoreEngine([{ leitwert: "Stille Würde" }, { leitwert: "Leise Eleganz" }], anti);
    expect(concrete.overall).toBeGreaterThan(abstract.overall);
  });
});

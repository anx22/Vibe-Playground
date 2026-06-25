import { describe, expect, it } from "vitest";
import type { VibeCard } from "./engine";
import { clusterText, groupText } from "./export";

const card: VibeCard = {
  id: "synthese-x-0",
  source: "synthese",
  leitwert: "Letterpress-Seidenband",
  weltSatz: "Eine cremeweiße Karte, in die der Druck tiefe Mulden presst.",
  register: "nah",
  metaphern: ["geprägte Initialen", "ein Band im Seewind"],
  materialien: ["Büttenpapier", "Seidenband", "Siegelwachs"],
  bildVergleiche: ["wie ein gepresstes Herbarium"],
};

describe("groupText (gruppiert copy)", () => {
  it("formats a labeled bullet list", () => {
    expect(groupText("Materialien", ["Büttenpapier", "Seidenband"])).toBe(
      "Materialien:\n– Büttenpapier\n– Seidenband",
    );
  });
});

describe("clusterText (gesamt copy)", () => {
  it("leads with the Leitwert and the Welt-Satz", () => {
    const out = clusterText(card);
    expect(out.startsWith("Letterpress-Seidenband\n")).toBe(true);
    expect(out).toContain("Eine cremeweiße Karte");
  });

  it("includes every non-empty group with its bulleted items", () => {
    const out = clusterText(card);
    expect(out).toContain("Metaphern:");
    expect(out).toContain("– geprägte Initialen");
    expect(out).toContain("Materialien:");
    expect(out).toContain("Bild-Vergleiche:");
    expect(out).toContain("– wie ein gepresstes Herbarium");
  });

  it("omits empty groups entirely", () => {
    const sparse: VibeCard = { ...card, metaphern: [], materialien: [], bildVergleiche: [] };
    const out = clusterText(sparse);
    expect(out).not.toContain("Metaphern:");
    expect(out).toBe("Letterpress-Seidenband\nEine cremeweiße Karte, in die der Druck tiefe Mulden presst.");
  });
});

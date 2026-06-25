import { describe, expect, it } from "vitest";
import type { VibeCard } from "./engine";
import { clusterText, groupText, worldPromptText } from "./export";

const card: VibeCard = {
  id: "synthese-x-0",
  source: "synthese",
  leitwert: "Letterpress-Seidenband",
  weltSatz: "Eine cremeweiße Karte, in die der Druck tiefe Mulden presst.",
  register: "nah",
  funde: ["geprägte Initialen", "ein Band im Seewind"],
  materialien: ["Büttenpapier", "Seidenband", "Siegelwachs"],
  bildReferenzen: ["wie ein gepresstes Herbarium"],
};

describe("groupText (gruppiert copy)", () => {
  it("formats a labeled bullet list", () => {
    expect(groupText("Materialien", ["Büttenpapier", "Seidenband"])).toBe(
      "Materialien:\n– Büttenpapier\n– Seidenband",
    );
  });
});

describe("clusterText (gesamt copy)", () => {
  it("leads with the Welt-Satz (headline/soul), then the Leitwert (#3)", () => {
    const out = clusterText(card);
    expect(out.startsWith("Eine cremeweiße Karte")).toBe(true);
    expect(out.indexOf(card.weltSatz)).toBeLessThan(out.indexOf(card.leitwert));
  });

  it("includes every non-empty group with its bulleted items", () => {
    const out = clusterText(card);
    expect(out).toContain("Funde:");
    expect(out).toContain("– geprägte Initialen");
    expect(out).toContain("Materialien:");
    expect(out).toContain("Bild-Referenzen:");
    expect(out).toContain("– wie ein gepresstes Herbarium");
  });

  it("omits empty groups entirely", () => {
    const sparse: VibeCard = { ...card, funde: [], materialien: [], bildReferenzen: [] };
    expect(clusterText(sparse)).toBe(
      "Eine cremeweiße Karte, in die der Druck tiefe Mulden presst.\nLetterpress-Seidenband",
    );
  });
});

describe("worldPromptText (composed world-prompt, #7)", () => {
  it("folds the cluster into one paste-ready line led by Leitwert + Welt-Satz", () => {
    const out = worldPromptText(card);
    expect(out).not.toContain("\n");
    expect(out.startsWith("Letterpress-Seidenband — Eine cremeweiße Karte")).toBe(true);
    expect(out).toContain("Sichtbare Formen: geprägte Initialen, ein Band im Seewind.");
    expect(out).toContain("Materialien: Büttenpapier, Seidenband, Siegelwachs.");
    expect(out).toContain("Bild-Anker: wie ein gepresstes Herbarium.");
  });

  it("skips empty groups without dangling labels", () => {
    const sparse: VibeCard = { ...card, funde: [], materialien: [], bildReferenzen: [] };
    expect(worldPromptText(sparse)).toBe(
      "Letterpress-Seidenband — Eine cremeweiße Karte, in die der Druck tiefe Mulden presst.",
    );
  });
});

import { describe, expect, it } from "vitest";
import type { ShakerToken, TokenKind, VibeCard } from "./engine";
import { clusterText, groupText, shakerText, worldPromptText } from "./export";

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

describe("shakerText (Vibe-Shaker copy-out)", () => {
  const tok = (kind: TokenKind, text: string, cardId = "c1"): ShakerToken => ({ id: `${cardId}::${kind}::${text}`, cardId, kind, text });

  it("returns an empty string for no tokens", () => {
    expect(shakerText([])).toBe("");
  });

  it("groups by kind in fixed order — Richtung/Welt as lead lines, the rest bulleted", () => {
    const out = shakerText([
      tok("materialien", "Büttenpapier"),
      tok("leitwert", "Letterpress-Seidenband"),
      tok("funde", "geprägte Initialen"),
      tok("weltSatz", "Eine cremeweiße Karte."),
    ]);
    const iR = out.indexOf("Richtung:"), iW = out.indexOf("Welt:"), iF = out.indexOf("Funde:"), iM = out.indexOf("Materialien:");
    expect(iR).toBeGreaterThanOrEqual(0);
    expect(iR).toBeLessThan(iW);
    expect(iW).toBeLessThan(iF);
    expect(iF).toBeLessThan(iM);
    expect(out).toContain("Richtung: Letterpress-Seidenband");
    expect(out).toContain("Welt: Eine cremeweiße Karte.");
    expect(out).toContain("Funde:\n– geprägte Initialen");
  });

  it("dedupes identical text within a kind (same material harvested from two cards)", () => {
    const out = shakerText([
      tok("materialien", "Leinen", "c1"),
      tok("materialien", "Leinen", "c2"),
      tok("materialien", "Seide", "c1"),
    ]);
    expect(out).toBe("Materialien:\n– Leinen\n– Seide");
  });

  it("joins multiple Richtung morsels with a middot", () => {
    expect(shakerText([tok("leitwert", "A"), tok("leitwert", "B")])).toBe("Richtung: A · B");
  });
});

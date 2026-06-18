import { describe, expect, it } from "vitest";
import type { VibeCard } from "./engine";
import { buildExportPrompt } from "./export";

const base = {
  mood: "kühl, wachsam",
  typography: { display: {} as never, body: {} as never, data: {} as never },
  palette: ["#101010", "#606060", "#d0d0d0"] as [string, string, string],
  vector: { material: 0, energy: 0, time: 0, structure: 0, density: 0, formality: 0 },
  coherence: { sharedAxes: [], ok: true },
};

const bridgeCard: VibeCard = {
  ...base,
  id: "entanglement-x-0",
  leitwert: "Black-Box-Vigilanz",
  scene: "warum es trägt",
  source: "entanglement",
  origin: { home: "Flugschreiber × OP-Saal", intrusion: "Logbuch", object: "Logbuch", engineNote: "x" },
  detail: {
    worlds: [{ name: "Flugschreiber", role: "Spender", rhyme: "lückenlose Protokollierung" }],
    object: "Logbuch",
    derivation: "Beide protokollieren lückenlos.",
    affordances: ["matt", "graviert", "redundant"],
  },
};

const personaCard: VibeCard = {
  ...base,
  id: "persona-x-0",
  leitwert: "Stille Würde",
  scene: "Ein obsessiver Uhrmacher …",
  source: "persona",
  origin: { home: "Persona", intrusion: "—", object: "—", engineNote: "Ein obsessiver Uhrmacher …" },
  detail: { derivation: "Ein obsessiver Uhrmacher …" },
};

describe("buildExportPrompt (compact style trigger)", () => {
  it("is a tight layered style trigger for a bridge card (world + texture + palette, no essay)", () => {
    const out = buildExportPrompt(bridgeCard);
    expect(out).toContain("Stil-Trigger: «Black-Box-Vigilanz»");
    expect(out).toContain("Welt: Flugschreiber");
    expect(out).toContain("Material & Textur:");
    expect(out).toContain("#101010");
    expect(out.split("\n").length).toBeLessThan(10); // compact layers, not a Riesenbuch
  });

  it("uses the person as the source for a persona card (no worlds)", () => {
    const out = buildExportPrompt(personaCard);
    expect(out).toContain("Stil-Trigger: «Stille Würde»");
    expect(out).toContain("Quelle:");
    expect(out).not.toContain("Welt:");
  });
});

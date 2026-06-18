import { describe, expect, it } from "vitest";
import type { VibeCard } from "./engine";
import { buildExportPrompt, buildTrigger } from "./export";

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

describe("buildTrigger + target tabs (C9)", () => {
  it("packs the whole vibe into a single line", () => {
    const out = buildTrigger(bridgeCard, "brandboard");
    expect(out.split("\n")).toHaveLength(1);
    expect(out).toContain("«Black-Box-Vigilanz»");
    expect(out).toContain("#101010");
  });

  it("flavours Midjourney as an English image prompt with params", () => {
    const out = buildExportPrompt(bridgeCard, "midjourney");
    expect(out).toContain("--ar");
    expect(out).toMatch(/aesthetic|surfaces/);
    expect(out).not.toContain("Stil-Trigger");
  });

  it("frames ChatGPT as an art-director instruction", () => {
    const out = buildExportPrompt(bridgeCard, "chatgpt");
    expect(out).toContain("Art Director");
    expect(out).toContain("Black-Box-Vigilanz");
  });

  it("keeps brandboard as the default layered spec", () => {
    expect(buildExportPrompt(bridgeCard)).toBe(buildExportPrompt(bridgeCard, "brandboard"));
  });
});

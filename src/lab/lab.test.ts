import { describe, expect, it } from "vitest";
import { METHODS, offlineMethods, runLab } from "./index";

const briefings = [{ id: "t", label: "t", text: "tech futuristisch dicht" }];

describe("lab harness", () => {
  it("runs offline methods with metrics, deterministically", async () => {
    const a = await runLab(offlineMethods(), briefings, { seed: 7, batchSize: 5 });
    const b = await runLab(offlineMethods(), briefings, { seed: 7, batchSize: 5 });

    expect(a.methodIds.length).toBeGreaterThan(0);
    for (const mid of a.methodIds) {
      const cell = a.cells[mid]["t"];
      expect(cell.cards.length).toBeGreaterThan(0);
      expect(cell.metrics.coherence).toBeGreaterThanOrEqual(0);
      expect(cell.metrics.coherence).toBeLessThanOrEqual(1);
      expect(cell.metrics.diversity).toBeGreaterThanOrEqual(0);
      // determinism: same seed → same Leitwerte
      expect(b.cells[mid]["t"].cards.map((c) => c.leitwert)).toEqual(
        cell.cards.map((c) => c.leitwert),
      );
    }
  });

  it("the bridge method is fully coherent by construction", async () => {
    const run = await runLab(
      METHODS.filter((m) => m.id === "a-bridge"),
      briefings,
      { seed: 3 },
    );
    expect(run.cells["a-bridge"]["t"].metrics.coherence).toBe(1);
  });

  it("skips LLM methods unless allowed", async () => {
    const run = await runLab(METHODS, briefings, { seed: 1 });
    expect(run.skipped.length).toBeGreaterThan(0);
    expect(run.skipped).toContain("c-persona");
  });
});

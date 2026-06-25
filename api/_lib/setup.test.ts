import { describe, expect, it } from "vitest";
import {
  JUDGE_SYSTEM,
  PERSONA_SYSTEM,
  SYNTHESE_SYSTEM,
} from "./setup.generated.js";

describe("setup assembly from YAML (E-074)", () => {
  it("assembles every engine prompt substantial with a role", () => {
    for (const s of [SYNTHESE_SYSTEM, PERSONA_SYSTEM, JUDGE_SYSTEM]) {
      expect(s.length).toBeGreaterThan(200);
      expect(s).toContain("<rolle>");
    }
  });

  it("injects the declared shared rule blocks, incl. the cluster + mix rules", () => {
    // synthese declares the shared rules (cluster replaces the old design-lesarten) + its own output
    for (const tag of [
      "<leitwert_format>",
      "<repertoire>",
      "<diversität>",
      "<material_register>",
      "<welt_kompass>",
      "<register_mix>",
      "<denkanstoss_cluster>",
      "<render_probe>",
      "<ausgabe>",
    ]) {
      expect(SYNTHESE_SYSTEM).toContain(tag);
    }
    // no pre-designing: the old design-readings rule is gone
    expect(SYNTHESE_SYSTEM).not.toContain("<design_lesarten>");
    // the judge carries its own rubric and pulls in no shared rules
    expect(JUDGE_SYSTEM).toContain("formSubstanz");
    expect(JUDGE_SYSTEM).not.toContain("<leitwert_format>");
  });
});

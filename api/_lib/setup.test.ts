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

  it("injects exactly the declared shared rule blocks", () => {
    // synthese declares all five shared rules + its own output
    for (const tag of ["<leitwert_format>", "<repertoire>", "<diversität>", "<render_register>", "<render_probe>", "<ausgabe>"]) {
      expect(SYNTHESE_SYSTEM).toContain(tag);
    }
    // the judge carries its own rubric and pulls in no shared rules
    expect(JUDGE_SYSTEM).toContain("designValue");
    expect(JUDGE_SYSTEM).not.toContain("<leitwert_format>");
  });
});

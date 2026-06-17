import { describe, expect, it } from "vitest";
import { clampN, clampStr, clampTier } from "./guard";

describe("input guard (cost-amplification caps)", () => {
  it("clamps n into [1, 8] and defaults non-numbers", () => {
    expect(clampN(10000)).toBe(8);
    expect(clampN(0)).toBe(1);
    expect(clampN(-5)).toBe(1);
    expect(clampN(4)).toBe(4);
    expect(clampN(undefined)).toBe(6);
    expect(clampN("7" as unknown)).toBe(6); // non-number → default, not coerced
    expect(clampN(3.9)).toBe(3);
  });

  it("caps free text length and rejects non-strings", () => {
    expect(clampStr("x".repeat(5000)).length).toBe(2000);
    expect(clampStr("hi", 200)).toBe("hi");
    expect(clampStr(undefined)).toBe("");
    expect(clampStr({ a: 1 } as unknown)).toBe("");
  });

  it("never lets a client force premium on a generation endpoint", () => {
    expect(clampTier("premium", false, "strong")).toBe("strong");
    expect(clampTier("strong", false, "strong")).toBe("strong");
    expect(clampTier("cheap", false, "strong")).toBe("cheap");
    expect(clampTier("garbage", false, "strong")).toBe("strong");
  });

  it("allows premium only where explicitly permitted (the judge)", () => {
    expect(clampTier("premium", true, "cheap")).toBe("premium");
    expect(clampTier(undefined, true, "cheap")).toBe("cheap");
  });
});

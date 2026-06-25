import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

// A plain (non-vi.fn) stub for generateObject: vi.fn tracks every returned promise with an internal
// .then, which turns a *rejecting* async mock into a stray unhandled rejection that vitest then
// blames on the test. A plain function leaves our own `await` as the only handler — no false unhandled.
const state = vi.hoisted(() => {
  class FakeNoObject extends Error {
    static isInstance(e: unknown): boolean {
      return e instanceof FakeNoObject;
    }
  }
  return {
    FakeNoObject,
    calls: 0,
    impl: async (): Promise<unknown> => ({ object: { ok: true }, usage: {} }),
  };
});

vi.mock("ai", () => ({
  generateObject: (..._args: unknown[]) => {
    state.calls++;
    return state.impl();
  },
  NoObjectGeneratedError: state.FakeNoObject,
}));

import { genObject } from "./gateway";

const okSchema = z.object({ ok: z.boolean() });
const call = () => genObject({ model: "m", schema: okSchema, prompt: "p", noCache: true });

beforeEach(() => {
  state.calls = 0;
  state.impl = async () => ({ object: { ok: true }, usage: {} });
});

describe("genObject retry (QS-16: schema-miss robustness)", () => {
  it("retries a NoObjectGeneratedError and succeeds on the resample", async () => {
    let n = 0;
    state.impl = async () => {
      if (++n === 1) throw new state.FakeNoObject("miss");
      return { object: { ok: true }, usage: {} };
    };
    await expect(call()).resolves.toEqual({ ok: true });
    expect(state.calls).toBe(2);
  });

  it("gives up after 3 attempts if every sample fails the schema", async () => {
    state.impl = async () => {
      throw new state.FakeNoObject("miss");
    };
    let caught: unknown;
    try {
      await call();
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(state.FakeNoObject);
    expect(state.calls).toBe(3);
  });

  it("does NOT retry other errors — they propagate on the first try", async () => {
    state.impl = async () => {
      throw new Error("network boom");
    };
    let caught: unknown;
    try {
      await call();
    } catch (e) {
      caught = e;
    }
    expect((caught as Error)?.message).toBe("network boom");
    expect(state.calls).toBe(1);
  });
});

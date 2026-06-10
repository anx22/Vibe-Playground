import type { Method } from "./method";
import { recipe } from "./method";
import { bridgeMix, contrastMix, lambdaBandMix, triadMix } from "./mix";
import { curatedSource, llmSeedSource, personaSource } from "./sources";
import { llmSceneRenderer, templateRenderer } from "./render";

/**
 * The method registry — the open creative space. Add a new mixing idea, a new world
 * source, or a new composition here; the Lab picks it up automatically. Nothing forces
 * the C→B→A stack: single engines and experimental blends sit side by side.
 */

// ── Runnable offline (curated source + template render) ────────────────────────
const aBridge = recipe({
  id: "a-bridge",
  label: "A · Bridge-Regel",
  kind: "single",
  source: curatedSource,
  mix: bridgeMix,
  render: templateRenderer,
});

const bLambdaOffline = recipe({
  id: "b-lambda-offline",
  label: "B-Methodik · Distanz + λ (offline)",
  kind: "single",
  source: curatedSource,
  mix: lambdaBandMix,
  render: templateRenderer,
  noveltyTau: 0.35,
});

const xTriad = recipe({
  id: "x-triad",
  label: "Experiment · Triade (3 Welten)",
  kind: "experimental",
  source: curatedSource,
  mix: triadMix,
  render: templateRenderer,
});

const xContrast = recipe({
  id: "x-contrast",
  label: "Experiment · Kontrast",
  kind: "experimental",
  source: curatedSource,
  mix: contrastMix,
  render: templateRenderer,
});

// ── Registered but LLM-gated (skipped until a key + proxy are wired) ────────────
const bLLM = recipe({
  id: "b-llm",
  label: "B · LLM Seed-Expansion + λ",
  kind: "single",
  source: llmSeedSource,
  mix: lambdaBandMix,
  render: llmSceneRenderer,
  noveltyTau: 0.35,
});

const cPersona = recipe({
  id: "c-persona",
  label: "C · Persona → Szene",
  kind: "single",
  source: personaSource,
  mix: bridgeMix,
  render: llmSceneRenderer,
});

/** A composition is itself just a method — the stack is one option, not the spine. */
const stackCBA: Method = {
  id: "stack-cba",
  label: "Stack · C → B → A (Netz)",
  kind: "stack",
  requiresLLM: true,
  async generate() {
    throw new Error("Stack needs the LLM engines (B/C) — wire a key first.");
  },
};

export const METHODS: Method[] = [
  aBridge,
  bLambdaOffline,
  xTriad,
  xContrast,
  bLLM,
  cPersona,
  stackCBA,
];

export const offlineMethods = () => METHODS.filter((m) => !m.requiresLLM);

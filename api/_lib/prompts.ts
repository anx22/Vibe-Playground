/**
 * Engine & judge system prompts. The prompt TEXT now lives in api/_lib/setup/*.yaml — the single tuning
 * surface — and is assembled into ./setup.generated.ts by `npm run setup` (also part of `npm run build`).
 * This module re-exports the generated constants under their established names, so the endpoints
 * (entangle/workbench/persona/judge) and their imports stay unchanged. To tune ANY wording —
 * a role, a rule, a negative example, an output spec — edit the YAML and regenerate.
 */
export * from "./setup.generated.js";

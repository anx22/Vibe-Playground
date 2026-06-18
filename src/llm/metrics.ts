/**
 * Deterministic, objective quality metrics for engine outputs (E-071 eval) — NO LLM judge, so the same
 * inputs always yield the same scores (reproducible). They encode the engines' own stated failure modes:
 *   · leitwertFormat  — is it a concrete 2–4 noun-compound, not a sentence / verb-phrase / abstract value
 *     («Eisblumen»-failure, E-024)?
 *   · concreteness    — fraction of non-abstract tokens (derivable design-value vs. empty abstraction).
 *   · antiCliche      — lexical distance from the Anti-Korpus (cliché / canon-reflex avoidance, A1).
 *   · distinctness    — batch-level anti-mode-collapse (unique · suffix-spread · pairwise token-distance).
 * All pure, all in [0,1] (higher = better). Lexical on purpose: no network, fully deterministic.
 */

/** German abstract value-/virtue-words that are VERBOTEN as a Leitwert (LEITWERT_RULE). */
const ABSTRACT_WORDS = new Set([
  "stille", "mut", "würde", "vertrauen", "risiko", "hoffnung", "freiheit", "wandel", "klarheit",
  "balance", "harmonie", "eleganz", "kraft", "energie", "leidenschaft", "innovation", "qualität",
  "sicherheit", "präzision", "exzellenz", "authentizität", "nachhaltigkeit", "tradition", "moderne",
  "zukunft", "wahrheit", "schönheit", "ruhe", "stärke", "fortschritt", "verantwortung", "respekt",
  "integrität", "ehrlichkeit", "gemeinschaft", "identität", "emotion", "gefühl", "seele", "geist",
  "vision", "wert", "würdig", "sinn", "mensch", "menschlichkeit", "wärme", "nähe", "weite",
]);

/** Finite-verb / predicate markers that betray a sentence or instruction instead of a compound. */
const VERB_MARKERS = /\b(ist|sind|war|wird|werden|trägt|macht|zeigt|schafft|bedeutet|sichtbar|gibt|lässt|hält|bringt|braucht)\b/i;

/** Over-used compound suffixes the prompts warn about — collapsed into families for the suffix metric. */
const SUFFIX_FAMILIES = [
  "logbuch", "almanach", "protokoll", "raster", "kodex", "atlas", "kompendium", "register",
  "archiv", "manifest", "kartei", "journal", "chronik", "vigilanz",
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[«»"'„“”]/g, " ")
    .split(/[\s\-–—/×·,.;:()]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** [0..1] — Leitwert is a concrete 2–4 noun-compound, not a sentence / verb-phrase / abstract value. */
export function leitwertFormat(leitwert: string): number {
  const lw = (leitwert ?? "").trim();
  if (!lw) return 0;
  const toks = tokenize(lw);
  let s = 1;
  if (toks.length < 2) s -= 0.4; // single word → not a compound
  if (toks.length > 4) s -= 0.2 * (toks.length - 4); // too many parts → drifting into a phrase
  if (/[.!?]$/.test(lw)) s -= 0.3; // ends like a sentence
  if (VERB_MARKERS.test(lw)) s -= 0.45; // "X ist Y" / verb phrase / instruction
  const absHits = toks.filter((t) => ABSTRACT_WORDS.has(t)).length;
  s -= 0.35 * absHits; // abstract value-words
  if (absHits > 0 && absHits === toks.length) s -= 0.3; // wholly abstract
  if (!lw.includes("-")) s -= 0.1; // the canonical form hyphenates
  return clamp01(s);
}

/** [0..1] — fraction of tokens that are NOT abstract value-words (derivable vs. empty abstraction). */
export function concreteness(leitwert: string): number {
  const toks = tokenize(leitwert);
  if (!toks.length) return 0;
  const abstract = toks.filter((t) => ABSTRACT_WORDS.has(t)).length;
  return clamp01(1 - abstract / toks.length);
}

/** Token set (len ≥ 4) from the Anti-Korpus phrases, for the antiCliche overlap metric. */
export function antiCorpusTokens(phrases: string[]): Set<string> {
  const set = new Set<string>();
  for (const p of phrases) for (const t of tokenize(p)) if (t.length >= 4) set.add(t);
  return set;
}

/** [0..1] — 1 − share of meaningful tokens that hit the Anti-Korpus. Higher = fresher, less cliché. */
export function antiCliche(text: string, anti: Set<string>): number {
  const toks = tokenize(text).filter((t) => t.length >= 4);
  if (!toks.length) return 1;
  const hits = toks.filter((t) => anti.has(t)).length;
  return clamp01(1 - hits / toks.length);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

/** [0..1] — batch anti-mode-collapse: 0.4·unique-ratio + 0.3·suffix-spread + 0.3·mean-pairwise-distance. */
export function distinctness(leitwerte: string[]): number {
  if (leitwerte.length < 2) return 1;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");
  const uniq = new Set(leitwerte.map(norm)).size / leitwerte.length;

  const lastFamily = (s: string): string => {
    const toks = tokenize(s);
    const last = toks.length ? toks[toks.length - 1] : "";
    return SUFFIX_FAMILIES.find((f) => last.endsWith(f)) ?? last;
  };
  const counts = new Map<string, number>();
  for (const lw of leitwerte) {
    const fam = lastFamily(lw);
    counts.set(fam, (counts.get(fam) ?? 0) + 1);
  }
  const suffixSpread = 1 - Math.max(...counts.values()) / leitwerte.length;

  const sets = leitwerte.map((s) => new Set(tokenize(s)));
  let sum = 0;
  let n = 0;
  for (let i = 0; i < sets.length; i++)
    for (let j = i + 1; j < sets.length; j++) {
      sum += 1 - jaccard(sets[i], sets[j]);
      n++;
    }
  const meanDist = n ? sum / n : 1;
  return clamp01(0.4 * uniq + 0.3 * suffixSpread + 0.3 * meanDist);
}

export interface EvalCard {
  leitwert: string;
  /** the colliding worlds (or persona source), folded into the anti-cliché check. */
  world?: string;
}

export interface EngineScore {
  format: number;
  concreteness: number;
  antiCliche: number;
  distinctness: number;
  overall: number;
  n: number;
}

/** Aggregate a batch into one deterministic objective scorecard for an engine. */
export function scoreEngine(cards: EvalCard[], anti: Set<string>): EngineScore {
  const format = mean(cards.map((c) => leitwertFormat(c.leitwert)));
  const conc = mean(cards.map((c) => concreteness(c.leitwert)));
  const cliche = mean(cards.map((c) => antiCliche(`${c.leitwert} ${c.world ?? ""}`, anti)));
  const dist = distinctness(cards.map((c) => c.leitwert));
  const overall = 0.3 * format + 0.2 * conc + 0.25 * cliche + 0.25 * dist;
  return { format, concreteness: conc, antiCliche: cliche, distinctness: dist, overall, n: cards.length };
}

/**
 * Assembles the engine/judge system prompts from api/_lib/setup/*.yaml (the single tuning surface)
 * into api/_lib/setup.generated.ts. Run via `npm run setup` (also part of `npm run build`).
 *
 *   tsx scripts/build-setup.ts            # generate
 *   tsx scripts/build-setup.ts --verify   # also diff vs /tmp/prompts-snapshot.json (migration guard)
 *
 * Each method YAML maps KEY → { head, rules: [sharedRuleIds], output }. The assembled system prompt is
 * head + injected rule blocks (from _rules.yaml) + output, joined by newlines, exported as KEY_SYSTEM.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const here = dirname(fileURLToPath(import.meta.url));
const setupDir = join(here, "../api/_lib/setup");
const rules = yaml.load(readFileSync(join(setupDir, "_rules.yaml"), "utf8")) as Record<string, string>;

interface Entry {
  head?: string;
  rules?: string[];
  output?: string;
  /** The user-message template (with {ctx}/{steer}/{n}/… placeholders) — filled by gateway.fill. */
  prompt?: string;
  /** Fallback text used in place of an empty briefing. */
  blank?: string;
}

const assemble = (e: Entry): string => {
  const parts: string[] = [];
  if (e.head) parts.push(e.head.trimEnd());
  for (const r of e.rules ?? []) {
    if (!rules[r]) throw new Error(`unknown shared rule '${r}'`);
    parts.push(rules[r].trimEnd());
  }
  if (e.output) parts.push(e.output.trimEnd());
  return parts.join("\n");
};

const out: Record<string, string> = {};
for (const file of readdirSync(setupDir).sort()) {
  if (!file.endsWith(".yaml") || file.startsWith("_")) continue;
  const doc = yaml.load(readFileSync(join(setupDir, file), "utf8")) as Record<string, Entry>;
  for (const [key, entry] of Object.entries(doc)) {
    out[`${key}_SYSTEM`] = assemble(entry);
    if (entry.prompt) out[`${key}_PROMPT`] = String(entry.prompt).replace(/\n+$/, "");
    if (entry.blank) out[`${key}_BLANK`] = String(entry.blank).trim();
  }
}

const banner =
  "// AUTO-GENERATED from api/_lib/setup/*.yaml by `npm run setup` — DO NOT EDIT.\n" +
  "// Tune the prompts in the YAML, then regenerate.\n\n";
const body = Object.keys(out)
  .sort()
  .map((name) => `export const ${name} = ${JSON.stringify(out[name])};`)
  .join("\n");
writeFileSync(join(setupDir, "../setup.generated.ts"), banner + body + "\n");
console.log(`setup.generated.ts ← ${Object.keys(out).filter((k) => k.endsWith("_SYSTEM")).join(", ")}`);

if (process.argv.includes("--verify")) {
  const snapPath = "/tmp/prompts-snapshot.json";
  if (!existsSync(snapPath)) {
    console.log("(no snapshot at /tmp/prompts-snapshot.json — skipping verify)");
    process.exit(0);
  }
  const snap = JSON.parse(readFileSync(snapPath, "utf8")) as Record<string, string>;
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  let ok = true;
  for (const [k, v] of Object.entries(out)) {
    const key = `${k}_SYSTEM`;
    if (snap[key] === undefined) {
      console.log(`?  ${key}: not in snapshot`);
      continue;
    }
    if (norm(snap[key]) === norm(v)) {
      console.log(`✓  ${key}: content preserved`);
    } else {
      ok = false;
      const a = norm(snap[key]);
      const b = norm(v);
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      console.log(`✗  ${key}: DIFFERS at ~${i}`);
      console.log(`   was: …${a.slice(Math.max(0, i - 25), i + 45)}…`);
      console.log(`   now: …${b.slice(Math.max(0, i - 25), i + 45)}…`);
    }
  }
  if (!ok) process.exit(1);
}

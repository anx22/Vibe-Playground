import { z } from "zod";

/** Server-side copy of the LLM contracts (kept here so functions don't import across ../src). */

export const axisVectorSchema = z.object({
  material: z.number().min(-1).max(1),
  energy: z.number().min(-1).max(1),
  time: z.number().min(-1).max(1),
  structure: z.number().min(-1).max(1),
  density: z.number().min(-1).max(1),
  formality: z.number().min(-1).max(1),
});

export const sceneRenderSchema = z.object({
  leitwert: z.string().describe("2–3 word compound Leitwert — the compressed world-reference"),
  scene: z
    .string()
    .describe("one evocative sentence: a small inhabited world or persona that embodies the collision"),
  mood: z.string().describe("short mood modifier, 2–4 words"),
});

/** What the LLM produces for Engine B (term + connotation + axis projection). */
export const seedGenSchema = z.object({
  worlds: z.array(
    z.object({
      term: z.string(),
      connotation: z.string(),
      vector: axisVectorSchema,
    }),
  ),
});

export const personaSchema = z.object({
  persona: z.string().describe("a fictional source: person/studio/workshop in one sentence, with a Macke"),
  leitwert: z.string(),
  mood: z.string(),
  vector: axisVectorSchema,
});

/** Analogy engine: brief's functional core → a distant domain that embodies the SAME core. */
export const analogySchema = z.object({
  directions: z.array(
    z.object({
      leitwert: z.string().describe("2–3 word compound — the brand seen through the distant world"),
      world: z.string().describe("the distant reference domain (aviation, surgery, alpine safety …)"),
      core: z.string().describe("the shared functional core, short — why the far world fits exactly"),
      scene: z.string().describe("one concrete sentence set in the brand's REAL world, not the far one"),
      mood: z.string().describe("2–4 words"),
      vector: axisVectorSchema,
    }),
  ),
});

/** Quality judgement of one direction against the briefing (on-target × non-obvious). */
export const judgeSchema = z.object({
  onTarget: z.number().min(1).max(5).describe("Würde ein Senior-AD das DIESEM Kunden hinlegen? Trifft es den Kern?"),
  surprise: z.number().min(1).max(5).describe("Nicht-naheliegend — überrascht statt Branchen-Klischee?"),
  craft: z.number().min(1).max(5).describe("Ist die Szene konkret/evokativ statt generisch?"),
  note: z.string().describe("ein kurzer Satz Begründung"),
});

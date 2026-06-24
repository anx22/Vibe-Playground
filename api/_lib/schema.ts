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

/** One holistic, applicable design reading of the result's world — a consolidated
 *  Gesamtbeschreibung (NOT an atomized pattern list, NO motion). Several equivalent
 *  readings of the SAME world are offered per result. */
export const designReading = z.object({
  title: z.string().describe("kurzer Name dieser Design-Lesart, z. B. «Plakat-Takelage»"),
  description: z
    .string()
    .describe(
      "2–4 Sätze, konkrete aber als Fließtext gewobene Gesamtbeschreibung: Komposition/Layout, Typo-Geste, Farb-Einsatz, Oberfläche/Textur, Dichte. KEINE Bewegung/Motion, KEINE Stichpunkt-Aufzählung, kein Vorbauen durch Auflisten.",
    ),
});

export const personaSchema = z.object({
  persona: z.string().describe("a fictional source: person/studio/workshop in one sentence, with a Macke"),
  leitwert: z.string(),
  mood: z.string(),
  palette: z.array(z.string()).describe("3 hex colors, directional"),
  vector: axisVectorSchema,
  designs: z.array(designReading).describe("2–3 gleichwertige Design-Lesarten derselben Welt"),
});
/** Batched personas — N distinct sources in one call. */
export const personaListSchema = z.object({ personas: z.array(personaSchema) });

/** A single bridge — the shared output unit of Engine D and Engine E. */
export const bridgeShape = z.object({
  leitwert: z.string().describe("2–4 token compound — the design directive"),
  worlds: z.array(
    z.object({
      name: z.string(),
      role: z.string().describe("what this world donates"),
      rhyme: z.string().describe("how its inner logic rhymes with the essence"),
    }),
  ),
  objectMetaphor: z.string().describe("the vessel object grounding the bridge"),
  creativeDerivation: z.string().describe("1–2 sentences: WHY the rhyme holds — not a scene, not a design instruction"),
  mood: z.string(),
  palette: z.array(z.string()).describe("3 hex colors, directional"),
  vector: axisVectorSchema.describe("6-Achsen-Projektion des Ergebnisses (für Typo/Regler)"),
  designs: z.array(designReading).describe("2–3 gleichwertige Design-Lesarten derselben Welt"),
});

/** Engine F — Technique Workbench. Curated survivors of the synthesis pass. */
export const workbenchSchema = z.object({
  candidates: z.array(bridgeShape),
});

/** Engine D — Structural Entanglement. One batch: distilled essence, burnt clichés, and bridges. */
export const entangleSchema = z.object({
  essence: z.string().describe("Wirkstruktur — the topic's relational core, abstract, no surface-domain words"),
  forbidden: z.array(z.string()).describe("the burnt cliché list — hard-excluded design reflexes"),
  bridges: z.array(bridgeShape),
});

/** Quality judgement of one direction against the briefing (on-target × non-obvious). */
export const judgeSchema = z.object({
  onTarget: z.number().min(1).max(5).describe("Würde ein Senior-AD das DIESEM Kunden hinlegen? Trifft es den Kern?"),
  surprise: z.number().min(1).max(5).describe("Nicht-naheliegend — überrascht statt Branchen-Klischee?"),
  craft: z.number().min(1).max(5).describe("Ist die Szene konkret/evokativ statt generisch?"),
  designValue: z.number().min(1).max(5).describe("Ableitbarer DESIGN-Wert (Welt/Material/Stil/Stimmung), aus dem ein Bildmodell eine interessante Designwelt baut — KEINE Geschichte/Narrativ, keine nicht-ableitbare Abstraktion."),
  register: z.string().describe("Render-/Material-Register — nächstliegendes aus Metall-Industrie, Organisch-Weich, Digital-Leuchtend, Papier-Archiv, Stein-Keramik, Textil-Faser, Glas-Flüssig, Roh-Elementar (für Register-Vielfalt im Cluster)"),
  note: z.string().describe("ein kurzer Satz Begründung"),
});

/** Batched judge — score MANY directions in ONE call; scores[] aligns to the input order. */
export const judgeBatchSchema = z.object({ scores: z.array(judgeSchema) });

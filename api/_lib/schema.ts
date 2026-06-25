import { z } from "zod";

/** Server-side copy of the LLM contracts (kept here so functions don't import across ../src). */

/**
 * One result = an open "Denkanstoß-Cluster": a vivid world-opener + anchor + loose triggers.
 * NO pre-designing — this raw world-material feeds a downstream design/image AI.
 */
export const clusterSchema = z.object({
  weltSatz: z.string().describe("1–2 Sätze Kopfkino, die die Welt lebendig öffnen — sinnlich, konkret, KEINE Design-Anweisung"),
  leitwert: z.string().describe("2–4-teiliges Konkret-Kompositum — Anker und Titel des Clusters"),
  register: z.enum(["nah", "fern"]).describe("nah = premium-schön aus der eigenen Brief-Welt; fern = überraschende Kollision"),
  funde: z.array(z.string()).describe("5–7 reine visuelle Funde als KNAPPE Bild-Wendungen (~3–8 Wörter, keine Sätze) — zeichenbare Form/Struktur/Kante/Oberfläche/Licht, spezifisch + generativ; KEINE Zustände/Gefühle/Konzept-Wortspiele"),
  materialien: z.array(z.string()).describe("4–6 ECHTE Materialien/Oberflächen — keine Bauteile/Konstruktionen"),
  bildReferenzen: z.array(z.string()).describe("2–3 reale, benennbare Bild-Anker (existierende Objekte/Szenen/Artefakte) — keine „wie …\"-Poesie, keine Stile"),
});

/** Persona engine — N clusters in one call. */
export const personaListSchema = z.object({ personas: z.array(clusterSchema) });

/** Synthese engine — N clusters in one call. */
export const workbenchSchema = z.object({ candidates: z.array(clusterSchema) });

/** Quality judgement of one cluster against the briefing (on-target × non-obvious × derivable design-value). */
export const judgeSchema = z.object({
  onTarget: z.number().min(1).max(5).describe("Würde ein Senior-AD das DIESEM Kunden hinlegen? Trifft es den Kern? (nah ODER fern gültig)"),
  surprise: z.number().min(1).max(5).describe("Frisch und nicht-generisch — fern: überraschend, nah: premium-schön statt plump."),
  craft: z.number().min(1).max(5).describe("Ist der Welt-Satz konkret/sinnlich/evokativ statt generisch?"),
  formSubstanz: z.number().min(1).max(5).describe("Liefern die FUNDE zeichenbare Gestalt über mehrere Design-Achsen, aus der ein Bildmodell direkt baut? Stimmung/Abwesenheit/Wortspiel → 1–2."),
  note: z.string().describe("ein kurzer Satz Begründung"),
});

/** Batched judge — score MANY clusters in ONE call; scores[] aligns to the input order. */
export const judgeBatchSchema = z.object({ scores: z.array(judgeSchema) });

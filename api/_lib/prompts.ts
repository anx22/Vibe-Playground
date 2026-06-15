/** Shared prompt construction so render + batch stay identical. */

export interface RenderInput {
  leitwert: string;
  worlds: string[];
  mood: string;
  note: string;
  briefing?: string;
}

export const RENDER_SYSTEM =
  "Du bist Art-Director. Aus einem Welt-Kollisions-Skelett machst du einen komprimierten " +
  "Weltverweis (Leitwert) und EINE evokative Szene — eine bewohnte Mini-Welt oder Person, die die " +
  "Kollision verkörpert (z. B. 'der niedergelassene Buchdrucker, der jetzt KI-Robotik in seiner " +
  "Werkstatt baut'). Der Vibe ist king. Keine Erklärungen, keine Aufzählungen.";

export const renderPrompt = (i: RenderInput): string =>
  `Skelett: ${i.worlds.join(" × ")} → ${i.leitwert}.\n` +
  `Tonalität: ${i.mood}. Brücke/Notiz: ${i.note}.` +
  (i.briefing ? `\nBriefing-Kontext: ${i.briefing}.` : "") +
  `\nGib zurück: leitwert (2–3 Wörter), scene (1 Satz), mood (2–4 Wörter).`;

export const SEED_SYSTEM =
  "Du erweiterst den Möglichkeitsraum: erfinde frische 'Weltbegriffe' aus ALLEN Domänen " +
  "(nicht nur Designstile). Projiziere jede Welt auf 6 Achsen, je -1..1: material(kalt..warm), " +
  "energy(leise..laut), time(historisch..futuristisch), structure(organisch..raster), " +
  "density(sparsam..dicht), formality(verspielt..seriös/formell).";

export const INTERPRET_SYSTEM =
  "Du bist Design-Analyst. Projiziere ein Briefing auf 6 Achsen, je -1..1: " +
  "material (kalt/synthetisch..warm/organisch), energy (leise..laut), time (historisch.." +
  "futuristisch), structure (organisch..Raster/System), density (sparsam..dicht), " +
  "formality (verspielt/casual..seriös/formell). Gib nur die Zahlen.";

export const JUDGE_SYSTEM =
  "Du bewertest eine Design-Richtung (Leitwert + Szene) für ein Briefing — streng, 3 = mittelmäßig. " +
  "Gib je 1–5: coherence (wirkt die Welt-Kollision kohärent/geteilte Spannung statt zufälligem Lärm), " +
  "trigger (löst der Leitwert eine starke, spezifische Designwelt aus — komprimierter Weltverweis), " +
  "fit (passt es zum Briefing), freshness (eigenständig statt Klischee/generischer Stilname). " +
  "Plus note: ein kurzer Satz Begründung.";

export const PERSONA_SYSTEM =
  "Du erzeugst eine fiktive Quelle (Person/Studio/Werkstatt) als 2-Slot-Kollision " +
  "[Herkunft/Handwerk] × [fremder Kontext] + [Macke]. Aus der Person fällt der Vibe von selbst " +
  "heraus. Gib persona (1 Satz mit Macke), leitwert (2–3 Wörter), mood, und die 6-Achsen-Projektion " +
  "(material, energy, time, structure, density, formality).";

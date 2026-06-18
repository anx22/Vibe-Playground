import type { VibeCard } from "./engine";

/** Mock cards so the canvas can be rendered + screenshotted without the live LLM (dev preview only). */
const ty = {
  display: { role: "Display", name: "Nunito", family: "Nunito" },
  body: { role: "Body", name: "Nunito", family: "Nunito" },
  data: { role: "Data", name: "Nunito", family: "Nunito" },
} as VibeCard["typography"];
const v0 = { material: 0, energy: 0, time: 0, structure: 0, density: 0, formality: 0 };

let n = 0;
/** Eight render-registers cycled through the mocks so the register chips (E-065) show variety. */
const REGS = ["Metall-Industrie", "Papier-Archiv", "Organisch-Weich", "Glas-Flüssig", "Digital-Leuchtend", "Stein-Keramik", "Textil-Faser", "Roh-Elementar"];
const c = (
  source: string,
  leitwert: string,
  mood: string,
  palette: [string, string, string],
  world: string,
  taste?: string,
): VibeCard => {
  const i = n;
  return {
    id: `${source}-mock-${n++}`,
    leitwert,
    mood,
    scene: "Warum die Brücke trägt — die geteilte Struktur macht es zwingend.",
    typography: ty,
    palette,
    vector: v0,
    coherence: { sharedAxes: [], ok: true },
    source,
    origin: { home: world, intrusion: "—", object: "Logbuch", engineNote: "…" },
    quality: { onTarget: 4, surprise: 4, craft: 4, designValue: 4, overall: 4, note: "", register: REGS[i % REGS.length] },
    detail: {
      worlds: [{ name: world, role: "Spender", rhyme: "lückenlose Wachsamkeit" }],
      object: "Logbuch",
      derivation: "Beide laufen auf instrumenteller Wachsamkeit — ruhig, exakt, absolut.",
      affordances: ["matte Oberfläche", "graviert", "redundant", "Signalrhythmus", "Linsenoptik"],
      tasteDirection: taste,
    },
  };
};

export const MOCK_SEED = "Sicherheitskomponenten für Industrieanlagen, ingenieursgetrieben";

export const MOCK_CARDS: VibeCard[] = [
  c("entanglement", "Black-Box-Vigilanz", "kühl, wachsam", ["#FF7A5E", "#7a2618", "#ffd0b0"], "Flugschreiber"),
  c("entanglement", "Seilschaft-Protokoll", "geerdet, verlässlich", ["#FF6B5E", "#7a1f14", "#ffc4b0"], "Alpine Sicherung"),
  c("entanglement", "Sterilfeld-Präzision", "rein, kompromisslos", ["#FF8A6E", "#82301c", "#ffd8c4"], "OP-Sterilfeld"),
  c("entanglement", "Tresor-Logik", "verschlossen, integer", ["#F4604E", "#6e1d12", "#ffbaa6"], "Schließmechanik"),
  c("entanglement", "Schleusen-Disziplin", "kontrolliert, schwer", ["#FF7257", "#73230f", "#ffccb8"], "Schleusenwärter"),

  c("workbench", "Vigil-Schaltwerk", "exakt, gravitätisch", ["#B57BFF", "#3e1f6e", "#e6d4ff"], "Leuchtfeuer", "Kühle Autorität"),
  c("workbench", "Reinraum-Notiz", "klar, mit Bruch", ["#A86CFF", "#371a63", "#ddc8ff"], "Reinraum", "Klarheit mit Bruch"),
  c("workbench", "Gezeiten-Almanach", "geerdet, handwerklich", ["#C18CFF", "#48267d", "#ead9ff"], "Gezeitentabelle", "Geerdetes Handwerk"),
  c("workbench", "Leuchtfeuer-Kodex", "ruhig, wachsam", ["#9E5CFF", "#2f1559", "#d8c0ff"], "Leuchtturm", "Kühle Autorität"),
  c("workbench", "Werkbank-Ethik", "ehrlich, präzise", ["#B074FF", "#3a1c6b", "#e1ccff"], "Schmiede", "Geerdetes Handwerk"),

  c("latent", "Sediment-Protokoll", "fließend, organisch", ["#34D17E", "#0f5e36", "#bff2d6"], "Mangroven-Rhizom"),
  c("latent", "Schwellenschmied", "rituell, erzwungen", ["#2FC66D", "#0c5430", "#b6efce"], "Yoruba-Schmiede"),
  c("latent", "Mykel-Wächter", "verzweigt, still", ["#46D98C", "#10663c", "#c8f5dd"], "Myzel-Netz"),
  c("latent", "Wabi-Schutz", "ruhig, unperfekt", ["#3ACB7F", "#0e5d37", "#bdf0d2"], "Wabi-Sabi"),
  c("latent", "Riff-Logik", "lebendig, dicht", ["#28C16A", "#0a4f2d", "#aeecca"], "Korallenriff"),

  c("persona", "Kartograf-Synth", "präzise, elektronisch", ["#46A6FF", "#10477a", "#c4e3ff"], "Schweizer Kartograf"),
  c("persona", "Kyoto-Software", "ruhig, reduziert", ["#3F97FF", "#0e3f73", "#bcdcff"], "Buchbinderei Kyoto"),
  c("persona", "Uhrmacher-Glitch", "minutiös, gebrochen", ["#5BB0FF", "#194e85", "#cfe8ff"], "Uhrmacher-Atelier"),
  c("persona", "Schmied-Schleuse", "schwer, kontrolliert", ["#3690F2", "#0c3a6b", "#b6d8ff"], "Schmiede"),
  c("persona", "Setzer-Datenstrom", "geordnet, dicht", ["#4FA0FF", "#134a82", "#c9e2ff"], "Bleisatz-Werkstatt"),
];

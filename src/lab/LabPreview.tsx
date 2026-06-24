import "./lab.css";
import { PersonaChip, type LabPersona } from "./PersonaChip";
import { CollisionCard, type LabCollision } from "./CollisionCard";

/** Isolated component lab (#lab). Mock data, no store, no LLM — for designing the
 *  methodology-derived components piece by piece. Throwaway until ported. */

const COLLISIONS: LabCollision[] = [
  {
    leitwert: "Brennofen-Glasur",
    mood: "kühl · wachsam",
    palette: ["#e8804a", "#7a2e12", "#f4d3b0"],
    worlds: [
      { name: "Brennofen", role: "Spender", rhyme: "kontrollierte, gefährliche Hitze" },
      { name: "Sicherheitslabor", role: "Empfänger", rhyme: "null Fehlertoleranz" },
    ],
    object: "Glasur-Probe",
    derivation: "Beide leben von kontrollierter Hitze und einem Punkt, an dem nichts schiefgehen darf.",
    designs: [
      {
        title: "Glasur-Schliere",
        description:
          "Tiefes Ofen-Anthrazit als Grundfläche, durchbrochen von einer einzigen Glut-Orange-Schliere, die wie eine Glasur über eine Sektion läuft. Schwere Display-Grotesk, viel Schwarzraum, ein körniger Matt-Overlay statt glatter Flächen.",
      },
      {
        title: "Prüfprotokoll",
        description:
          "Nüchtern, laborklar: enges Datenraster, dünne Haarlinien, Messziffern in Monospace. Farbe nur als schmaler Status-Balken am Rand — Vertrauen aus Strenge, kein Dekor.",
      },
    ],
  },
  {
    leitwert: "Tidenhub-Schlick",
    mood: "weich · zyklisch",
    palette: ["#6b7a5a", "#262b1e", "#cdd2bf"],
    worlds: [
      { name: "Wattenmeer", role: "Spender", rhyme: "zyklische Freigabe" },
      { name: "Daten-Backup", role: "Empfänger", rhyme: "rhythmische Sicherung" },
    ],
    object: "Schlick-Kern",
    derivation: "Beide geben in festem Takt frei und sichern, was das nächste Hoch verschluckt.",
    designs: [
      {
        title: "Wattlinien",
        description:
          "Horizontale Schicht-Bänder in gedämpftem Schlick-Grün und Sand, wie Sediment-Lagen übereinander. Weiche Serif für Überschriften, großzügige Ränder, Flächen mit feiner Faser-Textur.",
      },
      {
        title: "Pegel-Raster",
        description:
          "Strenges Baseline-Raster wie eine Gezeitentabelle: große Zahlenwerte, dichte Zeilen, ruhiges Off-White. Ein einzelner Petrol-Akzent markiert den aktuellen Stand.",
      },
    ],
  },
];

const PERSONAS: LabPersona[] = [
  {
    leitwert: "Kartograf-Synth",
    source: "pensionierter Schweizer Kartograf",
    persona: "Ein pensionierter Schweizer Kartograf, der jetzt Synthesizer-Module baut — Höhenlinien werden zu Wellenformen.",
    mood: "präzise · elektronisch",
    palette: ["#46a6ff", "#10477a", "#c4e3ff"],
    designs: [
      {
        title: "Höhenlinien-Patch",
        description:
          "See-Blau-Grund mit feinen weißen Höhenlinien als durchgehendes Hintergrundmuster; modulare Karten sitzen wie Patch-Felder darauf. Neo-Grotesk mit echten Messziffern, gebürstetes Messing als Akzentfläche.",
      },
      {
        title: "Pegel-Tafel",
        description:
          "Reduzierte Mess-Ästhetik: dünne Skalenstriche an den Rändern, Pegel-Weiß auf tiefem Marineblau, große Zahlen als Hauptelement. Sachlich, instrumentell, ohne Zierde.",
      },
    ],
  },
  {
    leitwert: "Tunnel-Leuchtflora",
    source: "gestrandeter Alien-Botaniker",
    persona: "Ein gestrandeter Alien-Botaniker, der in einem U-Bahn-Tunnel Leuchtflora züchtet.",
    mood: "feucht · leuchtend",
    palette: ["#2fd4a6", "#10302e", "#caa8ff"],
    designs: [
      {
        title: "Biolumineszenz",
        description:
          "Fast schwarzes Tunnel-Grün als Bühne, auf der biolumineszente Mint- und Violett-Akzente wie Pflanzen aus dem Dunkel leuchten. Organische Sans, weiche Radien, ein feuchter Glanz auf wenigen Flächen.",
      },
      {
        title: "Beet-Kacheln",
        description:
          "Inhalt in kachelförmigen Beeten entlang einer mittigen Röhren-Achse; viel Negativraum, schwaches Innen-Glühen an den Kanten. Ruhig, dicht bepflanzt nur dort, wo es zählt.",
      },
    ],
  },
  {
    leitwert: "Uhrwerk-Falter",
    source: "Schmetterling aus Uhrwerk-Teilen",
    persona: "Ein Schmetterling aus Uhrwerk-Teilen, der Staub statt Pollen sammelt.",
    mood: "fein · tickend",
    palette: ["#c79a4e", "#3a2c18", "#ece0c2"],
    designs: [
      {
        title: "Flügel-Symmetrie",
        description:
          "Streng spiegelsymmetrisches Layout um eine Mittelachse, wie aufgespannte Flügel; feine Serife mit Zahnrad-Anmutung, gebläutes Messing-Gold auf Staubgrau, haarfeine Trennlinien.",
      },
      {
        title: "Staub-Patina",
        description:
          "Warme, leicht vergilbte Flächen mit feiner Staub-Körnung, als läge Patina über allem. Kleine, präzise gesetzte Typo, viel Ruhe, ein einzelnes glänzendes Detail pro Sektion.",
      },
    ],
  },
];

export default function LabPreview() {
  return (
    <div className="lab">
      <div className="lab-head">Komponenten-Lab · Persona — Line-Art im Kreis-Medaillon, Trenner radial (Mock)</div>
      {PERSONAS.map((p, i) => <PersonaChip key={i} p={p} />)}

      <div className="lab-head" style={{ marginTop: 14 }}>Komponenten-Lab · Synthese-Kollisions-Karte — zwei aufgerissene Welten (Mock)</div>
      {COLLISIONS.map((c, i) => <CollisionCard key={i} c={c} />)}
    </div>
  );
}

import "./lab.css";
import { PersonaChip, type LabPersona } from "./PersonaChip";

/** Isolated component lab (#lab). Mock data, no store, no LLM — for designing the
 *  methodology-derived components piece by piece. Throwaway until ported. */

const PERSONAS: LabPersona[] = [
  {
    leitwert: "Kartograf-Synth",
    source: "pensionierter Schweizer Kartograf",
    persona: "Ein pensionierter Schweizer Kartograf, der jetzt Synthesizer-Module baut — Höhenlinien werden zu Wellenformen.",
    mood: "präzise · elektronisch",
    palette: ["#46a6ff", "#10477a", "#c4e3ff"],
    typo: "Neo-Grotesk mit Messziffern",
    layout: "Höhenlinien-Raster, modulare Patchfelder",
    elements: [
      { layer: "Material", element: "gebürstetes Messing, gravierte Skalen" },
      { layer: "Form", element: "Höhenlinie wird Wellenform" },
      { layer: "Farbe", element: "See-Blau, Pegel-Weiß" },
    ],
  },
  {
    leitwert: "Tunnel-Leuchtflora",
    source: "gestrandeter Alien-Botaniker",
    persona: "Ein gestrandeter Alien-Botaniker, der in einem U-Bahn-Tunnel Leuchtflora züchtet.",
    mood: "feucht · leuchtend",
    palette: ["#2fd4a6", "#10302e", "#caa8ff"],
    typo: "organische Sans mit Sporen-Punkten",
    layout: "Kachel-Beete entlang der Tunnelröhre",
    elements: [
      { layer: "Material", element: "feuchter Beton, biolumineszenter Film" },
      { layer: "Form", element: "Tunnelröhren-Bogen" },
      { layer: "Bewegung", element: "langsames Pulsieren der Flora" },
    ],
  },
  {
    leitwert: "Uhrwerk-Falter",
    source: "Schmetterling aus Uhrwerk-Teilen",
    persona: "Ein Schmetterling aus Uhrwerk-Teilen, der Staub statt Pollen sammelt.",
    mood: "fein · tickend",
    palette: ["#c79a4e", "#3a2c18", "#ece0c2"],
    typo: "feine Serife mit Zahnrad-Anmutung",
    layout: "symmetrische Flügel-Spiegelung",
    elements: [
      { layer: "Material", element: "gebläutes Uhrwerk, Staubpatina" },
      { layer: "Form", element: "Flügel aus Zahnrädern" },
      { layer: "Farbe", element: "Messing-Gold, Staubgrau" },
    ],
  },
];

export default function LabPreview() {
  return (
    <div className="lab">
      <div className="lab-head">Komponenten-Lab · Persona-Multichip (Mock)</div>
      {PERSONAS.map((p, i) => <PersonaChip key={i} p={p} />)}
    </div>
  );
}

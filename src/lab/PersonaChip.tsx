import "./lab.css";

/**
 * Persona-Multichip — the bespoke component for the Persona methodology.
 * A persona IS a figure (source + visible contradiction); the component renders
 * that figure: name, the one-sentence story, its "belongings" (the extracted
 * design elements as tactile sub-chips), and its handwriting (typo/layout).
 */
export type LabPersona = {
  leitwert: string;
  source: string; // short type label of the figure
  persona: string; // the one sentence: source + contradiction
  mood: string;
  palette: [string, string, string];
  typo: string;
  layout: string;
  elements: { layer: string; element: string }[];
};

export function PersonaChip({ p }: { p: LabPersona }) {
  return (
    <article className="pchip">
      <div className="pchip-pal">{p.palette.map((c, i) => <span key={i} style={{ background: c }} />)}</div>
      <div className="pchip-in">
        <div className="pchip-tagrow">
          <span className="pchip-kind">Persona · {p.source}</span>
          <span className="pchip-mood">{p.mood}</span>
        </div>
        <div className="pchip-name">{p.leitwert}</div>

        <div className="pchip-story">
          <span className="tab">Die Figur</span>
          <p>{p.persona}</p>
        </div>

        <div className="pchip-seclabel">Habseligkeiten</div>
        <div className="pchip-els">
          {p.elements.map((e, i) => (
            <div key={i} className="mchip"><b>{e.layer}</b><span>{e.element}</span></div>
          ))}
        </div>

        <div className="pchip-hand"><b>Handschrift:</b> {p.typo} · {p.layout}</div>
      </div>
    </article>
  );
}

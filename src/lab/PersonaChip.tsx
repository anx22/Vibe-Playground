import "./lab.css";

/**
 * Persona-Multichip — bespoke component for the Persona methodology.
 * The figure sits in the CENTER; angled dashed lines split the stage into
 * four pieces, and each piece holds one persona zone (Kopf/Körper/Hände/Stand).
 */
export type LabPersona = {
  leitwert: string;
  source: string;
  persona: string;
  mood: string;
  palette: [string, string, string];
  typo: string;
  layout: string;
  elements: { layer: string; element: string }[];
};

export function PersonaChip({ p }: { p: LabPersona }) {
  const byLayer = (l: string) => p.elements.find((e) => e.layer.toLowerCase().startsWith(l))?.element;
  const seg = {
    n: p.mood,
    e: byLayer("form"),
    s: byLayer("bewegung") ?? byLayer("farbe"),
    w: byLayer("material"),
  };
  return (
    <article className="pchip">
      <div className="pal-line">{p.palette.map((c, i) => <span key={i} style={{ background: c }} />)}</div>
      <div className="pchip-in">
        <div className="pchip-head">
          <span className="kind">Persona · {p.source}</span>
          <span className="bigname">{p.leitwert}</span>
        </div>

        <div className="pstage">
          <svg className="pdiv" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="0" x2="50" y2="50" />
            <line x1="100" y1="0" x2="50" y2="50" />
            <line x1="100" y1="100" x2="50" y2="50" />
            <line x1="0" y1="100" x2="50" y2="50" />
          </svg>
          <div className="pfigwrap">
            <svg className="pfig-min" viewBox="0 0 76 112" aria-hidden="true" style={{ stroke: p.palette[1] }}>
              <circle cx="38" cy="16" r="9" />
              <path d="M38 25 V60" />
              <path d="M19 52 Q25 34 38 33 Q51 34 57 52" />
              <path d="M27 96 Q30 70 38 60 Q46 70 49 96" />
            </svg>
          </div>
          {seg.n && <div className="pseg pseg--n"><span className="pseg-part">Kopf · Mood</span><span className="pseg-text">{seg.n}</span></div>}
          {seg.e && <div className="pseg pseg--e"><span className="pseg-part">Körper · Form</span><span className="pseg-text">{seg.e}</span></div>}
          {seg.s && <div className="pseg pseg--s"><span className="pseg-part">Stand · Bewegung</span><span className="pseg-text">{seg.s}</span></div>}
          {seg.w && <div className="pseg pseg--w"><span className="pseg-part">Hände · Material</span><span className="pseg-text">{seg.w}</span></div>}
        </div>

        <div className="pchip-story"><span className="tab">Die Figur</span><p>{p.persona}</p></div>
        <div className="pchip-hand"><b>Handschrift:</b> {p.typo} · {p.layout}</div>
      </div>
    </article>
  );
}

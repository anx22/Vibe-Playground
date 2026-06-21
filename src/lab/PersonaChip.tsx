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
          <svg className="pstage-svg" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
            <line className="spoke" x1="202" y1="202" x2="300" y2="300" />
            <line className="spoke" x1="98" y1="202" x2="0" y2="300" />
            <line className="spoke" x1="98" y1="98" x2="0" y2="0" />
            <line className="spoke" x1="202" y1="98" x2="300" y2="0" />
            <circle className="medallion" cx="150" cy="150" r="74" style={{ stroke: p.palette[1] }} />
            <g className="bust" style={{ stroke: p.palette[1] }}>
              <ellipse cx="150" cy="124" rx="20" ry="23" />
              <path d="M143 146 V155" />
              <path d="M157 146 V155" />
              <path d="M114 196 Q117 162 150 157 Q183 162 186 196" />
            </g>
          </svg>
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

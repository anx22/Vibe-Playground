import "./lab.css";

/**
 * Persona-Multichip — the bespoke component for the Persona methodology.
 * A persona IS a figure, so the component leads with a big stylized PERSON.
 * Its body-zones stand for the persona's zones: head = idea/mood, torso = form,
 * hands = material, stance = motion — colour-linked between figure and labels.
 * The one-sentence story + handwriting (typo/layout) ground it.
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
  const zones = [
    { part: "Kopf · Idee", color: "var(--accent)", text: p.mood },
    { part: "Körper · Form", color: p.palette[1], text: byLayer("form") },
    { part: "Hände · Material", color: p.palette[0], text: byLayer("material") },
    { part: "Stand · Bewegung", color: p.palette[2], text: byLayer("bewegung") ?? byLayer("farbe") },
  ].filter((z) => z.text);

  return (
    <article className="pchip">
      <div className="pchip-pal">{p.palette.map((c, i) => <span key={i} style={{ background: c }} />)}</div>
      <div className="pchip-in">
        <div className="pchip-tagrow">
          <span className="pchip-kind">Persona · {p.source}</span>
          <span className="pchip-mood">{p.mood}</span>
        </div>
        <div className="pchip-name">{p.leitwert}</div>

        <div className="pchip-body">
          <svg className="pfig" viewBox="0 0 110 160" aria-hidden="true">
            <rect x="38" y="104" width="15" height="50" rx="7" fill={p.palette[2]} />
            <rect x="57" y="104" width="15" height="50" rx="7" fill={p.palette[2]} />
            <rect x="15" y="54" width="15" height="48" rx="7" fill={p.palette[0]} />
            <rect x="80" y="54" width="15" height="48" rx="7" fill={p.palette[0]} />
            <rect x="33" y="48" width="44" height="60" rx="16" fill={p.palette[1]} />
            <circle className="head" cx="55" cy="28" r="19" />
          </svg>
          <div className="pchip-zones">
            {zones.map((z, i) => (
              <div key={i} className="pzone">
                <span className="pzone-dot" style={{ background: z.color }} />
                <span style={{ minWidth: 0 }}>
                  <span className="pzone-part">{z.part}</span>
                  <span className="pzone-text">{z.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pchip-story">
          <span className="tab">Die Figur</span>
          <p>{p.persona}</p>
        </div>
        <div className="pchip-hand"><b>Handschrift:</b> {p.typo} · {p.layout}</div>
      </div>
    </article>
  );
}

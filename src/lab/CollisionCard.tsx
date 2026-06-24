import "./lab.css";

/**
 * Synthese-Kollisions-Karte — bespoke component for the Synthese methodology.
 * Two far worlds torn apart, clamped in the middle by the rhyme + grounding
 * object. Soft/modern styling. The derivation says why it holds.
 */
export type LabCollision = {
  leitwert: string;
  mood: string;
  palette: [string, string, string];
  worlds: { name: string; role: string; rhyme: string }[];
  object: string;
  derivation: string;
  designs: { title: string; description: string }[];
};

export function CollisionCard({ c }: { c: LabCollision }) {
  const [a, b] = c.worlds;
  return (
    <article className="coll">
      <div className="pal-line">{c.palette.map((p, i) => <span key={i} style={{ background: p }} />)}</div>
      <div className="coll-in">
        <div className="coll-head">
          <span className="kind">Kollision</span>
          <span className="coll-mood soft-tag">{c.mood}</span>
        </div>
        <div className="bigname">{c.leitwert}</div>

        <div className="coll-bridge">
          <div className="world world--a">
            <div className="world-role">{a.role}</div>
            <div className="world-name">{a.name}</div>
            <div className="world-rhyme">reimt: <b>{a.rhyme}</b></div>
          </div>
          <div className="joint">
            <div className="joint-label">↔ Reim ↔</div>
            <div className="joint-obj">{c.object}</div>
            <div className="joint-sub">erdet beide</div>
          </div>
          <div className="world world--b">
            <div className="world-role">{b.role}</div>
            <div className="world-name">{b.name}</div>
            <div className="world-rhyme">reimt: <b>{b.rhyme}</b></div>
          </div>
        </div>

        {c.designs.length > 0 && (
          <div className="designs">
            <span className="tab">Denkbare Designs</span>
            {c.designs.map((d, i) => (
              <div className="design" key={i}>
                <div className="design-title">{d.title}</div>
                <p className="design-desc">{d.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="coll-foot">
          <div className="coll-sw">{c.palette.map((p, i) => <span key={i} style={{ background: p }} />)}</div>
        </div>
      </div>
    </article>
  );
}

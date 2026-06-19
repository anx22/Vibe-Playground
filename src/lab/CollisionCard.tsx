import "./lab.css";

/**
 * Synthese-Kollisions-Karte — bespoke component for the Synthese methodology.
 * Two far worlds torn apart, clamped in the middle by the rhyme + grounding
 * object. Soft/modern styling. The derivation says why it holds.
 */
export type LabCollision = {
  leitwert: string;
  distance: string;
  mood: string;
  palette: [string, string, string];
  worlds: { name: string; role: string; rhyme: string }[];
  object: string;
  derivation: string;
  taste: string;
  comfort: string;
};

export function CollisionCard({ c }: { c: LabCollision }) {
  const [a, b] = c.worlds;
  return (
    <article className="coll">
      <div className="pal-line">{c.palette.map((p, i) => <span key={i} style={{ background: p }} />)}</div>
      <div className="coll-in">
        <div className="coll-head">
          <span className="kind">Kollision · Distanz {c.distance}</span>
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

        <div className="coll-why"><span className="tab">Warum es trägt</span><p>{c.derivation}</p></div>

        <div className="coll-foot">
          <div className="coll-sw">{c.palette.map((p, i) => <span key={i} style={{ background: p }} />)}</div>
          <span className="soft-tag">{c.taste}</span>
          <span className="soft-tag">Komfort: {c.comfort}</span>
        </div>
      </div>
    </article>
  );
}

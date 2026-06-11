import type { CSSProperties } from "react";
import type { AxisVector, VibeCard as Card } from "../engine";
import { AXES, dist } from "../engine";
import { Collapser } from "./Collapser";

function indicator(card: Card, centroid: AxisVector): { label: string; level: number } {
  const d = dist(card.vector, centroid);
  if (d < 0.45) return { label: "im Fokus", level: 3 };
  if (d < 0.9) return { label: "nah", level: 2 };
  return { label: "fern", level: 1 };
}

export function VibeCard({
  card,
  centroid,
  focused,
  committed,
  onAttract,
  onRepel,
  onCommit,
}: {
  card: Card;
  centroid: AxisVector;
  focused: boolean;
  committed: boolean;
  onAttract: () => void;
  onRepel: () => void;
  onCommit: () => void;
}) {
  const [base, ink, accent] = card.palette;
  const ind = indicator(card, centroid);

  return (
    <article
      className={`card${focused ? " card--focused" : ""}`}
      style={{ "--card-accent": accent } as CSSProperties}
    >
      <header className="card-top">
        <span className={`coh${card.coherence.ok ? " coh--ok" : ""}`} title="Bridge-Regel" />
        <span className={`indicator indicator--${ind.level}`}>{ind.label}</span>
      </header>

      <h2 className="leitwert" style={{ fontFamily: card.typography.display.family }}>
        {card.leitwert}
      </h2>
      <p className="mood" style={{ fontFamily: card.typography.data.family }}>
        {card.mood}
      </p>

      {card.scene && (
        <p className="scene" style={{ fontFamily: card.typography.body.family }}>
          {card.scene}
        </p>
      )}

      <div className="palette">
        {([base, ink, accent] as const).map((c, i) => (
          <span className="swatch" key={i} style={{ background: c }} title={c} />
        ))}
      </div>

      <Collapser label="Details">
        <div className="trio">
          {(["display", "body", "data"] as const).map((role) => {
            const t = card.typography[role];
            return (
              <div className="trio-row" key={role}>
                <span className="trio-sample" style={{ fontFamily: t.family }}>
                  Ag
                </span>
                <span className="trio-meta">
                  <span className="trio-name" style={{ fontFamily: t.family }}>
                    {t.name}
                  </span>
                  <span className="trio-role">{t.role}</span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="origin-line">
          {card.origin.home} <span className="x">×</span> {card.origin.intrusion}{" "}
          <span className="arrow">→</span> {card.origin.object}
        </p>
        <p className="origin-note">{card.origin.engineNote}</p>
        <div className="vecmini">
          {AXES.map((ax) => (
            <span className="vecmini-axis" key={ax}>
              <span className="vecmini-key">{ax.slice(0, 4)}</span>
              <span className="vecmini-bar">
                <span
                  className="vecmini-dot"
                  style={{ left: `${((card.vector[ax] + 1) / 2) * 100}%` }}
                />
              </span>
            </span>
          ))}
        </div>
      </Collapser>

      <footer className="magnets">
        <button type="button" className="magnet magnet--minus" onClick={onRepel}>
          Abstoßen −
        </button>
        <button
          type="button"
          className={`magnet magnet--commit${committed ? " is-committed" : ""}`}
          onClick={onCommit}
        >
          {committed ? "✓ Committed" : "Commit ★"}
        </button>
        <button type="button" className="magnet magnet--plus" onClick={onAttract}>
          Anziehen +
        </button>
      </footer>
    </article>
  );
}

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
  onExport,
}: {
  card: Card;
  centroid: AxisVector;
  focused: boolean;
  committed: boolean;
  onAttract: () => void;
  onRepel: () => void;
  onCommit: () => void;
  onExport: () => void;
}) {
  const [base, ink, accent] = card.palette;
  const ind = indicator(card, centroid);

  return (
    <article
      className={`card${focused ? " card--focused" : ""}`}
      style={{ "--card-accent": accent } as CSSProperties}
    >
      <header className="card-top">
        {card.quality ? (
          <span
            className="qscore"
            title={`LLM-Bewertung ${card.quality.overall.toFixed(1)}/5 · ${card.quality.note}`}
          >
            {card.quality.overall.toFixed(1)}
          </span>
        ) : (
          <span className={`coh${card.coherence.ok ? " coh--ok" : ""}`} title="Bridge-Regel" />
        )}
        <span className="card-top-right">
          <span className={`indicator indicator--${ind.level}`}>{ind.label}</span>
          <button className="card-export" type="button" onClick={onExport} title="Als Prompt exportieren">
            ⤓
          </button>
        </span>
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
        {card.quality && (
          <p className="qbreak">
            Kohärenz {card.quality.coherence} · Trigger {card.quality.trigger} · Fit{" "}
            {card.quality.fit} · Frische {card.quality.freshness}
            <br />
            <span className="qnote">{card.quality.note}</span>
          </p>
        )}
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
          Weniger so
        </button>
        <button
          type="button"
          className={`magnet magnet--commit${committed ? " is-committed" : ""}`}
          onClick={onCommit}
        >
          {committed ? "✓ Gemerkt" : "Merken ★"}
        </button>
        <button type="button" className="magnet magnet--plus" onClick={onAttract}>
          Mehr so
        </button>
      </footer>
    </article>
  );
}

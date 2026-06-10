import { useEffect, useMemo, type CSSProperties } from "react";
import { useVibeStore } from "./store/useVibeStore";
import { Pentagon } from "./components/Pentagon";
import { VibeCard } from "./components/VibeCard";
import { Tacho } from "./components/Tacho";
import { Lab } from "./components/Lab";

const DEFAULT_ACCENT = "#E86A4B";

export default function App() {
  const s = useVibeStore();

  const focusedCard = useMemo(
    () => s.cards.find((c) => c.id === s.focusId) ?? s.library.find((c) => c.id === s.focusId),
    [s.cards, s.library, s.focusId],
  );

  // Accent inherits live from the focused direction (E-019).
  useEffect(() => {
    const accent = focusedCard?.palette[2] ?? DEFAULT_ACCENT;
    document.documentElement.style.setProperty("--accent", accent);
  }, [focusedCard]);

  const tacho = Math.min(100, s.commits * 22 + s.signals.length * 4);

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={s.reset} type="button">
          <span className="brand-dot" />
          Vibe Playground
        </button>
        <div className="topbar-right">
          <div className="view-toggle">
            <button
              type="button"
              className={s.view === "studio" ? "is-active" : ""}
              onClick={() => s.setView("studio")}
            >
              Studio
            </button>
            <button
              type="button"
              className={s.view === "lab" ? "is-active" : ""}
              onClick={() => s.setView("lab")}
            >
              Lab
            </button>
          </div>
          <span className="streak" title="Tage am Viben">
            <span className="streak-flame">✺</span> 1
          </span>
          <Tacho value={tacho} />
        </div>
      </header>

      {s.view === "lab" ? (
        <Lab />
      ) : (
      <main className="stage">
        <Pentagon vector={s.centroid} spread={s.spread} idle={s.phase === "blank"} />

        {s.phase === "blank" ? (
          <div className="seedbar">
            <input
              className="seed-input"
              placeholder="Briefing: Idee, Produkt, Richtung – oder leg blank los"
              value={s.seed}
              onChange={(e) => s.setSeed(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && s.explore()}
            />
            <button className="btn btn-primary" type="button" onClick={s.explore}>
              Explore
            </button>
          </div>
        ) : (
          <>
            {s.loading && s.cards.length === 0 ? (
              <p className="rendering">Vibes werden gerendert…</p>
            ) : (
              <div className="batch">
                {s.cards.map((c) => (
                  <VibeCard
                    key={c.id}
                    card={c}
                    centroid={s.centroid}
                    focused={c.id === s.focusId}
                    committed={s.library.some((l) => l.id === c.id)}
                    onAttract={() => s.attract(c)}
                    onRepel={() => s.repel(c)}
                    onCommit={() => s.commit(c)}
                  />
                ))}
              </div>
            )}
            <div className="footer-actions">
              <button className="btn btn-ghost" type="button" onClick={s.reset}>
                Neu starten
              </button>
              <button
                className="btn btn-iterate"
                type="button"
                onClick={s.iterate}
                disabled={s.loading}
              >
                {s.loading ? "Rendert…" : "Iterate ↻"}
              </button>
            </div>
          </>
        )}
      </main>
      )}

      {s.view === "studio" && s.library.length > 0 && (
        <aside className="library-drawer">
          <div className="lib-head">Library · {s.library.length}</div>
          <div className="lib-list">
            {s.library.map((c) => (
              <button
                key={c.id}
                type="button"
                className="lib-item"
                onClick={() => s.focus(c.id)}
                style={{ "--card-accent": c.palette[2] } as CSSProperties}
              >
                <span className="lib-swatch" style={{ background: c.palette[2] }} />
                <span className="lib-name" style={{ fontFamily: c.typography.display.family }}>
                  {c.leitwert}
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

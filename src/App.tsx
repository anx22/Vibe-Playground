import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { VibeCard as Card } from "./engine";
import { useVibeStore } from "./store/useVibeStore";
import { Pentagon } from "./components/Pentagon";
import { VibeCard } from "./components/VibeCard";
import { Tacho } from "./components/Tacho";
import { Lab } from "./components/Lab";
import { ExportModal } from "./components/ExportModal";

const DEFAULT_ACCENT = "#E86A4B";

export default function App() {
  const s = useVibeStore();
  const [libOpen, setLibOpen] = useState(false);
  const [exportCard, setExportCard] = useState<Card | null>(null);

  const focusedCard = useMemo(
    () => s.cards.find((c) => c.id === s.focusId) ?? s.library.find((c) => c.id === s.focusId),
    [s.cards, s.library, s.focusId],
  );

  // Accent inherits live from the focused direction (E-019).
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      focusedCard?.palette[2] ?? DEFAULT_ACCENT,
    );
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
      ) : s.phase === "blank" ? (
        <main className="stage">
          <Pentagon vector={s.centroid} spread={s.spread} idle />
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
        </main>
      ) : (
        <div className="studio">
          <aside className="studio-rail">
            <Pentagon vector={s.centroid} spread={s.spread} idle={false} size={208} />
            <input
              className="seed-input seed-input--rail"
              placeholder="Briefing verfeinern…"
              value={s.seed}
              onChange={(e) => s.setSeed(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && s.iterate()}
            />
            <button
              className="btn btn-iterate"
              type="button"
              onClick={s.iterate}
              disabled={s.loading}
            >
              {s.loading ? "Rendert…" : "Iterate ↻"}
            </button>
            <div className="rail-row">
              <button className="btn btn-ghost btn-sm" type="button" onClick={s.reset}>
                Neu
              </button>
              <button
                className={`btn btn-ghost btn-sm${libOpen ? " is-active" : ""}`}
                type="button"
                onClick={() => setLibOpen((o) => !o)}
              >
                Library · {s.library.length}
              </button>
            </div>
          </aside>

          <main className="studio-main">
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
                    onExport={() => setExportCard(c)}
                  />
                ))}
              </div>
            )}
          </main>

          {libOpen && (
            <aside className="library-panel">
              <div className="lib-head">Library · {s.library.length}</div>
              <div className="lib-list">
                {s.library.length === 0 ? (
                  <p className="lib-empty">Noch nichts committed. Drück ★ auf einer Card.</p>
                ) : (
                  s.library.map((c) => (
                    <div
                      key={c.id}
                      className="lib-item"
                      style={{ "--card-accent": c.palette[2] } as CSSProperties}
                    >
                      <button
                        type="button"
                        className="lib-item-main"
                        onClick={() => s.focus(c.id)}
                      >
                        <span className="lib-swatch" style={{ background: c.palette[2] }} />
                        <span
                          className="lib-name"
                          style={{ fontFamily: c.typography.display.family }}
                        >
                          {c.leitwert}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="lib-export"
                        onClick={() => setExportCard(c)}
                        title="Als Prompt exportieren"
                      >
                        ⤓
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}
        </div>
      )}

      {exportCard && <ExportModal card={exportCard} onClose={() => setExportCard(null)} />}
    </div>
  );
}

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { VibeCard as Card } from "./engine";
import { useVibeStore } from "./store/useVibeStore";
import { Pentagon } from "./components/Pentagon";
import { VibeCard } from "./components/VibeCard";
import { Tacho } from "./components/Tacho";
import { ExportModal } from "./components/ExportModal";
import { AdvancedPanel } from "./components/AdvancedPanel";

const DEFAULT_ACCENT = "#E86A4B";

export default function App() {
  const s = useVibeStore();
  const [libOpen, setLibOpen] = useState(false);
  const [exportCard, setExportCard] = useState<Card | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Re-arm the rate-limit banner once a render succeeds again.
  useEffect(() => {
    if (!s.llmFallback) setBannerDismissed(false);
  }, [s.llmFallback]);

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
          <Tacho value={tacho} />
        </div>
      </header>

      {s.phase === "studio" && s.llmFallback && !bannerDismissed && (
        <div className="ratelimit-banner">
          <span>
            Rate-Limit oder kein Gateway — gerade <b>kein Ergebnis</b>. Später erneut iterieren.
          </span>
          <a
            className="rl-link"
            href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dtop-up"
            target="_blank"
            rel="noreferrer"
          >
            Credits aufladen ↗
          </a>
          <button className="rl-x" type="button" onClick={() => setBannerDismissed(true)} aria-label="schließen">
            ✕
          </button>
        </div>
      )}

      {s.phase === "blank" ? (
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
            {s.advanced && (
              <AdvancedPanel
                mode={s.mode}
                tension={s.tension}
                onMode={s.setMode}
                onTension={s.setTension}
              />
            )}
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

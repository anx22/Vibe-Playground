import { useEffect, useState } from "react";
import type { VibeCard as Card } from "./engine";
import { useVibeStore, MAX_ANCHORS } from "./store/useVibeStore";
import { Constellation } from "./components/Constellation";
import { ExportModal } from "./components/ExportModal";

export default function App() {
  const s = useVibeStore();
  const [exportCard, setExportCard] = useState<Card | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (!s.llmFallback) setBannerDismissed(false);
  }, [s.llmFallback]);

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={s.reset} type="button">
          <span className="brand-dot" />
          Vibe Playground
        </button>
        {s.phase === "studio" && (
          <div className="topbar-right">
            <span className="gen-badge">Welle {s.generation}</span>
            <span className="anchor-badge">★ {s.anchors.length}/{MAX_ANCHORS}</span>
            <button className="btn btn-iterate" type="button" onClick={s.iterate} disabled={s.loading}>
              {s.loading ? "Leitet ab…" : s.anchors.length ? "Aus Ankern ableiten ↻" : "Iterieren ↻"}
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={s.reset}>Neu</button>
          </div>
        )}
      </header>

      {s.phase === "studio" && s.llmFallback && !bannerDismissed && (
        <div className="ratelimit-banner">
          <span>Rate-Limit oder kein Gateway — gerade <b>kein Ergebnis</b>. Gleich erneut ableiten.</span>
          <a className="rl-link" href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dtop-up" target="_blank" rel="noreferrer">Credits aufladen ↗</a>
          <button className="rl-x" type="button" onClick={() => setBannerDismissed(true)} aria-label="schließen">✕</button>
        </div>
      )}

      {s.phase === "blank" ? (
        <main className="stage">
          <div className="stage-hero">
            <h1 className="stage-title">Eine Idee rein.<br />Ein Feld aus Richtungen raus.</h1>
            <div className="seedbar">
              <input
                className="seed-input"
                placeholder="Briefing: Idee, Produkt, Thema – oder leg blank los"
                value={s.seed}
                onChange={(e) => s.setSeed(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && s.explore()}
                autoFocus
              />
              <button className="btn btn-primary" type="button" onClick={s.explore} disabled={s.loading}>
                {s.loading ? "Entsteht…" : "Explore"}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <Constellation onExport={setExportCard} />
      )}

      {exportCard && <ExportModal card={exportCard} onClose={() => setExportCard(null)} />}
    </div>
  );
}

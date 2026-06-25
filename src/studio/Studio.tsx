import "./studio.css";
import "../lab/lab.css";
import type { CSSProperties } from "react";
import { SOURCES, useVibeStore } from "../store/useVibeStore";
import { ClusterCard } from "../lab/ClusterCard";

/**
 * Studio — the methodology board: one parallel lane per engine, each rendering its
 * Denkanstoß-Cluster as a clean, copyable card. Fed by the real store.
 */
export function Studio() {
  const cards = useVibeStore((s) => s.cards);
  const pending = useVibeStore((s) => s.pendingSources);

  return (
    <div className="studio-field">
      {SOURCES.map((src) => {
        const group = cards.filter((c) => c.source === src.id);
        const loading = pending.includes(src.id);
        return (
          <section className="lane" key={src.id} style={{ ["--accent" as string]: src.accent } as CSSProperties}>
            <header className="lane-head">
              <span className="lane-dot" />
              <span className="lane-title">{src.label}</span>
              <span className="lane-count">{loading ? "läuft…" : group.length}</span>
            </header>
            <div className="lane-cards">
              {group.length === 0 && !loading && <div className="lane-empty">— diese Runde dünn</div>}
              {group.map((c) => (
                <ClusterCard key={c.id} card={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

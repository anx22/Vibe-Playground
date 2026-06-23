import "./studio.css";
import "../lab/lab.css";
import type { CSSProperties } from "react";
import { SOURCES, useVibeStore } from "../store/useVibeStore";
import { CollisionCard } from "../lab/CollisionCard";
import { PersonaChip } from "../lab/PersonaChip";
import { cardToCollision, cardToPersona } from "./adapters";

/**
 * Studio — the methodology-derived board: one parallel lane per engine, each
 * rendering its OWN component language (Synthese → Kollisions-Karten,
 * Persona → Persona-Medaillons). Fed by the real store.
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
              {group.map((c) =>
                src.id === "persona" ? (
                  <PersonaChip key={c.id} p={cardToPersona(c)} />
                ) : (
                  <CollisionCard key={c.id} c={cardToCollision(c)} />
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

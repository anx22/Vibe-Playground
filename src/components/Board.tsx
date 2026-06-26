import type { CSSProperties } from "react";
import { SOURCES, MAX_ANCHORS, useVibeStore } from "../store/useVibeStore";
import { ClusterCard } from "../lab/ClusterCard";

/**
 * Board — one even FIELD of equal cards (no hero/satellite, no masonry, no drawer). The cards arrive
 * already best-first and near/far interleaved (judgeRank + spreadByMix), so the grid just renders them.
 * Every card shows its whole Denkanstoß-Cluster inline; its parts are click-to-collect chips that feed
 * the Vibe-Shaker tray. The Anker-Strip stays as the entry to "Aus Ankern ableiten".
 */

const accentOf = (id?: string) => SOURCES.find((s) => s.id === id)?.accent ?? "#888";

export function Board() {
  const cards = useVibeStore((s) => s.cards);
  const anchors = useVibeStore((s) => s.anchors);
  const seed = useVibeStore((s) => s.seed);
  const pending = useVibeStore((s) => s.pendingSources);
  const failed = useVibeStore((s) => s.failedSources);
  const toggleAnchor = useVibeStore((s) => s.toggleAnchor);

  return (
    <div className="board">
      <div className="board-brief">
        <span className="be-kicker">Leitidee</span>
        <span className="be-text">{seed.trim() || "Blank Slate"}</span>
      </div>

      <div className="anchor-strip" data-empty={anchors.length === 0}>
        <span className="as-label">★ Anker {anchors.length}/{MAX_ANCHORS}</span>
        {anchors.length === 0 ? (
          <span className="as-hint">Markiere bis zu 5 Gold-Ideen (★ auf der Karte) — „Aus Ankern ableiten" formt die nächste Welle daraus.</span>
        ) : (
          anchors.map((c) => (
            <button
              key={c.id}
              className="as-chip"
              style={{ ["--accent" as string]: accentOf(c.source) } as CSSProperties}
              onClick={() => toggleAnchor(c)}
              title="Anker entfernen"
            >
              {c.leitwert} <span className="as-x">✕</span>
            </button>
          ))
        )}
      </div>

      {failed.length > 0 && (
        <div className="board-note">{failed.join(", ")} {failed.length > 1 ? "lieferten" : "lieferte"} diese Runde nichts.</div>
      )}

      <div className="field">
        {cards.map((c) => (
          <ClusterCard key={c.id} card={c} framed />
        ))}
        {pending.length > 0 && <div className="field-wait">läuft… <span className="lane-spin" /></div>}
        {pending.length === 0 && cards.length === 0 && <div className="field-wait">— diese Runde dünn</div>}
      </div>
    </div>
  );
}

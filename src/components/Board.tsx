import { type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { VibeCard } from "../engine";
import { SOURCES, MAX_ANCHORS, useVibeStore } from "../store/useVibeStore";

/**
 * Board (E-055) — structured UI, no canvas. One lane (panel) per methodology, grouped and scannable;
 * each engine shows its own kind of content; a card opens an inline expander with the detail +
 * actions. The anchored "gold" set sits in its own strip. Standard, legible frontend patterns.
 */

const accentOf = (id?: string) => SOURCES.find((s) => s.id === id)?.accent ?? "#888";

/** Short sub-line under the Leitwert, tuned per methodology. */
function subline(c: VibeCard): string {
  const d = c.detail;
  if (c.source === "persona") return d?.derivation ?? c.scene ?? "";
  if (d?.worlds?.length) return d.worlds.map((w) => w.name).join("  ×  ");
  return c.mood;
}

export function Board({ onExport }: { onExport: (c: VibeCard) => void }) {
  const cards = useVibeStore((s) => s.cards);
  const anchors = useVibeStore((s) => s.anchors);
  const seed = useVibeStore((s) => s.seed);
  const loading = useVibeStore((s) => s.loading);
  const failed = useVibeStore((s) => s.failedSources);
  const anchorsFull = anchors.length >= MAX_ANCHORS;
  const anchorIds = new Set(anchors.map((a) => a.id));

  return (
    <div className="board">
      <div className="board-brief">
        <span className="be-kicker">Leitidee</span>
        <span className="be-text">{seed.trim() || "Blank Slate"}</span>
      </div>

      <div className="anchor-strip" data-empty={anchors.length === 0}>
        <span className="as-label">★ Anker {anchors.length}/{MAX_ANCHORS}</span>
        {anchors.length === 0 ? (
          <span className="as-hint">Markiere bis zu 5 Gold-Ideen — „Aus Ankern ableiten" formt die nächste Welle daraus.</span>
        ) : (
          anchors.map((c) => (
            <button key={c.id} className="as-chip" style={{ ["--accent" as string]: accentOf(c.source) } as CSSProperties} onClick={() => useVibeStore.getState().focus(c.id)}>
              {c.leitwert}
            </button>
          ))
        )}
      </div>

      {failed.length > 0 && !loading && (
        <div className="board-note">{failed.join(", ")} {failed.length > 1 ? "lieferten" : "lieferte"} diese Runde nichts.</div>
      )}

      <div className="lanes">
        {SOURCES.map((src) => {
          const group = cards.filter((c) => c.source === src.id && !anchorIds.has(c.id));
          return (
            <section className="lane" key={src.id} style={{ ["--accent" as string]: src.accent } as CSSProperties}>
              <header className="lane-head">
                <span className="lane-dot" />
                <span className="lane-title">{src.label}</span>
                <span className="lane-count">{group.length}</span>
              </header>
              <div className="lane-body">
                {loading && group.length === 0 && <div className="lane-skeleton">entsteht…</div>}
                {!loading && group.length === 0 && <div className="lane-empty">—</div>}
                {group.map((c) => (
                  <Row key={c.id} card={c} anchored={anchorIds.has(c.id)} anchorsFull={anchorsFull} onExport={onExport} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Row({ card, anchored, anchorsFull, onExport }: { card: VibeCard; anchored: boolean; anchorsFull: boolean; onExport: (c: VibeCard) => void }) {
  const focusId = useVibeStore((s) => s.focusId);
  const focus = useVibeStore((s) => s.focus);
  const toggleAnchor = useVibeStore((s) => s.toggleAnchor);
  const open = focusId === card.id;
  const d = card.detail;
  const canAnchor = anchored || !anchorsFull;

  return (
    <div className={`row${open ? " is-open" : ""}${anchored ? " is-anchored" : ""}`}>
      <button className="row-main" onClick={() => focus(open ? null : card.id)} aria-expanded={open}>
        <span className="row-bar" />
        <span className="row-text">
          <span className="row-name">{card.leitwert}</span>
          <span className="row-sub">{subline(card)}</span>
        </span>
        <span className="row-pal">{card.palette.map((c, i) => <span key={i} style={{ background: c }} />)}</span>
        <span className={`row-chev${open ? " up" : ""}`}>⌄</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="row-detail" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
            <div className="rd-inner">
              {card.detail?.tasteDirection && <div className="rd-tag">{card.detail.tasteDirection}</div>}
              <div className="rd-mood">{card.mood}{d?.operators?.length ? ` · ${d.operators.join(" + ")}` : ""}</div>

              {d?.worlds?.length ? (
                <div className="rd-block">
                  {d.worlds.map((w, i) => (
                    <p key={i}><b>{w.name}</b> <span className="rd-role">{w.role}</span> — <span className="rd-rhyme">{w.rhyme}</span></p>
                  ))}
                </div>
              ) : null}
              {d?.object && d.object !== "—" && <p className="rd-line"><span className="rd-k">Objekt</span> {d.object}</p>}
              <p className="rd-line"><span className="rd-k">Herleitung</span> {d?.derivation ?? card.scene}</p>
              {d?.affordances?.length ? <p className="rd-line"><span className="rd-k">Affordanzen</span> {d.affordances.join(" · ")}</p> : null}

              <div className="rd-actions">
                <button className={`btn btn-anchor btn-sm${anchored ? " is-on" : ""}`} disabled={!canAnchor} onClick={() => toggleAnchor(card)}>
                  {anchored ? "★ Anker gesetzt" : canAnchor ? "☆ Anker setzen" : "Anker voll"}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onExport(card)}>Inhalt kopieren ⤓</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

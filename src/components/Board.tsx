import { useEffect, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { VibeCard } from "../engine";
import { SOURCES, MAX_ANCHORS, useVibeStore } from "../store/useVibeStore";
import { ClusterCard } from "../lab/ClusterCard";

/**
 * Board — a bento FIELD (E-067). Each engine is a panel with a HERO tile (its judge-#1) over smaller
 * satellite tiles, so the strongest direction is visually dominant. Clicking a tile opens a drawer
 * with the full Denkanstoß-Cluster (Welt-Satz + Metaphern/Materialien/Bild-Vergleiche), each copyable.
 */

const accentOf = (id?: string) => SOURCES.find((s) => s.id === id)?.accent ?? "#888";
const labelOf = (id?: string) => SOURCES.find((s) => s.id === id)?.label ?? "";

export function Board() {
  const cards = useVibeStore((s) => s.cards);
  const anchors = useVibeStore((s) => s.anchors);
  const seed = useVibeStore((s) => s.seed);
  const pending = useVibeStore((s) => s.pendingSources);
  const failed = useVibeStore((s) => s.failedSources);
  const focus = useVibeStore((s) => s.focus);
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
            <button key={c.id} className="as-chip" style={{ ["--accent" as string]: accentOf(c.source) } as CSSProperties} onClick={() => focus(c.id)}>
              {c.leitwert}
            </button>
          ))
        )}
      </div>

      {failed.length > 0 && (
        <div className="board-note">{failed.join(", ")} {failed.length > 1 ? "lieferten" : "lieferte"} diese Runde nichts.</div>
      )}

      <div className="field">
        {SOURCES.map((src) => {
          const group = cards.filter((c) => c.source === src.id && !anchorIds.has(c.id));
          return (
            <Panel
              key={src.id}
              src={src}
              group={group}
              loading={pending.includes(src.id)}
              anchorIds={anchorIds}
            />
          );
        })}
      </div>

      <DetailDrawer anchorIds={anchorIds} anchorsFull={anchorsFull} />
    </div>
  );
}

function Panel({
  src,
  group,
  loading,
  anchorIds,
}: {
  src: (typeof SOURCES)[number];
  group: VibeCard[];
  loading: boolean;
  anchorIds: Set<string>;
}) {
  const [hero, ...sats] = group;

  return (
    <section className="panel" style={{ ["--accent" as string]: src.accent } as CSSProperties}>
      <header className="panel-head">
        <span className="panel-dot" />
        <span className="panel-title">{src.label}</span>
        <span className="panel-count">{loading ? <span className="lane-spin" /> : group.length}</span>
      </header>

      {loading && group.length === 0 && <div className="panel-skel">läuft… <span className="lane-spin" /></div>}
      {!loading && group.length === 0 && <div className="panel-empty">— diese Runde dünn</div>}

      {hero && <Tile card={hero} hero anchored={anchorIds.has(hero.id)} />}

      {sats.length > 0 && (
        <div className="sat-grid">
          {sats.map((c) => <Tile key={c.id} card={c} anchored={anchorIds.has(c.id)} />)}
        </div>
      )}
    </section>
  );
}

function Tile({ card, hero, anchored }: { card: VibeCard; hero?: boolean; anchored: boolean }) {
  const focusId = useVibeStore((s) => s.focusId);
  const focus = useVibeStore((s) => s.focus);
  const open = focusId === card.id;
  return (
    <button
      type="button"
      className={`tile${hero ? " tile--hero" : ""}${anchored ? " is-anchored" : ""}${open ? " is-open" : ""}`}
      onClick={() => focus(open ? null : card.id)}
      aria-label={`${card.leitwert} — Details`}
    >
      {anchored && <span className="tile-star" aria-hidden>★</span>}
      <span className="tile-name">{card.leitwert}</span>
      {hero && <span className="tile-teaser">{card.weltSatz}</span>}
    </button>
  );
}

function DetailDrawer({
  anchorIds,
  anchorsFull,
}: {
  anchorIds: Set<string>;
  anchorsFull: boolean;
}) {
  const focusId = useVibeStore((s) => s.focusId);
  const cards = useVibeStore((s) => s.cards);
  const anchors = useVibeStore((s) => s.anchors);
  const focus = useVibeStore((s) => s.focus);
  const card = cards.find((c) => c.id === focusId) ?? anchors.find((c) => c.id === focusId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && focus(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  return (
    <AnimatePresence>
      {card && (
        <DrawerContent
          key={card.id}
          card={card}
          anchored={anchorIds.has(card.id)}
          anchorsFull={anchorsFull}
          onClose={() => focus(null)}
          onAnchor={() => useVibeStore.getState().toggleAnchor(card)}
        />
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  card,
  anchored,
  anchorsFull,
  onClose,
  onAnchor,
}: {
  card: VibeCard;
  anchored: boolean;
  anchorsFull: boolean;
  onClose: () => void;
  onAnchor: () => void;
}) {
  const canAnchor = anchored || !anchorsFull;

  return (
    <motion.aside
      className="flyout"
      initial={{ x: 44, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 44, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      style={{ ["--accent" as string]: accentOf(card.source) } as CSSProperties}
    >
      <button className="flyout-x" onClick={onClose} aria-label="schließen">✕</button>
      <div className="flyout-src">{labelOf(card.source)}</div>

      <ClusterCard card={card} framed={false} />

      <div className="flyout-actions">
        <button className={`btn btn-anchor${anchored ? " is-on" : ""}`} disabled={!canAnchor} onClick={onAnchor}>
          {anchored ? "★ Anker gesetzt" : canAnchor ? "☆ Als Anker setzen" : "Anker voll (5)"}
        </button>
      </div>
    </motion.aside>
  );
}

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { VibeCard } from "../engine";
import { SOURCES, MAX_ANCHORS, useVibeStore } from "../store/useVibeStore";

/**
 * Studio — a bento FIELD (E-067), not linear lanes. Each engine is a panel with a HERO tile (its
 * judge-#1) over smaller satellite tiles, so the strongest direction is visually dominant. Werkbank's
 * satellites sub-cluster by taste-direction (D12). A register chip (E-065) makes material variety
 * visible at a glance. Clicking a tile opens a detail drawer with progressive depth (E-066).
 */

const accentOf = (id?: string) => SOURCES.find((s) => s.id === id)?.accent ?? "#888";
const labelOf = (id?: string) => SOURCES.find((s) => s.id === id)?.label ?? "";

/** One-line teaser under a hero Leitwert, tuned per methodology. */
function teaser(c: VibeCard): string {
  const d = c.detail;
  if (c.source === "persona") return d?.derivation ?? c.scene ?? "";
  if (d?.worlds?.length) return d.worlds.map((w) => w.name).join("  ×  ");
  return c.mood;
}

export function Board({ onExport }: { onExport: (c: VibeCard) => void }) {
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

      <DetailDrawer onExport={onExport} anchorIds={anchorIds} anchorsFull={anchorsFull} />
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
  const isWorkbench = src.id === "workbench";

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

      {!isWorkbench && sats.length > 0 && (
        <div className="sat-grid">
          {sats.map((c) => <Tile key={c.id} card={c} anchored={anchorIds.has(c.id)} />)}
        </div>
      )}

      {isWorkbench && sats.length > 0 && <TasteGroups cards={sats} anchorIds={anchorIds} />}
    </section>
  );
}

/** D12 — Werkbank's satellites become visible sub-clusters, one per orthogonal taste-direction. */
function TasteGroups({ cards, anchorIds }: { cards: VibeCard[]; anchorIds: Set<string> }) {
  const groups = new Map<string, VibeCard[]>();
  for (const c of cards) {
    const k = c.detail?.tasteDirection?.trim() || "Weitere";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(c);
  }
  return (
    <div className="taste-groups">
      {[...groups.entries()].map(([taste, cs]) => (
        <div className="taste-group" key={taste}>
          <div className="taste-label">{taste}</div>
          <div className="sat-grid">
            {cs.map((c) => <Tile key={c.id} card={c} anchored={anchorIds.has(c.id)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tile({ card, hero, anchored }: { card: VibeCard; hero?: boolean; anchored: boolean }) {
  const focusId = useVibeStore((s) => s.focusId);
  const focus = useVibeStore((s) => s.focus);
  const open = focusId === card.id;
  const reg = card.quality?.register;
  return (
    <button
      type="button"
      className={`tile${hero ? " tile--hero" : ""}${anchored ? " is-anchored" : ""}${open ? " is-open" : ""}`}
      onClick={() => focus(open ? null : card.id)}
      aria-label={`${card.leitwert} — Details`}
    >
      {anchored && <span className="tile-star" aria-hidden>★</span>}
      <span className="tile-name">{card.leitwert}</span>
      {hero && <span className="tile-teaser">{teaser(card)}</span>}
      <span className="tile-foot">
        <span className="tile-pal">{card.palette.map((c, i) => <span key={i} style={{ background: c }} />)}</span>
        {reg && <span className="tile-reg" title={`Register: ${reg}`}>{reg}</span>}
      </span>
    </button>
  );
}

function DetailDrawer({
  onExport,
  anchorIds,
  anchorsFull,
}: {
  onExport: (c: VibeCard) => void;
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
          onExport={() => onExport(card)}
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
  onExport,
}: {
  card: VibeCard;
  anchored: boolean;
  anchorsFull: boolean;
  onClose: () => void;
  onAnchor: () => void;
  onExport: () => void;
}) {
  const [deep, setDeep] = useState(false);
  const d = card.detail;
  const canAnchor = anchored || !anchorsFull;
  const hasDepth = !!(d?.worlds?.length || (d?.object && d.object !== "—") || d?.affordances?.length);

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
      <div className="flyout-src">{labelOf(card.source)}{d?.tasteDirection ? ` · ${d.tasteDirection}` : ""}</div>
      <h2 className="flyout-name">{card.leitwert}</h2>
      <div className="flyout-mood">{card.mood}{d?.operators?.length ? ` · ${d.operators.join(" + ")}` : ""}</div>

      {(card.quality?.register || d?.domainDistance || d?.comfortRating) && (
        <div className="flyout-tags">
          {card.quality?.register && <span>Register: {card.quality.register}</span>}
          {d?.domainDistance && <span>Distanz: {d.domainDistance}</span>}
          {d?.comfortRating && <span>Komfort: {d.comfortRating}</span>}
        </div>
      )}

      <div className="flyout-palette">
        {card.palette.map((c, i) => <span key={i} style={{ background: c }} title={c} />)}
      </div>

      <div className="flyout-block"><h3>Herleitung</h3><p>{d?.derivation ?? card.scene}</p></div>

      {hasDepth && (
        <>
          <button className="rd-more" onClick={() => setDeep((v) => !v)} aria-expanded={deep}>
            {deep ? "Tiefe ausblenden ▴" : "Tiefe zeigen ▾"}
          </button>
          <AnimatePresence initial={false}>
            {deep && (
              <motion.div className="rd-depth" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }}>
                {d?.worlds?.length ? (
                  <div className="flyout-block">
                    <h3>Verschränkung</h3>
                    {d.worlds.map((w, i) => (
                      <p key={i}><b>{w.name}</b> <span className="role">{w.role}</span><br /><span className="rhyme">reimt: {w.rhyme}</span></p>
                    ))}
                  </div>
                ) : null}
                {d?.object && d.object !== "—" && <div className="flyout-block"><h3>Objekt</h3><p>{d.object}</p></div>}
                {d?.affordances?.length ? (
                  <div className="flyout-block"><h3>Affordanzen</h3><ul>{d.affordances.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="flyout-actions">
        <button className={`btn btn-anchor${anchored ? " is-on" : ""}`} disabled={!canAnchor} onClick={onAnchor}>
          {anchored ? "★ Anker gesetzt" : canAnchor ? "☆ Als Anker setzen" : "Anker voll (5)"}
        </button>
        <button className="btn btn-primary" onClick={onExport}>Inhalt kopieren ⤓</button>
      </div>
    </motion.aside>
  );
}

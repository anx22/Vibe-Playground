import { useEffect, useMemo, type CSSProperties } from "react";
import { MotionConfig, motion } from "framer-motion";
import type { VibeCard } from "../engine";
import { SOURCES, MAX_ANCHORS, useVibeStore } from "../store/useVibeStore";

/**
 * The constellation canvas (E-047): the Leitidee sits at the center; each methodology forms its
 * own hex-flower cluster around it; anchored gold blocks pull into a tight ring near the center
 * and gravitate the next wave. Positions are computed polar coordinates, animated with Framer-Motion.
 */

// Spacing chosen so cluster tiles never overlap each other, the anchor ring, or the centre:
// within-cluster gap = 2·R_LOCAL·sin30 − TILE = 28px; inner cluster edge (R_CLUSTER−R_LOCAL−TILE/2)
// sits well outside the anchor ring.
const CENTER = 150; // center hexagon px
const TILE = 112; // cluster tile px
const ANCHOR = 92; // anchored tile px
const R_CLUSTER = 470; // distance to each cluster's centre
const R_LOCAL = 140; // tile spread within a cluster
const R_ANCHOR = 210; // anchored ring radius

interface Placed {
  card: VibeCard;
  x: number;
  y: number;
  size: number;
  accent: string;
}

const accentOf = (id?: string) => SOURCES.find((s) => s.id === id)?.accent ?? "#999";
const hex = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

export function Constellation({ onExport }: { onExport: (c: VibeCard) => void }) {
  const cards = useVibeStore((s) => s.cards);
  const anchors = useVibeStore((s) => s.anchors);
  const seed = useVibeStore((s) => s.seed);
  const focusId = useVibeStore((s) => s.focusId);
  const focus = useVibeStore((s) => s.focus);
  const toggleAnchor = useVibeStore((s) => s.toggleAnchor);
  const loading = useVibeStore((s) => s.loading);

  const anchorIds = useMemo(() => new Set(anchors.map((a) => a.id)), [anchors]);

  const placed = useMemo<Placed[]>(() => {
    const out: Placed[] = [];
    // Anchored gold ring near the center.
    anchors.forEach((card, j) => {
      const t = (j / Math.max(anchors.length, 1)) * Math.PI * 2 - Math.PI / 2;
      out.push({ card, x: Math.cos(t) * R_ANCHOR, y: Math.sin(t) * R_ANCHOR, size: ANCHOR, accent: accentOf(card.source) });
    });
    // One hex-flower cluster per methodology, in its own angular sector.
    const m = SOURCES.length;
    SOURCES.forEach((src, i) => {
      const ang = (i / m) * Math.PI * 2; // 0 = right, π = left …
      const cx = Math.cos(ang) * R_CLUSTER;
      const cy = Math.sin(ang) * R_CLUSTER;
      const group = cards.filter((c) => c.source === src.id && !anchorIds.has(c.id));
      group.forEach((card, k) => {
        let lx = 0;
        let ly = 0;
        if (k < 6) {
          const t = (k / 6) * Math.PI * 2 - Math.PI / 2;
          lx = Math.cos(t) * R_LOCAL;
          ly = Math.sin(t) * R_LOCAL;
        }
        out.push({ card, x: cx + lx, y: cy + ly, size: TILE, accent: src.accent });
      });
    });
    return out;
  }, [cards, anchors, anchorIds]);

  const clusterLabels = useMemo(
    () => SOURCES.map((src, i) => {
      const ang = (i / SOURCES.length) * Math.PI * 2;
      return { src, x: Math.cos(ang) * (R_CLUSTER + R_LOCAL + 54), y: Math.sin(ang) * (R_CLUSTER + R_LOCAL + 54) };
    }),
    [],
  );

  const anchorsFull = anchors.length >= MAX_ANCHORS;

  return (
    <MotionConfig reducedMotion="user">
    <div className="constellation">
      <motion.div
        className="constellation-canvas"
        drag
        dragMomentum={false}
        dragElastic={0.12}
        dragConstraints={{ left: -820, right: 820, top: -680, bottom: 680 }}
        style={{ x: 0, y: 0 }}
      >
        {/* instrument: concentric measurement rings around the centre + the anchor orbit */}
        <div className="instrument" aria-hidden />
        {/* connector sightlines */}
        <svg className="spokes" width="2000" height="2000" viewBox="-1000 -1000 2000 2000">
          {placed.map((p) => (
            <line key={`s-${p.card.id}`} x1={0} y1={0} x2={p.x} y2={p.y} stroke={p.accent} strokeOpacity={anchorIds.has(p.card.id) ? 0.5 : 0.12} strokeWidth={anchorIds.has(p.card.id) ? 1.5 : 1} />
          ))}
        </svg>

        {/* cluster labels */}
        {clusterLabels.map(({ src, x, y }) => (
          <div key={src.id} className="cluster-label" style={{ left: "50%", top: "50%", transform: `translate(-50%,-50%) translate(${x}px,${y}px)`, color: src.accent }}>
            {src.label}
          </div>
        ))}

        {/* center: the Leitidee */}
        <div className="node node--center" style={{ width: CENTER, height: CENTER, clipPath: hex }}>
          <div className="center-inner">
            <span className="center-kicker">Leitidee</span>
            <span className="center-text">{seed.trim() || "Blank Slate"}</span>
          </div>
        </div>

        {/* blocks */}
        {placed.map((p) => {
          const isAnchor = anchorIds.has(p.card.id);
          const isFocus = p.card.id === focusId;
          const canAnchor = isAnchor || !anchorsFull;
          return (
            <motion.div
              key={p.card.id}
              role="button"
              tabIndex={0}
              aria-pressed={isFocus}
              aria-label={`${p.card.leitwert} — Details`}
              initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1, x: p.x, y: p.y }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className={`node node--block${isAnchor ? " is-anchor" : ""}${isFocus ? " is-focus" : ""}`}
              style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2, clipPath: hex, ["--accent" as string]: p.accent } as CSSProperties}
              onClick={() => focus(isFocus ? null : p.card.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  focus(isFocus ? null : p.card.id);
                }
              }}
            >
              <span className="node-name">{p.card.leitwert}</span>
              <span className="node-palette">
                {p.card.palette.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </span>
              <button
                type="button"
                className={`node-anchor${isAnchor ? " on" : ""}`}
                aria-label={isAnchor ? "Anker entfernen" : "Als Anker setzen"}
                disabled={!canAnchor}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAnchor(p.card);
                }}
              >
                {isAnchor ? "★" : "☆"}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {loading && <div className="constellation-loading">Bausteine entstehen…</div>}
      {!loading && !cards.length && !anchors.length && (
        <div className="constellation-hint">Block wählen → ☆ Anker setzen → „Aus Ankern ableiten"</div>
      )}

      <FocusFlyout onExport={onExport} isAnchored={(id) => anchorIds.has(id)} onAnchor={toggleAnchor} anchorsFull={anchorsFull} />
    </div>
    </MotionConfig>
  );
}

function FocusFlyout({
  onExport,
  isAnchored,
  onAnchor,
  anchorsFull,
}: {
  onExport: (c: VibeCard) => void;
  isAnchored: (id: string) => boolean;
  onAnchor: (c: VibeCard) => void;
  anchorsFull: boolean;
}) {
  const focusId = useVibeStore((s) => s.focusId);
  const cards = useVibeStore((s) => s.cards);
  const anchors = useVibeStore((s) => s.anchors);
  const focus = useVibeStore((s) => s.focus);
  const card = useMemo(
    () => cards.find((c) => c.id === focusId) ?? anchors.find((c) => c.id === focusId),
    [cards, anchors, focusId],
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && focus(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);
  if (!card) return null;
  const anchored = isAnchored(card.id);
  const d = card.detail;
  const canAnchor = anchored || !anchorsFull;

  return (
    <motion.aside
      className="flyout"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={{ ["--accent" as string]: accentOf(card.source) } as CSSProperties}
    >
      <button className="flyout-x" onClick={() => focus(null)} aria-label="schließen">✕</button>
      <div className="flyout-src">
        {SOURCES.find((s) => s.id === card.source)?.label}
        {d?.tasteDirection ? ` · ${d.tasteDirection}` : ""}
      </div>
      <h2 className="flyout-name">{card.leitwert}</h2>
      <div className="flyout-mood">{card.mood}{d?.operators?.length ? ` · ${d.operators.join(" + ")}` : ""}</div>
      {(d?.domainDistance || d?.comfortRating) && (
        <div className="flyout-tags">
          {d?.domainDistance && <span>Distanz: {d.domainDistance}</span>}
          {d?.comfortRating && <span>Komfort: {d.comfortRating}</span>}
        </div>
      )}

      <div className="flyout-palette">
        {card.palette.map((c, i) => (
          <span key={i} style={{ background: c }} title={c} />
        ))}
      </div>

      {d?.worlds?.length ? (
        <div className="flyout-block">
          <h3>Verschränkung</h3>
          {d.worlds.map((w, i) => (
            <p key={i}><b>{w.name}</b> <span className="role">{w.role}</span><br /><span className="rhyme">reimt: {w.rhyme}</span></p>
          ))}
        </div>
      ) : null}

      {d?.object && d.object !== "—" && (
        <div className="flyout-block"><h3>Objekt</h3><p>{d.object}</p></div>
      )}

      <div className="flyout-block">
        <h3>Herleitung</h3>
        <p>{d?.derivation ?? card.scene}</p>
      </div>

      {d?.affordances?.length ? (
        <div className="flyout-block">
          <h3>Affordanzen</h3>
          <ul>{d.affordances.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      ) : null}

      <div className="flyout-actions">
        <button className={`btn btn-anchor${anchored ? " is-on" : ""}`} disabled={!canAnchor} onClick={() => onAnchor(card)}>
          {anchored ? "★ Anker gesetzt" : canAnchor ? "☆ Als Anker setzen" : "Anker voll (5)"}
        </button>
        <button className="btn btn-primary" onClick={() => onExport(card)}>Inhalt kopieren ⤓</button>
      </div>
    </motion.aside>
  );
}

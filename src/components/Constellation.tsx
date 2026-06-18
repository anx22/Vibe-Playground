import { useEffect, useMemo, type CSSProperties } from "react";
import { MotionConfig, motion } from "framer-motion";
import type { VibeCard } from "../engine";
import { SOURCES, MAX_ANCHORS, useVibeStore } from "../store/useVibeStore";

/**
 * Constellation canvas (E-053): the Leitidee is a big glossy gem at the centre; each methodology
 * is a quadrant cluster — a hub gem (its strongest block) ringed by satellite gems — wired to the
 * centre with glowing connectors. Glossy rounded gems, light premium ground. Framer-Motion bloom.
 */

const CENTER = 190;
const HUB = 124;
const TILE = 98;
const ANCHOR = 84;
const R_CLUSTER_X = 388; // quadrant cluster centre — elliptical (landscape-friendly, no top/bottom clip)
const R_CLUSTER_Y = 250;
const R_SAT = 112; // satellite ring radius around a hub
const R_ANCHOR = 150; // anchored gold ring radius

const accentOf = (id?: string) => SOURCES.find((s) => s.id === id)?.accent ?? "#999";
const labelOf = (id?: string) => SOURCES.find((s) => s.id === id)?.label ?? "";

interface Node {
  card: VibeCard;
  x: number;
  y: number;
  size: number;
  accent: string;
  kind: "hub" | "sat" | "anchor";
}
interface Link {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  accent: string;
  dotted: boolean;
}

export function Constellation({ onExport }: { onExport: (c: VibeCard) => void }) {
  const cards = useVibeStore((s) => s.cards);
  const anchors = useVibeStore((s) => s.anchors);
  const seed = useVibeStore((s) => s.seed);
  const focusId = useVibeStore((s) => s.focusId);
  const focus = useVibeStore((s) => s.focus);
  const toggleAnchor = useVibeStore((s) => s.toggleAnchor);
  const loading = useVibeStore((s) => s.loading);
  const anchorsFull = anchors.length >= MAX_ANCHORS;

  const anchorIds = useMemo(() => new Set(anchors.map((a) => a.id)), [anchors]);

  const { nodes, links } = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const m = SOURCES.length;

    anchors.forEach((card, j) => {
      const t = (j / Math.max(anchors.length, 1)) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ card, x: Math.cos(t) * R_ANCHOR, y: Math.sin(t) * R_ANCHOR, size: ANCHOR, accent: accentOf(card.source), kind: "anchor" });
    });

    SOURCES.forEach((src, i) => {
      const ang = (i / m) * Math.PI * 2 + Math.PI / m - Math.PI / 2; // sit in the diagonals
      const cx = Math.cos(ang) * R_CLUSTER_X;
      const cy = Math.sin(ang) * R_CLUSTER_Y;
      const group = cards.filter((c) => c.source === src.id && !anchorIds.has(c.id));
      if (!group.length) return;
      const [hub, ...sats] = group;
      nodes.push({ card: hub, x: cx, y: cy, size: HUB, accent: src.accent, kind: "hub" });
      links.push({ x1: 0, y1: 0, x2: cx, y2: cy, accent: src.accent, dotted: false });
      sats.forEach((card, k) => {
        const t = (k / sats.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(t) * R_SAT;
        const y = cy + Math.sin(t) * R_SAT;
        nodes.push({ card, x, y, size: TILE, accent: src.accent, kind: "sat" });
        links.push({ x1: cx, y1: cy, x2: x, y2: y, accent: src.accent, dotted: true });
      });
    });
    return { nodes, links };
  }, [cards, anchors, anchorIds]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="constellation">
        <div className="cst-canvas">
          <svg className="cst-links" viewBox="-720 -460 1440 920" preserveAspectRatio="xMidYMid meet">
            {links.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.accent}
                strokeWidth={l.dotted ? 1.5 : 2.5}
                strokeOpacity={l.dotted ? 0.45 : 0.7}
                strokeDasharray={l.dotted ? "1 7" : undefined}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* centre: the Leitidee gem */}
          <div className="gem gem--center" style={{ width: CENTER, height: CENTER }}>
            <span className="gem-eyebrow">Leitidee</span>
            <span className="gem-title">{seed.trim() || "Blank Slate"}</span>
          </div>

          {nodes.map((nd) => {
            const isAnchor = anchorIds.has(nd.card.id);
            const isFocus = nd.card.id === focusId;
            const canAnchor = isAnchor || !anchorsFull;
            return (
              <motion.div
                key={nd.card.id}
                role="button"
                tabIndex={0}
                aria-label={`${nd.card.leitwert} — Details`}
                initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, x: nd.x, y: nd.y }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className={`gem gem--${nd.kind}${isAnchor ? " is-anchor" : ""}${isFocus ? " is-focus" : ""}`}
                style={{ width: nd.size, height: nd.size, marginLeft: -nd.size / 2, marginTop: -nd.size / 2, ["--accent" as string]: nd.accent } as CSSProperties}
                onClick={() => focus(isFocus ? null : nd.card.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    focus(isFocus ? null : nd.card.id);
                  }
                }}
              >
                {nd.kind === "hub" && <span className="gem-eyebrow">{labelOf(nd.card.source)}</span>}
                <span className="gem-name">{nd.card.leitwert}</span>
                <span className="gem-palette">
                  {nd.card.palette.map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </span>
                <button
                  type="button"
                  className={`gem-anchor${isAnchor ? " on" : ""}`}
                  aria-label={isAnchor ? "Anker entfernen" : "Als Anker setzen"}
                  disabled={!canAnchor}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAnchor(nd.card);
                  }}
                >
                  {isAnchor ? "★" : "☆"}
                </button>
              </motion.div>
            );
          })}
        </div>

        {loading && <div className="cst-loading">Bausteine entstehen…</div>}
        {!loading && !cards.length && !anchors.length && (
          <div className="cst-hint">Block wählen → ☆ Anker setzen → „Aus Ankern ableiten"</div>
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
    <motion.aside className="flyout" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ ["--accent" as string]: accentOf(card.source) } as CSSProperties}>
      <button className="flyout-x" onClick={() => focus(null)} aria-label="schließen">✕</button>
      <div className="flyout-src">
        {labelOf(card.source)}
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

      {d?.object && d.object !== "—" && <div className="flyout-block"><h3>Objekt</h3><p>{d.object}</p></div>}

      <div className="flyout-block"><h3>Herleitung</h3><p>{d?.derivation ?? card.scene}</p></div>

      {d?.affordances?.length ? (
        <div className="flyout-block"><h3>Affordanzen</h3><ul>{d.affordances.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
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

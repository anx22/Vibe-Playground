import { useState } from "react";
import type { ReactNode } from "react";
import { tokenId, type TokenKind, type VibeCard } from "../engine";
import { clusterText, KIND_LABELS, worldPromptText } from "../export";
import { useVibeStore } from "../store/useVibeStore";
import "./lab.css";

/**
 * ClusterCard — the single result renderer, fully visible and INTERACTIVE. The Leitwert (Richtung) is
 * the title, the Welt-Satz (Welt/soul) sits below, then Funde / Materialien / Bild-Referenzen. EVERY
 * part is a click-to-collect chip that drops into the Vibe-Shaker (bottom tray); the selected morsels
 * mix into one paste-ready Modifikator. Two whole-cluster copy buttons (Welt-Prompt, Cluster) stay for
 * the quick complete grab, and a ★ marks an Anker that steers the next Welle. No design is prescribed.
 */

const GROUPS: { key: "funde" | "materialien" | "bildReferenzen" }[] = [
  { key: "funde" },
  { key: "materialien" },
  { key: "bildReferenzen" },
];

const ClipGlyph = ({ done }: { done: boolean }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
    {done ? (
      <path d="M5 12l4.5 4.5L20 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <>
        <rect x="9" y="9" width="11" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 15.5V5.5a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    )}
  </svg>
);

export function ClusterCard({ card, framed = true }: { card: VibeCard; framed?: boolean }) {
  const [copied, setCopied] = useState("");
  const shaker = useVibeStore((s) => s.shaker);
  const toggleToken = useVibeStore((s) => s.toggleToken);
  const anchored = useVibeStore((s) => s.anchors.some((a) => a.id === card.id));
  const toggleAnchor = useVibeStore((s) => s.toggleAnchor);

  // One Set per render is cheap; a chip and its tray entry share the token id ⇒ collected-state is live.
  const collected = new Set(shaker.map((t) => t.id));
  const isOn = (kind: TokenKind, text: string) => collected.has(tokenId(card.id, kind, text));
  const toggle = (kind: TokenKind, text: string) =>
    toggleToken({ id: tokenId(card.id, kind, text), cardId: card.id, kind, text });

  const copy = (text: string, token: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(token);
        window.setTimeout(() => setCopied((t) => (t === token ? "" : t)), 1200);
      },
      () => {},
    );
  };

  const copyBtn = (text: string, token: string, title: string, label: string): ReactNode => {
    const done = copied === token;
    return (
      <button
        type="button"
        className={`copy-btn copy-btn--labeled${done ? " is-done" : ""}`}
        title={title}
        aria-label={title}
        onClick={(e) => {
          e.stopPropagation();
          copy(text, token);
        }}
      >
        <ClipGlyph done={done} />
        <span className="copy-btn-label">{done ? "Kopiert" : label}</span>
      </button>
    );
  };

  const chip = (kind: TokenKind, text: string, cls = "chip"): ReactNode => {
    const on = isOn(kind, text);
    return (
      <button
        type="button"
        key={`${kind}:${text}`}
        className={cls}
        data-on={on}
        onClick={(e) => {
          e.stopPropagation();
          toggle(kind, text);
        }}
        title={on ? "Aus dem Vibe-Shaker nehmen" : "In den Vibe-Shaker"}
      >
        {text}
      </button>
    );
  };

  return (
    <article className={`cluster${framed ? " cluster--card" : ""}`}>
      <header className="cluster-head">
        {chip("leitwert", card.leitwert, "chip chip--title")}
        <div className="cluster-tools">
          <button
            type="button"
            className="star-btn"
            data-on={anchored}
            onClick={(e) => {
              e.stopPropagation();
              toggleAnchor(card);
            }}
            title={anchored ? "Anker entfernen" : "Als Anker setzen — formt die nächste Welle"}
            aria-label="Anker"
          >
            ★
          </button>
          {copyBtn(worldPromptText(card), "world", "Welt-Prompt kopieren — paste-ready für eine Bild-KI", "Welt-Prompt")}
          {copyBtn(clusterText(card), "all", "Ganzen Cluster kopieren", "Cluster")}
        </div>
      </header>

      {card.weltSatz && chip("weltSatz", card.weltSatz, "chip chip--welt")}

      {GROUPS.map(({ key }) => {
        const items = card[key];
        if (!items?.length) return null;
        return (
          <section className="cluster-group" key={key}>
            <span className="cluster-group-label">{KIND_LABELS[key]}</span>
            <div className="chip-row">{items.map((it) => chip(key, it))}</div>
          </section>
        );
      })}
    </article>
  );
}

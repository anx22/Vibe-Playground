import { useState } from "react";
import type { ReactNode } from "react";
import type { VibeCard } from "../engine";
import { clusterText, groupText, worldPromptText } from "../export";
import "./lab.css";

/**
 * ClusterCard — the single result renderer. A Denkanstoß-Cluster as a clean, readable list: the
 * Leitwert as title, the Welt-Satz (the headline/soul) right below, then Funde / Materialien /
 * Bild-Referenzen. Copy is DISCREET (a hover icon) at three grains — a single line (einzeln), one
 * group (gruppiert), the whole cluster (gesamt) — plus a composed Welt-Prompt (paste-ready for an
 * image AI). No design is prescribed here.
 */

const GROUPS: { key: "funde" | "materialien" | "bildReferenzen"; label: string }[] = [
  { key: "funde", label: "Funde" },
  { key: "materialien", label: "Materialien" },
  { key: "bildReferenzen", label: "Bild-Referenzen" },
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

  const copyBtn = (text: string, token: string, title: string, label?: string): ReactNode => {
    const done = copied === token;
    return (
      <button
        type="button"
        className={`copy-btn${label ? " copy-btn--labeled" : ""}${done ? " is-done" : ""}`}
        title={title}
        aria-label={title}
        onClick={(e) => {
          e.stopPropagation();
          copy(text, token);
        }}
      >
        <ClipGlyph done={done} />
        {label && <span className="copy-btn-label">{done ? "Kopiert" : label}</span>}
      </button>
    );
  };

  return (
    <article className={`cluster${framed ? " cluster--card" : ""}`}>
      <header className="cluster-head">
        <h3 className="cluster-title">{card.leitwert}</h3>
        {copyBtn(worldPromptText(card), "world", "Welt-Prompt kopieren — paste-ready für eine Bild-KI", "Welt-Prompt")}
        {copyBtn(clusterText(card), "all", "Ganzen Cluster kopieren", "Cluster")}
      </header>

      {card.weltSatz && <p className="cluster-welt">{card.weltSatz}</p>}

      {GROUPS.map(({ key, label }) => {
        const items = card[key];
        if (!items?.length) return null;
        return (
          <section className="cluster-group" key={key}>
            <div className="cluster-group-head">
              <span className="cluster-group-label">{label}</span>
              {copyBtn(groupText(label, items), `g:${key}`, `${label} kopieren`)}
            </div>
            <ul className="cluster-list">
              {items.map((it, i) => (
                <li className="cluster-item" key={i}>
                  <span className="cluster-item-text">{it}</span>
                  {copyBtn(it, `i:${key}:${i}`, "Zeile kopieren")}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}

import { useState } from "react";
import { useVibeStore } from "../store/useVibeStore";
import { KIND_LABELS, KIND_ORDER, shakerText } from "../export";

/**
 * Vibe-Shaker — the docked bottom tray. Morsels clicked out of the cards land here, grouped by kind,
 * and mix into ONE paste-ready Modifikator. The tray reads the same `shaker` array the card chips
 * write, so adding on a card or removing here (✕) stays in sync both ways. Survives "Iterieren".
 */
export function VibeShaker() {
  const tokens = useVibeStore((s) => s.shaker);
  const removeToken = useVibeStore((s) => s.removeToken);
  const clearShaker = useVibeStore((s) => s.clearShaker);
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const count = tokens.length;

  const copy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(shakerText(tokens)).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  };

  const groups = KIND_ORDER.map((kind) => ({
    kind,
    label: KIND_LABELS[kind],
    items: tokens.filter((t) => t.kind === kind),
  })).filter((g) => g.items.length);

  return (
    <div className={`shaker${open ? " is-open" : ""}`}>
      <div className="shaker-bar">
        <button className="shaker-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="shaker-mark" aria-hidden>🍸</span>
          Vibe-Shaker
          <span className="shaker-count">{count}</span>
          <span className="shaker-caret" aria-hidden>{open ? "▾" : "▴"}</span>
        </button>
        <div className="shaker-actions">
          <button className="btn btn-ghost btn-sm" disabled={!count} onClick={clearShaker}>Leeren</button>
          <button className="btn btn-primary btn-sm" disabled={!count} onClick={copy}>
            {copied ? "Kopiert ✓" : "Kopieren"}
          </button>
        </div>
      </div>

      {open && (
        <div className="shaker-body">
          {count === 0 ? (
            <p className="shaker-empty">Klick Funde, Materialien, Welt-Sätze auf den Karten an — sie sammeln sich hier zu deinem Vibe-Modifikator.</p>
          ) : (
            groups.map((g) => (
              <div className="shaker-group" key={g.kind}>
                <span className="shaker-group-label">{g.label}</span>
                <div className="shaker-chips">
                  {g.items.map((t) => (
                    <button className="shaker-chip" key={t.id} onClick={() => removeToken(t.id)} title="Entfernen">
                      <span>{t.text}</span>
                      <span className="shaker-x" aria-hidden>✕</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

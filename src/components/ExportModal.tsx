import { useState } from "react";
import type { CSSProperties } from "react";
import type { VibeCard } from "../engine";
import { buildExportPrompt } from "../export";

/** Export panel: the committed direction as a copy-ready prompt/brief. */
export function ExportModal({ card, onClose }: { card: VibeCard; onClose: () => void }) {
  const text = buildExportPrompt(card);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — user can still select the textarea */
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ ["--card-accent" as string]: card.palette[2] } as CSSProperties}
      >
        <div className="modal-head">
          <span className="modal-title" style={{ fontFamily: card.typography.display.family }}>
            {card.leitwert}
          </span>
          <button className="modal-x" type="button" onClick={onClose} aria-label="Schließen">
            ✕
          </button>
        </div>
        <textarea className="export-text" readOnly value={text} spellCheck={false} />
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
            Schließen
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={copy}>
            {copied ? "Kopiert ✓" : "Prompt kopieren"}
          </button>
        </div>
      </div>
    </div>
  );
}

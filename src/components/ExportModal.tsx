import { useState } from "react";
import type { CSSProperties } from "react";
import type { VibeCard } from "../engine";
import { buildExportPrompt, buildTrigger, type ExportTarget } from "../export";

const TABS: { id: ExportTarget; label: string }[] = [
  { id: "midjourney", label: "Midjourney" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "brandboard", label: "Brandboard" },
];

/** Export panel: the committed direction as a one-line trigger + a full target-formatted prompt (C9). */
export function ExportModal({ card, onClose }: { card: VibeCard; onClose: () => void }) {
  const [target, setTarget] = useState<ExportTarget>("midjourney");
  const [copied, setCopied] = useState<"" | "line" | "full">("");
  const trigger = buildTrigger(card, target);
  const full = buildExportPrompt(card, target);

  const copy = async (text: string, which: "line" | "full") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard blocked — user can still select the textarea */
    }
  };

  const label = TABS.find((t) => t.id === target)!.label;

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

        <div className="export-tabs" role="tablist" aria-label="Ziel">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={target === t.id}
              className={`export-tab${target === t.id ? " is-on" : ""}`}
              onClick={() => setTarget(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="export-line">
          <div className="export-line-label">Eine Zeile, die trägt</div>
          <p className="export-line-text">{trigger}</p>
          <button
            className="btn btn-ghost btn-sm export-line-copy"
            type="button"
            onClick={() => copy(trigger, "line")}
          >
            {copied === "line" ? "Kopiert ✓" : "Zeile kopieren"}
          </button>
        </div>

        <textarea className="export-text" readOnly value={full} spellCheck={false} />
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
            Schließen
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => copy(full, "full")}>
            {copied === "full" ? "Kopiert ✓" : `${label} kopieren`}
          </button>
        </div>
      </div>
    </div>
  );
}

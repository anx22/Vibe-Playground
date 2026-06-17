import type { Mode } from "../store/useVibeStore";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "analogy", label: "Analogie", hint: "Funktionaler Kern → ferne Welt mit gleichem Kern → Leitwert" },
  { id: "persona", label: "Persona", hint: "Modell erfindet einen Urheber, daraus folgt der Stil" },
];

/** Adaptive Advanced controls: the creative derivation (Analogie/Persona) + tension knob. */
export function AdvancedPanel({
  mode,
  tension,
  onMode,
  onTension,
}: {
  mode: Mode;
  tension: number;
  onMode: (m: Mode) => void;
  onTension: (t: number) => void;
}) {
  const current = MODES.find((m) => m.id === mode);
  return (
    <div className="adv-panel">
      <div className="adv-head">Advanced</div>

      <div className="adv-lens" role="tablist" aria-label="Herleitung">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`adv-lens-btn${mode === m.id ? " is-active" : ""}`}
            onClick={() => onMode(m.id)}
            title={m.hint}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="adv-lens-hint">{current?.hint}</div>

      <label className="adv-tension">
        <span className="adv-tension-labels">
          <span>sicher</span>
          <span>experimentell</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(tension * 100)}
          onChange={(e) => onTension(Number(e.target.value) / 100)}
        />
      </label>
    </div>
  );
}

import type { Lens } from "../store/useVibeStore";

const LENSES: { id: Lens; label: string; hint: string }[] = [
  { id: "auto", label: "Katalog", hint: "Feste Stil-Liste, per Regel kombiniert" },
  { id: "B", label: "Generativ", hint: "Modell erfindet Begriffe, mischt per Bedeutungs-Nähe" },
  { id: "C", label: "Persona", hint: "Modell erfindet einen Urheber, daraus folgt der Stil" },
];

/** Adaptive Advanced controls: engine lens + the safe↔experimental tension knob. */
export function AdvancedPanel({
  lens,
  tension,
  onLens,
  onTension,
}: {
  lens: Lens;
  tension: number;
  onLens: (l: Lens) => void;
  onTension: (t: number) => void;
}) {
  const current = LENSES.find((l) => l.id === lens);
  return (
    <div className="adv-panel">
      <div className="adv-head">Advanced</div>

      <div className="adv-lens" role="tablist" aria-label="Engine">
        {LENSES.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`adv-lens-btn${lens === l.id ? " is-active" : ""}`}
            onClick={() => onLens(l.id)}
            title={l.hint}
          >
            {l.label}
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

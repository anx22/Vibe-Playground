import { useState } from "react";
import { METHODS, runLab, type Briefing, type LabRun } from "../lab";

const PRESETS: Briefing[] = [
  {
    id: "coffee",
    label: "Kaffeerösterei",
    text: "handwerklich warm editorial, modern vertrauenswürdig minimal",
  },
  { id: "co2", label: "CO₂-Dashboard", text: "tech futuristisch dicht, nicht steril warm" },
  { id: "blank", label: "Blank Slate", text: "" },
];

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function Lab() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(METHODS.filter((m) => !m.requiresLLM).map((m) => m.id)),
  );
  const [batchSize, setBatchSize] = useState(5);
  const [seed, setSeed] = useState(42);
  const [run, setRun] = useState<LabRun | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const doRun = async () => {
    const methods = METHODS.filter((m) => selected.has(m.id));
    setRun(await runLab(methods, PRESETS, { batchSize, seed }));
  };

  return (
    <main className="lab">
      <div className="lab-controls">
        <div className="lab-methods">
          {METHODS.map((m) => (
            <label
              key={m.id}
              className={`lab-pick${m.requiresLLM ? " lab-pick--llm" : ""}`}
              title={m.requiresLLM ? "Braucht API-Key + Proxy" : m.kind}
            >
              <input
                type="checkbox"
                checked={selected.has(m.id)}
                disabled={m.requiresLLM}
                onChange={() => toggle(m.id)}
              />
              {m.label}
              {m.requiresLLM && <span className="lab-llm-tag">Key</span>}
            </label>
          ))}
        </div>
        <div className="lab-run-row">
          <label className="lab-num">
            Batch
            <input
              type="number"
              min={1}
              max={12}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
            />
          </label>
          <label className="lab-num">
            Seed
            <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} />
          </label>
          <button className="btn btn-iterate" type="button" onClick={doRun}>
            Run ▷
          </button>
        </div>
      </div>

      {run && (
        <div className="lab-matrix">
          <div className="lab-row lab-row--head">
            <div className="lab-rowhead" />
            {PRESETS.map((b) => (
              <div className="lab-colhead" key={b.id}>
                {b.label}
              </div>
            ))}
          </div>
          {run.methodIds.map((mid) => {
            const method = METHODS.find((m) => m.id === mid)!;
            return (
              <div className="lab-row" key={mid}>
                <div className="lab-rowhead">{method.label}</div>
                {PRESETS.map((b) => {
                  const cell = run.cells[mid]?.[b.id];
                  if (!cell) return <div className="lab-cell" key={b.id} />;
                  return (
                    <div className="lab-cell" key={b.id}>
                      <div className="lab-metrics">
                        <span className="metric" title="Kohärenz">
                          K {pct(cell.metrics.coherence)}
                        </span>
                        <span className="metric" title="Diversität">
                          D {cell.metrics.diversity.toFixed(2)}
                        </span>
                      </div>
                      {cell.cards.map((c) => (
                        <div className="lab-card" key={c.id}>
                          <span className={`lab-coh${c.coherence.ok ? " lab-coh--ok" : ""}`} />
                          <div className="lab-card-body">
                            <span
                              className="lab-card-leit"
                              style={{ fontFamily: c.typography.display.family }}
                            >
                              {c.leitwert}
                            </span>
                            <span className="lab-card-note">{c.origin.engineNote}</span>
                          </div>
                          <span className="lab-swatches">
                            {c.palette.map((p, i) => (
                              <span className="mini-swatch" key={i} style={{ background: p }} />
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

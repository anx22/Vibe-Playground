/** Speed-to-Direction — the North Star (E-014) as a playful gauge, not generic XP. */
export function Tacho({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const R = 18;
  const circ = 2 * Math.PI * R;
  const arc = (pct / 100) * circ * 0.75; // 270° sweep
  return (
    <div className="tacho" title="Speed to credible direction">
      <svg viewBox="0 0 48 48" width="40" height="40">
        <circle
          cx="24"
          cy="24"
          r={R}
          className="tacho-track"
          strokeDasharray={`${circ * 0.75} ${circ}`}
          transform="rotate(135 24 24)"
        />
        <circle
          cx="24"
          cy="24"
          r={R}
          className="tacho-fill"
          strokeDasharray={`${arc} ${circ}`}
          transform="rotate(135 24 24)"
        />
      </svg>
      <span className="tacho-val">{Math.round(pct)}</span>
    </div>
  );
}

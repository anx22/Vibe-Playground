import type { AxisVector } from "../engine";
import { AXES, POLES } from "../engine";
import { useTweenVector } from "../hooks/useTweenVector";

const SIZE = 320;
const C = SIZE / 2;
const R = 122;

const angleOf = (i: number) => (-90 + i * (360 / AXES.length)) * (Math.PI / 180);
const frac = (val: number) => 0.16 + 0.84 * ((val + 1) / 2);

function pointAt(i: number, radius: number): [number, number] {
  const a = angleOf(i);
  return [C + Math.cos(a) * radius, C + Math.sin(a) * radius];
}

function polygon(vector: AxisVector, mul: number, extra = 0): string {
  return AXES.map((ax, i) => {
    const r = Math.min(R, frac(vector[ax]) * R + extra);
    return pointAt(i, r * mul).join(",");
  }).join(" ");
}

export function Pentagon({
  vector,
  spread,
  idle,
}: {
  vector: AxisVector;
  spread: number;
  idle: boolean;
}) {
  const v = useTweenVector(vector);

  return (
    <div className={`pentagon-wrap${idle ? " pentagon-wrap--idle" : ""}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pentagon" aria-hidden>
        {/* grid rings */}
        {[0.34, 0.67, 1].map((g) => (
          <polygon
            key={g}
            points={AXES.map((_, i) => pointAt(i, R * g).join(",")).join(" ")}
            className="pentagon-ring"
          />
        ))}
        {/* spokes */}
        {AXES.map((_, i) => {
          const [x, y] = pointAt(i, R);
          return <line key={i} x1={C} y1={C} x2={x} y2={y} className="pentagon-spoke" />;
        })}
        {/* spread cloud — variance of the next batch */}
        <polygon points={polygon(v, 1, spread * 0.3 * R)} className="pentagon-cloud" />
        {/* the vector shape */}
        <polygon points={polygon(v, 1)} className="pentagon-vector" />
        {/* vertices */}
        {AXES.map((ax, i) => {
          const [x, y] = pointAt(i, frac(v[ax]) * R);
          return <circle key={ax} cx={x} cy={y} r={4.5} className="pentagon-node" />;
        })}
      </svg>
      {AXES.map((ax, i) => {
        const [x, y] = pointAt(i, R + 26);
        return (
          <div
            key={ax}
            className="axis-label"
            style={{ left: `${(x / SIZE) * 100}%`, top: `${(y / SIZE) * 100}%` }}
          >
            <span className="axis-name">{ax}</span>
            <span className="axis-pole">
              {v[ax] >= 0 ? POLES[ax].pos : POLES[ax].neg}
            </span>
          </div>
        );
      })}
    </div>
  );
}

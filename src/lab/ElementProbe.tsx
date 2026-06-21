import "./lab.css";

/**
 * Element-Probe — bespoke component for one extracted design element.
 * A tactile sample tile: a layer-specific motif on a tinted surface, plus the
 * layer label and the concrete element text. Meant to scatter/compose freely.
 */
type El = { layer: string; element: string; why?: string };

function Motif({ layer, pal }: { layer: string; pal: [string, string, string] }) {
  const d = pal[1];
  const L = layer.toLowerCase();
  const common = { className: "emotif", viewBox: "0 0 100 56", preserveAspectRatio: "none", "aria-hidden": true } as const;

  if (L.startsWith("material"))
    return (
      <svg {...common}>
        <g stroke={d} strokeWidth="0.7" fill="none" opacity="0.45" strokeLinecap="round">
          <path d="M8 18 L34 24 L50 14 M34 24 L40 42 M50 14 L74 22 L92 16" />
          <path d="M14 46 L40 40 L66 48 M40 40 L46 28" />
        </g>
      </svg>
    );
  if (L.startsWith("form"))
    return <svg {...common}><path d="M36 11 L64 11 L55 41 Q50 48 45 41 Z" fill={d} opacity="0.82" /></svg>;
  if (L.startsWith("layout") || L.startsWith("anordnung"))
    return (
      <svg {...common}>
        <g fill={d} opacity="0.5">
          {[20, 40, 60, 80].flatMap((x) => [18, 38].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" />))}
        </g>
      </svg>
    );
  if (L.startsWith("bewegung"))
    return (
      <svg {...common}>
        <g stroke={d} strokeWidth="2.2" fill="none" opacity="0.68" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 38 Q28 12 46 32 T84 26" />
          <path d="M79 20 L86 26 L80 32" />
        </g>
      </svg>
    );
  if (L.startsWith("farbe"))
    return (
      <svg {...common}>
        <rect x="0" y="0" width="33.34" height="56" fill={pal[0]} />
        <rect x="33.33" y="0" width="33.34" height="56" fill={pal[1]} />
        <rect x="66.66" y="0" width="33.34" height="56" fill={pal[2]} />
      </svg>
    );
  return null;
}

export function ElementProbe({ el, palette }: { el: El; palette: [string, string, string] }) {
  const isColor = el.layer.toLowerCase().startsWith("farbe");
  return (
    <div className="eprobe">
      <div
        className="eprobe-surface"
        style={isColor ? undefined : { background: `linear-gradient(135deg, ${palette[2]}, ${palette[0]})` }}
      >
        <Motif layer={el.layer} pal={palette} />
      </div>
      <div className="eprobe-body">
        <div className="eprobe-layer">{el.layer}</div>
        <div className="eprobe-text">{el.element}</div>
      </div>
    </div>
  );
}

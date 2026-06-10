import { useState, type ReactNode } from "react";

/** Custom collapser — the Herkunft drawer is the bridge to Advanced (E-020). */
export function Collapser({
  label,
  children,
  onToggle,
}: {
  label: string;
  children: ReactNode;
  onToggle?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`collapser${open ? " collapser--open" : ""}`}>
      <button
        type="button"
        className="collapser-head"
        onClick={() => {
          const next = !open;
          setOpen(next);
          onToggle?.(next);
        }}
      >
        <span className="collapser-chevron">›</span>
        {label}
      </button>
      {open && <div className="collapser-body">{children}</div>}
    </div>
  );
}

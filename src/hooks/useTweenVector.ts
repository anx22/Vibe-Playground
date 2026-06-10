import { useEffect, useRef, useState } from "react";
import type { AxisVector } from "../engine";
import { AXES, zero } from "../engine";

/** Eased interpolation toward a target vector — gives the pentagon its spring. */
export function useTweenVector(target: AxisVector, k = 0.18): AxisVector {
  const [value, setValue] = useState<AxisVector>(target);
  const cur = useRef<AxisVector>(target);
  const key = AXES.map((a) => target[a].toFixed(3)).join(",");

  useEffect(() => {
    let raf = 0;
    const step = () => {
      const next = zero();
      let moving = false;
      for (const ax of AXES) {
        const d = target[ax] - cur.current[ax];
        next[ax] = cur.current[ax] + d * k;
        if (Math.abs(d) > 0.001) moving = true;
      }
      cur.current = next;
      setValue(next);
      if (moving) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, k]);

  return value;
}

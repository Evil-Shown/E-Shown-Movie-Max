"use client";

import { useEffect, useState } from "react";

export function useCountUp(
  end: number,
  enabled: boolean,
  duration = 1200,
  decimals = 0
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, enabled, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}

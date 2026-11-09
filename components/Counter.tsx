"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/format";

/** Ekranga kirganda 0 dan qiymatgacha sanaydi. Serverda yakuniy raqam chiziladi (SEO, JSsiz). */
export function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - start) / 1600);
        setShown(Math.round(value * (1 - Math.pow(1 - k, 4))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    // Ko'rinmay turib 0 ga tushiramiz, keyin sanaladi
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) setShown(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{formatNumber(shown)}</span>;
}

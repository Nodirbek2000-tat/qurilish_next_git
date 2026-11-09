"use client";

import { useEffect } from "react";

/**
 * [data-tilt] — sichqoncha bilan 3D egilish. Bitta umumiy tinglovchi (event delegation),
 * DOM skan qilinmaydi. Scroll animatsiyalari esa sof CSS'da (globals.css).
 */
export function Effects() {
  useEffect(() => {
    const ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;
    let current: HTMLElement | null = null;

    const reset = (el: HTMLElement) => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--tilt-speed", "0.6s");
    };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-tilt]");
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const max = Number(el.dataset.tilt) || 6;
      el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * max}deg`);
      el.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * max}deg`);
      el.style.setProperty("--tilt-speed", "0.12s");
    };
    const onLeave = () => current && reset(current);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}

"use client";

import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { getImageProps } from "next/image";
import type { PageFlip } from "page-flip";
import { useEffect, useRef, useState } from "react";

export type CatalogPage = { src: string; w: number | null; h: number | null };

/**
 * Katalogni kitobdek varaqlash: sahifa burchagidan tortib, bosib, ← → tugmalari yoki pastdagi chiziq bilan.
 * Kompyuterda ikki sahifa yonma-yon, telefonda bitta sahifa. Muqova (1-sahifa) yolg'iz ochiladi.
 */
export function Flipbook({ pages, title }: { pages: CatalogPage[]; title: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const book = useRef<PageFlip | null>(null);
  const [page, setPage] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);

  const total = pages.length;
  const w = pages[0]?.w || 1400;
  const h = pages[0]?.h || 990;

  useEffect(() => {
    const el = host.current;
    if (!el || !total) return;
    let cancelled = false;
    // page-flip destroy() o'z ildizini DOM dan olib tashlaydi — shuning uchun ildizni React emas, o'zimiz yaratamiz
    const root = document.createElement("div");
    root.style.visibility = "hidden"; // kitob yig'ilguncha sahifalar ustma-ust ko'rinmasin
    el.appendChild(root);
    const items = pages.map((p, i) => {
      const item = document.createElement("div");
      item.style.background = "#fff";
      if (i === 0 || i === total - 1) item.dataset.density = "hard"; // muqovalar qattiq varaq
      const { props } = getImageProps({
        src: p.src, alt: `${title} — ${i + 1}-sahifa`, width: p.w || w, height: p.h || h,
        sizes: "(min-width: 768px) 50vw, 100vw", quality: 82,
      });
      const img = document.createElement("img");
      img.src = props.src;
      if (props.srcSet) img.srcset = props.srcSet;
      if (props.sizes) img.sizes = props.sizes;
      img.alt = props.alt;
      img.draggable = false;
      img.decoding = "async";
      img.loading = i < 4 ? "eager" : "lazy";
      img.style.cssText = "display:block;width:100%;height:100%;object-fit:cover;user-select:none;pointer-events:none";
      item.appendChild(img);
      root.appendChild(item);
      return item;
    });
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("page-flip").then(({ PageFlip }) => {
      if (cancelled) return;
      const pf = new PageFlip(root, {
        width: w, height: h, size: "stretch", minWidth: 220, maxWidth: 2400, minHeight: 160, maxHeight: 2400,
        showCover: true, usePortrait: true, mobileScrollSupport: true, showPageCorners: true,
        maxShadowOpacity: 0.4, flippingTime: reduce ? 1 : 850,
      });
      pf.loadFromHTML(items);
      pf.on("flip", (e) => setPage(e.data));
      pf.on("changeOrientation", (e) => setPortrait(e.data === "portrait"));
      book.current = pf;
      root.style.visibility = "";
      setPortrait(pf.getOrientation() === "portrait");
      setReady(true);
    });

    return () => {
      cancelled = true;
      book.current?.destroy();
      book.current = null;
      root.remove();
    };
  }, [pages, title, total, w, h]);

  // To'liq ekran: kirish/chiqishda kitob o'lchamini qayta hisoblaymiz
  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  useEffect(() => {
    const id = requestAnimationFrame(() => book.current?.update());
    return () => cancelAnimationFrame(id);
  }, [full, portrait]);

  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : frame.current?.requestFullscreen());
  const go = (to: number) => {
    book.current?.turnToPage(to);
    setPage(to);
  };

  const spread = !portrait && page > 0 && page < total - 1;
  const label = spread ? `${page + 1}–${Math.min(page + 2, total)}` : `${page + 1}`;
  const ratio = (portrait ? w : 2 * w) / h; // ochiq kitobning eni/bo'yi
  const btn = "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-current/15 transition-colors hover:bg-current/10 disabled:opacity-30";

  return (
    <div ref={frame} tabIndex={0} aria-label={`${title} katalogi`}
         onKeyDown={(e) => {
           if (e.key === "ArrowRight") book.current?.flipNext();
           if (e.key === "ArrowLeft") book.current?.flipPrev();
         }}
         className={`outline-none ${full ? "flex flex-col items-center justify-center gap-6 bg-night p-6 text-white" : ""}`}>
      <div className="mx-auto w-full" style={{ maxWidth: `min(100%, calc(${full ? "100vh - 140px" : "78vh"} * ${ratio.toFixed(3)}))` }}>
        <div ref={host} className="relative" style={ready ? undefined : { aspectRatio: `${2 * w} / ${h}` }}>
          {!ready && <div className="absolute inset-0 animate-pulse rounded-[8px] bg-current/5" aria-hidden="true" />}
        </div>
      </div>

      <div className={`mx-auto mt-6 flex w-full max-w-xl items-center gap-3 ${full ? "mt-0" : ""}`}>
        <button type="button" className={btn} onClick={() => book.current?.flipPrev()} disabled={page === 0} aria-label="Oldingi sahifa">
          <ChevronLeft size={18} />
        </button>
        <span className="w-20 shrink-0 text-center text-sm font-semibold tabular-nums">{label} / {total}</span>
        <input type="range" min={0} max={Math.max(total - 1, 0)} value={page} onChange={(e) => go(Number(e.target.value))}
               aria-label="Sahifaga o'tish" className="h-1 min-w-0 flex-1 cursor-pointer accent-[var(--accent)]" />
        <button type="button" className={btn} onClick={() => book.current?.flipNext()} disabled={page >= total - (spread ? 2 : 1)} aria-label="Keyingi sahifa">
          <ChevronRight size={18} />
        </button>
        <button type="button" className={btn} onClick={toggleFull} aria-label={full ? "To'liq ekrandan chiqish" : "To'liq ekran"}>
          {full ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
      </div>
    </div>
  );
}

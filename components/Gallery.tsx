"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export function Gallery({ items, title }: { items: { src: string; caption?: string }[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {items.map((it, i) => (
          <button
            key={it.src}
            onClick={() => setOpen(i)}
            className={`zoom-img relative overflow-hidden rounded-[18px] bg-sand ${i % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
            data-reveal
            style={{ "--d": i % 4 } as React.CSSProperties}
            aria-label={`${title} — ${i + 1}-rasmni kattalashtirish`}
          >
            <Image src={it.src} alt={it.caption || title} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-night/95 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(null)}>
          <div className="relative h-[80vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image key={items[open].src} src={items[open].src} alt={items[open].caption || title} fill sizes="100vw" className="page-enter object-contain" />
          </div>
          {items[open].caption && <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70">{items[open].caption}</p>}
          <button onClick={() => setOpen(null)} className="absolute top-5 right-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20" aria-label="Yopish">×</button>
          {items.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Oldingi">‹</button>
              <button onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Keyingi">›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

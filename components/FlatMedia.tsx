"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Item = { src: string; caption?: string; plan?: boolean };

/**
 * Xonadon sahifasi: katta rasm + pastda kichik rasmlar (reja va xonadon rasmlari).
 * Rasm bosilsa — butun ekranga ochiladi (←/→, Esc). Sichqoncha bilan yengil 3D egiladi.
 */
export function FlatMedia({ plan, photos, alt, fallback, children }: {
  plan: string | null; photos: { src: string; caption?: string }[]; alt: string;
  fallback: React.ReactNode; children?: React.ReactNode;
}) {
  const items: Item[] = [...(plan ? [{ src: plan, caption: "Xonadon rejasi", plan: true }] : []), ...photos];
  // Rasmlar bo'lsa — birinchi bo'lib chiroyli rasm ko'rinsin, reja keyingi
  const [i, setI] = useState(plan && photos.length ? 1 : 0);
  const [full, setFull] = useState(false);
  const n = items.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const card = useRef<HTMLDivElement>(null);

  // Yengil 3D: faqat sichqonchada, ko'pi bilan ±3° (render qilmasdan — CSS o'zgaruvchilari orqali)
  const tilt = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
  };
  const untilt = () => { card.current?.style.removeProperty("--rx"); card.current?.style.removeProperty("--ry"); };

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [full, go]);

  if (!n) {
    return (
      <div className="tilt tilt-shadow relative overflow-hidden rounded-[30px] border border-line bg-card p-6 md:p-12">
        <div className="relative aspect-[4/3]">{fallback}</div>
        <p className="mt-4 text-center text-xs text-muted">Sxematik reja. Aniq rejani menejerdan so&apos;rang.</p>
        {children}
      </div>
    );
  }

  const cur = items[i];
  const arrow = "grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#14171a] shadow-lg backdrop-blur transition hover:scale-105";

  return (
    <div>
      <div ref={card} onPointerMove={tilt} onPointerLeave={untilt}
           className={`tilt tilt-shadow group relative overflow-hidden rounded-[30px] border border-line ${cur.plan ? "bg-white" : "bg-sand"}`}>
        <button type="button" onClick={() => setFull(true)} aria-label="Kattalashtirish" className="relative block aspect-[4/3] w-full cursor-zoom-in">
          <Image key={cur.src} src={cur.src} alt={cur.caption || alt} fill preload={i === (plan && photos.length ? 1 : 0)}
                 sizes="(min-width: 1024px) 58vw, 100vw"
                 className={`page-enter ${cur.plan ? "object-contain p-4 md:p-6" : "object-cover"}`} />
        </button>
        {cur.caption && !cur.plan && (
          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/55 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur">{cur.caption}</span>
        )}
        <span className="pointer-events-none absolute right-4 bottom-4 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"><Expand size={16} /></span>
        {n > 1 && (
          <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
            <button type="button" onClick={() => go(-1)} aria-label="Oldingi" className={`pointer-events-auto ${arrow}`}><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Keyingi" className={`pointer-events-auto ${arrow}`}><ChevronRight size={20} /></button>
          </div>
        )}
        {children}
      </div>

      {n > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {items.map((it, k) => (
            <button key={it.src} type="button" onClick={() => setI(k)} aria-label={it.caption || `Rasm ${k + 1}`} aria-current={k === i}
                    className={`relative h-[68px] w-[92px] shrink-0 overflow-hidden rounded-[14px] border-2 transition-all ${k === i ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"} ${it.plan ? "bg-card" : "bg-sand"}`}>
              <Image src={it.src} alt="" fill sizes="92px" className={it.plan ? "object-contain p-1.5" : "object-cover"} />
              {it.plan && <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-semibold text-white">Reja</span>}
            </button>
          ))}
        </div>
      )}

      {/* Portal: ota elementdagi animatsiya (transform) «fixed»ni qutiga qamab qo'ymasin */}
      {full && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" onClick={() => setFull(false)}>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-white/70 tabular-nums">{i + 1} / {n}{cur.caption ? ` · ${cur.caption}` : ""}</span>
            <button type="button" onClick={() => setFull(false)} aria-label="Yopish" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X size={20} /></button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image key={cur.src} src={cur.src} alt={cur.caption || alt} fill sizes="100vw"
                   className={`page-enter object-contain ${cur.plan ? "bg-white p-6" : ""}`} />
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Oldingi" className={`absolute top-1/2 left-4 -translate-y-1/2 ${arrow}`}><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => go(1)} aria-label="Keyingi" className={`absolute top-1/2 right-4 -translate-y-1/2 ${arrow}`}><ChevronRight size={20} /></button>
              </>
            )}
          </div>
          <div className="h-6" />
        </div>,
        document.body,
      )}
    </div>
  );
}

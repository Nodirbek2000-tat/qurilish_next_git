"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Site } from "@/lib/api";
import { useReducedMotion } from "@/lib/useReducedMotion";

const DELAY = 5000;

/** «Kompaniyaning faoliyati»: mukofot/yutuq kartochkalari; pastdagi yil bosilsa — o'sha yilga o'tadi. O'zi suriladi. */
export function ActivityCarousel({ items }: { items: Site["activities"] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const years = [...new Set(items.map((a) => a.year))];
  const n = items.length;

  const step = () => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + parseFloat(getComputedStyle(el!).columnGap || "0") : 0;
  };
  const scrollTo = (k: number) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.min(Math.max(k, 0) * step(), max), behavior: reduced ? "auto" : "smooth" });
  };
  const atEnd = () => {
    const el = track.current;
    return !el || el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
  };

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const t = setTimeout(() => scrollTo(atEnd() ? 0 : active + 1), DELAY);
    return () => clearTimeout(t);
  });

  const nav = "grid h-12 w-12 place-items-center rounded-full border border-line bg-card transition-colors hover:border-ink";
  const activeYear = items[active]?.year;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow" data-reveal>Yutuqlar</p>
          <h2 className="h-display mt-4 text-[clamp(34px,5vw,64px)]" data-reveal>Kompaniyaning faoliyati</h2>
        </div>
        {n > 1 && (
          <div className="flex shrink-0 gap-2">
            <button type="button" className={nav} onClick={() => scrollTo(active - 1)} aria-label="Oldingi"><ChevronLeft size={18} /></button>
            <button type="button" className={nav} onClick={() => scrollTo(atEnd() ? 0 : active + 1)} aria-label="Keyingi"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      <div ref={track} onScroll={(e) => { const s = step(); if (s) setActive(Math.round(e.currentTarget.scrollLeft / s)); }}
           className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none]">
        {items.map((a, k) => (
          <article key={`${a.year}-${k}`}
                   className="flex min-h-[280px] w-[85%] shrink-0 snap-start flex-col justify-between gap-8 rounded-[24px] border border-line bg-card p-7 sm:w-[calc(50%-8px)] lg:w-[calc((100%-32px)/3)]">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-muted">{a.organization}</p>
              <span className="shrink-0 rounded-full border border-line px-3.5 py-1 text-sm font-semibold tabular-nums">{a.year}</span>
            </div>
            {a.image && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-sand">
                <Image src={a.image} alt={a.title} fill sizes="(min-width: 1024px) 30vw, 85vw" className="object-cover" />
              </div>
            )}
            <h3 className="text-xl leading-snug font-semibold tracking-tight md:text-2xl">{a.title}</h3>
          </article>
        ))}
      </div>

      {years.length > 1 && (
        <div className="mt-4 overflow-x-auto rounded-[22px] border border-line bg-card px-4 [scrollbar-width:none] sm:px-8">
          <ol className="flex min-w-max justify-between gap-8">
            {years.map((y) => (
              <li key={y}>
                <button type="button" onClick={() => scrollTo(items.findIndex((a) => a.year === y))} aria-current={y === activeYear}
                        className={`relative block py-5 text-lg tabular-nums transition-colors ${y === activeYear ? "text-accent" : "text-muted hover:text-ink"}`}>
                  <span className={`absolute inset-x-0 top-0 h-0.5 ${y === activeYear ? "bg-accent" : "bg-line"}`} />
                  {y}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

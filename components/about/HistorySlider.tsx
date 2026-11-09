"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Site } from "@/lib/api";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { FacadeSketch } from "../Decor";

const DELAY = 6000; // avtomatik o'tish, ms

/** «Kompaniya tarixi»: rasm + voqea + katta yil; pastda yillar. O'zi aylanadi, kursor ustida — to'xtaydi. */
export function HistorySlider({ items }: { items: Site["milestones"] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const n = items.length;
  const go = (to: number) => setI(((to % n) + n) % n);

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const t = setTimeout(() => setI((v) => (v + 1) % n), DELAY);
    return () => clearTimeout(t);
  }, [i, paused, reduced, n]);

  if (!n) return null;
  const m = items[i];
  const auto = !paused && !reduced && n > 1;
  const nav = "grid h-12 w-12 place-items-center rounded-full border border-line bg-card transition-colors hover:border-ink disabled:opacity-30";

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow" data-reveal>Tarix</p>
          <h2 className="h-display mt-4 text-[clamp(34px,5vw,64px)]" data-reveal>Kompaniya tarixi</h2>
        </div>
        {n > 1 && (
          <div className="flex shrink-0 gap-2">
            <button type="button" className={nav} onClick={() => go(i - 1)} aria-label="Oldingi yil"><ChevronLeft size={18} /></button>
            <button type="button" className={nav} onClick={() => go(i + 1)} aria-label="Keyingi yil"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      <div key={i} className="page-enter mt-10 grid overflow-hidden rounded-[28px] border border-line bg-card lg:grid-cols-[1.15fr_1fr]" aria-live="polite">
        <div className="relative min-h-[260px] overflow-hidden bg-sand sm:min-h-[360px]">
          {m.image
            ? <Image src={m.image} alt={m.title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            : <FacadeSketch className="absolute inset-x-6 bottom-0 w-[calc(100%-3rem)] text-ink/25" />}
        </div>
        <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
          <div>
            <h3 className="text-2xl leading-snug font-semibold tracking-tight md:text-3xl">{m.title}</h3>
            {m.text && <p className="mt-4 max-w-md leading-relaxed text-muted">{m.text}</p>}
          </div>
          <p className="h-display text-[clamp(64px,9vw,140px)] leading-none text-accent tabular-nums">{m.year}</p>
        </div>
      </div>

      {n > 1 && (
        <div className="mt-4 overflow-x-auto rounded-[22px] border border-line bg-card px-4 [scrollbar-width:none] sm:px-8">
          <ol className="flex min-w-max justify-between gap-8">
            {items.map((it, k) => (
              <li key={`${it.year}-${k}`}>
                <button type="button" onClick={() => go(k)} aria-current={k === i}
                        className={`relative block py-5 text-lg tabular-nums transition-colors ${k === i ? "text-accent" : "text-muted hover:text-ink"}`}>
                  <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-line">
                    {k === i && <span key={`${i}-${auto}`} className={`block h-full bg-accent ${auto ? "history-progress" : ""}`} style={{ animationDuration: `${DELAY}ms` }} />}
                  </span>
                  {it.year}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

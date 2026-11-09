"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { title: string; text: string; image: string };
const DELAY = 6000;

/** «Ichki makon»: rasmlar o'zi almashadi, orqa fonda joriy rasm xira ko'rinadi. Sichqoncha ustida — pauza. */
export function InteriorSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    if (paused || n < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(t);
  }, [i, paused, n, go]);

  const s = slides[i];
  return (
    <div
      className="relative overflow-hidden rounded-[32px] bg-night text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      {/* Xira orqa fon */}
      {slides.map((sl, k) => (
        <div key={sl.image} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? "opacity-100" : "opacity-0"}`}>
          <Image src={sl.image} alt="" fill sizes="40vw" quality={30} className="scale-125 object-cover blur-3xl" />
        </div>
      ))}
      <div className="absolute inset-0 bg-night/60" />

      <div className="relative grid gap-8 p-6 md:p-12 lg:grid-cols-[0.8fr_1.4fr] lg:items-center">
        <div className="lg:pr-6">
          <p className="eyebrow !text-white/50">Ichki makon</p>
          <div key={i} className="page-enter">
            <h3 className="h-display mt-5 text-[clamp(30px,3.6vw,52px)]">{s.title}</h3>
            {s.text && <p className="mt-5 max-w-md leading-relaxed text-white/70">{s.text}</p>}
          </div>
          <div className="mt-10 flex items-center gap-4">
            <button type="button" onClick={() => go(-1)} aria-label="Oldingi" className="grid h-14 w-14 place-items-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-[#14171a]"><ChevronLeft /></button>
            <button type="button" onClick={() => go(1)} aria-label="Keyingi" className="grid h-14 w-14 place-items-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-[#14171a]"><ChevronRight /></button>
            <span className="ml-2 font-semibold tabular-nums">
              {String(i + 1).padStart(2, "0")}<span className="text-white/40"> / {String(n).padStart(2, "0")}</span>
            </span>
          </div>
          {/* Taymer chizig'i */}
          <div className="mt-6 h-0.5 w-40 overflow-hidden rounded-full bg-white/15">
            <span key={`${i}-${paused}`} className="block h-full origin-left bg-accent"
                  style={{ animation: paused ? "none" : `fill-x ${DELAY}ms linear forwards`, transform: paused ? "scaleX(0)" : undefined }} />
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-[22px]">
          {slides.map((sl, k) => (
            <div key={sl.image} className={`absolute inset-0 transition-all duration-1000 ease-out-soft ${
              k === i ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}>
              <Image src={sl.image} alt={sl.title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" preload={k === 0} />
            </div>
          ))}
        </div>
      </div>

      {/* Keyingi rasmning kichik ko'rinishi (desktop) */}
      <div className="relative hidden gap-3 px-12 pb-10 lg:flex">
        {slides.map((sl, k) => (
          <button key={sl.image} type="button" onClick={() => setI(k)} aria-label={sl.title}
                  className={`relative h-16 w-24 overflow-hidden rounded-xl transition-all duration-500 ${k === i ? "ring-2 ring-accent" : "opacity-50 hover:opacity-100"}`}>
            <Image src={sl.image} alt="" fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

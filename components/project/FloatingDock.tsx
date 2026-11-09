"use client";

import { MessageSquareText, Rotate3d, X } from "lucide-react";
import { useEffect, useState } from "react";

/** O'ng chetdagi suzuvchi tugmalar: jonli kamera, 3D tur, so'rov formasi. */
export function FloatingDock({ liveUrl, tourUrl, title }: { liveUrl: string; tourUrl: string; title: string }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!live) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLive(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [live]);

  const btn = "relative grid h-14 w-14 place-items-center rounded-full border-2 border-white/80 bg-night text-white shadow-xl transition-transform duration-300 hover:scale-110";
  return (
    <>
      <div className="fixed right-3 bottom-6 z-40 flex flex-col gap-3 md:right-5">
        {liveUrl && (
          <button type="button" onClick={() => setLive(true)} className={btn} aria-label="Qurilish jonli efirda">
            <span className="text-[11px] font-black tracking-wider">LIVE</span>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-[#ff4d3d]" />
          </button>
        )}
        {tourUrl && (
          <a href={tourUrl} target="_blank" rel="noopener noreferrer" className={btn} aria-label="3D tur — 360°">
            <span className="flex flex-col items-center leading-none"><Rotate3d size={18} /><span className="mt-0.5 text-[9px] font-bold">360</span></span>
          </a>
        )}
        <a href="#sorov" className={`${btn} !bg-accent !text-on-accent`} aria-label="So'rov qoldirish">
          <MessageSquareText size={20} />
        </a>
      </div>

      {live && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-night/90 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label={`${title} — jonli kamera`} onClick={() => setLive(false)}>
          <div className="page-enter relative aspect-video w-full max-w-5xl overflow-hidden rounded-[24px] bg-black" onClick={(e) => e.stopPropagation()}>
            <iframe src={liveUrl} title={`${title} — jonli kamera`} allowFullScreen referrerPolicy="no-referrer"
                    sandbox="allow-scripts allow-same-origin allow-presentation" className="absolute inset-0 h-full w-full border-0" />
            <span className="pointer-events-none absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4d3d]" /> JONLI
            </span>
          </div>
          <button type="button" onClick={() => setLive(false)} aria-label="Yopish" className="absolute top-5 right-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X /></button>
        </div>
      )}
    </>
  );
}

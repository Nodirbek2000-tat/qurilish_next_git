"use client";

import { PhoneCall, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GirihPattern } from "./Decor";
import { LeadForm } from "./LeadForm";

/**
 * Sarlavhadagi dumaloq qo'ng'iroq tugmasi → «Ariza» oynasi (ism + telefon).
 * Oyna document.body ga chiqariladi: sarlavhaning backdrop-blur'i fixed elementlarni o'ziga «qamab» qo'ymasin.
 */
export function RequestButton() {
  const [open, setOpen] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    card.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Ariza qoldirish"
              className="group relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_22%,transparent)] transition-transform hover:scale-105">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-20 [animation-duration:2.4s]" aria-hidden="true" />
        <PhoneCall size={18} className="relative transition-transform group-hover:rotate-12" />
      </button>

      {open && createPortal(
        <div className="modal-backdrop fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-night/70 p-4 backdrop-blur-sm"
             onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div ref={card} role="dialog" aria-modal="true" aria-labelledby="ariza-title" tabIndex={-1}
               className="modal-card relative w-full max-w-md overflow-hidden rounded-[28px] bg-card p-7 text-ink shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)] outline-none sm:p-10">
            <GirihPattern id="girih-ariza" className="inset-x-0 top-0 h-40 w-full text-accent/[0.14] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <button type="button" onClick={() => setOpen(false)} aria-label="Yopish"
                    className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-line bg-card transition-colors hover:border-ink">
              <X size={18} />
            </button>
            <div className="relative text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-on-accent"><PhoneCall size={22} /></span>
              <h2 id="ariza-title" className="h-display mt-5 text-[40px]">Ariza</h2>
              <p className="mx-auto mt-3 max-w-xs text-muted">Kontaktlaringizni qoldiring — menejerimiz sizga batafsil ma&apos;lumot beradi.</p>
            </div>
            <div className="relative mt-8">
              <LeadForm source="ariza" stack submitLabel="Yuborish" />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

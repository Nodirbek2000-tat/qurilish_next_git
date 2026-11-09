"use client";

import { Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteProject } from "@/app/(panel)/[panel]/actions";

/** Loyihani butunlay o'chirish: bloklar, xonadonlar, rasmlar ham ketadi — shuning uchun nomini yozib tasdiqlanadi. */
export function DeleteProject({ id, title, flats }: { id: number; title: string; flats: number }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [busy, start] = useTransition();
  const ok = typed.trim() === title.trim();

  const close = () => { setOpen(false); setTyped(""); setError(""); };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
              className="btn h-11 border border-[#f3c9c2] bg-card text-sm text-[#c2412d] hover:bg-[#fdecea]">
        <Trash2 size={15} /> Loyihani o&apos;chirish
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-night/60 p-4 backdrop-blur-sm" onClick={() => !busy && close()}>
          <form className="page-enter w-full max-w-md rounded-[24px] bg-paper p-6 md:p-8" onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!ok) return;
                  start(async () => {
                    const res = await deleteProject(id);
                    if (res?.error) setError(res.error);
                  });
                }}>
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fdecea] text-[#c2412d]"><Trash2 size={20} /></span>
              <button type="button" onClick={close} disabled={busy} aria-label="Yopish" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand"><X size={17} /></button>
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">«{title}» o&apos;chirilsinmi?</h3>
            <p className="mt-3 leading-relaxed text-muted">
              Loyiha saytdan butunlay olib tashlanadi: rasmlar, katalog, bloklar
              {flats > 0 && <> va <b className="text-ink">{flats} ta xonadon</b></>} ham o&apos;chadi. Buni qaytarib bo&apos;lmaydi.
              Murojaatlar saqlanib qoladi.
            </p>
            <label className="mt-6 block text-sm text-muted">
              Tasdiqlash uchun loyiha nomini yozing: <b className="text-ink">{title}</b>
              <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus autoComplete="off"
                     className="mt-2 h-12 w-full rounded-xl border border-line bg-card px-4 text-ink outline-none focus:border-[#c2412d]" />
            </label>
            {error && <p className="mt-3 text-sm text-[#c2412d]">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={close} disabled={busy} className="btn btn-ghost h-11 text-sm">Bekor qilish</button>
              <button type="submit" disabled={!ok || busy}
                      className="btn h-11 bg-[#c2412d] text-sm text-white hover:bg-[#a83726] disabled:cursor-not-allowed disabled:opacity-40">
                {busy ? "O'chirilmoqda…" : "Ha, o'chirish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import { yandexMapSrc, yandexSearchMapSrc } from "@/lib/format";
import type { FieldSchema } from "@/lib/panel";
import { checkImage } from "./RecordForm";

/* ---------- Qayta ishlatiladigan qismlar ---------- */

type Slot = { url: string | null; kind: "image" | "video"; dirty: boolean };

/**
 * Rasm/video "o'z joyida": bosish yoki sudrab tashlash → o'lcham tekshiriladi → darhol ko'rinadi.
 * Fayl yashirin <input name=...> da qoladi va "Saqlash"da forma bilan birga ketadi.
 */
export function useMediaSlot(field: FieldSchema | undefined, initial: string | null, kind: "image" | "video" = "image", formId?: string) {
  const input = useRef<HTMLInputElement>(null);
  const [slot, setSlot] = useState<Slot>({ url: initial, kind, dirty: false });
  const [error, setError] = useState<string | null>(null);

  const accept = async (file: File | undefined) => {
    setError(null);
    if (!file || !input.current) return;
    const isVideo = kind === "video";
    if (isVideo ? !/^video\/(mp4|webm)$/.test(file.type) : !/^image\/(jpeg|png|webp)$/.test(file.type)) {
      return setError(isVideo ? "Faqat MP4 yoki WebM video" : "Faqat JPG, PNG yoki WebP rasm");
    }
    if (file.size > (isVideo ? 40 : 8) * 1048576) return setError(`Fayl juda katta. Chegara: ${isVideo ? 40 : 8} MB`);
    if (!isVideo && field?.size) {
      const problem = await checkImage(file, field.size);
      if (problem) { input.current.value = ""; return setError(problem); }
    }
    const dt = new DataTransfer();
    dt.items.add(file);
    input.current.files = dt.files; // sudrab tashlangan fayl ham formaga tushadi
    setSlot({ url: URL.createObjectURL(file), kind, dirty: true });
  };

  const reset = () => {
    if (input.current) input.current.value = "";
    setSlot({ url: initial, kind, dirty: false });
    setError(null);
  };

  const dropProps = {
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); accept(e.dataTransfer.files?.[0]); },
  };

  const hiddenInput = field ? (
    <input ref={input} type="file" name={field.name} form={formId} accept={field.accept} hidden onChange={(e) => accept(e.target.files?.[0])} />
  ) : null;

  return { slot, error, open: () => input.current?.click(), reset, dropProps, hiddenInput, hint: field?.help ?? "" };
}

/** Joyida tahrirlanadigan matn: ko'rinishi saytdagidek, sichqoncha borganda chegarasi chiqadi */
export const inline =
  "w-full rounded-lg bg-transparent outline-none transition-[box-shadow,background] duration-200 placeholder:text-current/40 " +
  "hover:bg-white/5 hover:shadow-[0_0_0_1px_rgb(255_255_255/0.35)] focus:bg-white/10 focus:shadow-[0_0_0_2px_var(--accent)]";
export const inlineDark =
  "w-full rounded-lg bg-transparent outline-none transition-[box-shadow,background] duration-200 placeholder:text-current/40 " +
  "hover:bg-black/5 hover:shadow-[0_0_0_1px_rgb(0_0_0/0.2)] focus:bg-black/5 focus:shadow-[0_0_0_2px_var(--accent)]";

export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return <p role="alert" className="page-enter rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-medium text-[#b3261e]">{text}</p>;
}

/* ---------- Koordinatalar: havola/matndan ajratish + xarita ko'rinishi ---------- */

const inUz = (lat: number, lng: number) => lat > 36 && lat < 46 && lng > 55 && lng < 74;

/**
 * Google/Yandex xarita havolasi yoki "39.65, 66.97" matnidan {lat, lng} ajratadi.
 * Yandex'da tartib teskari (lng,lat) — O'zbekiston chegarasi bo'yicha tekshirib, kerak bo'lsa almashtiriladi.
 */
export function parseCoords(text: string): { lat: number; lng: number } | null {
  const s = decodeURIComponent(text.trim());
  const pairs = [
    s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/), // Google: aniq nuqta
    s.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/), // Google: xarita markazi
    s.match(/(?:ll|pt|whatshere\[point\])=(-?\d+\.\d+),(-?\d+\.\d+)/), // Yandex (lng,lat)
    s.match(/(-?\d{1,3}\.\d+)\s*[,; ]\s*(-?\d{1,3}\.\d+)/), // oddiy juftlik
  ];
  for (const m of pairs) {
    if (!m) continue;
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    if (inUz(a, b)) return { lat: a, lng: b };
    if (inUz(b, a)) return { lat: b, lng: a };
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lng: b };
  }
  return null;
}

/** Kenglik/uzunlik maydonlari: havolani qo'yish bilan to'ldiriladi, nuqta darhol xaritada ko'rinadi */
export function LocationFields({
  lat, lng, query, formId, onDirty, errors, extra = [],
}: {
  lat: unknown; lng: unknown; query?: string; formId?: string; onDirty?: () => void;
  errors?: string[]; extra?: { lat: number; lng: number }[];
}) {
  const v = (x: unknown) => (x === null || x === undefined ? "" : String(x));
  const [la, setLa] = useState(v(lat));
  const [ln, setLn] = useState(v(lng));
  const [paste, setPaste] = useState("");
  const [bad, setBad] = useState(false);
  const point = la && ln && !isNaN(+la) && !isNaN(+ln) ? { lat: +la, lng: +ln } : null;
  const points = [...(point ? [point] : []), ...extra];
  const src = points.length ? yandexMapSrc(points, points.length > 1 ? 14 : 16) : query ? yandexSearchMapSrc(query, 14) : "";

  const apply = (text: string) => {
    setPaste(text);
    if (!text.trim()) return setBad(false);
    const c = parseCoords(text);
    setBad(!c);
    if (c) { setLa(c.lat.toFixed(6)); setLn(c.lng.toFixed(6)); onDirty?.(); }
  };
  const field = "h-11 w-full rounded-xl border border-line bg-card px-3 text-sm tabular-nums outline-none focus:border-accent";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        <label className="block text-sm font-semibold">
          Xarita havolasi yoki koordinata
          <input value={paste} onChange={(e) => apply(e.target.value)} placeholder="Google/Yandex havolasi yoki 39.654, 66.975"
                 className={`${field} mt-1.5 font-normal`} />
        </label>
        <p className={`text-xs ${bad ? "font-semibold text-[#c2412d]" : "text-muted"}`}>
          {bad ? "Koordinata topilmadi. Xaritada nuqtani bosib, havolani yoki «39.654, 66.975» ni qo'ying."
            : <>Yandex/Google xaritada joyni toping, nuqtani bosing va havolani shu yerga qo&apos;ying.{" "}
                <a href={`https://yandex.uz/maps/?text=${encodeURIComponent(query || "Samarqand")}`} target="_blank" rel="noreferrer" className="font-semibold text-accent underline">Xaritani ochish</a></>}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted">Kenglik (lat)
            <input form={formId} name="latitude" value={la} inputMode="decimal" onChange={(e) => { setLa(e.target.value); onDirty?.(); }} className={`${field} mt-1`} />
          </label>
          <label className="block text-xs text-muted">Uzunlik (lng)
            <input form={formId} name="longitude" value={ln} inputMode="decimal" onChange={(e) => { setLn(e.target.value); onDirty?.(); }} className={`${field} mt-1`} />
          </label>
        </div>
        {point && (
          <button type="button" onClick={() => { setLa(""); setLn(""); setPaste(""); onDirty?.(); }} className="text-xs font-semibold text-[#c2412d]">
            Nuqtani olib tashlash
          </button>
        )}
        {errors?.map((e) => <p key={e} className="text-sm font-medium text-[#c2412d]">{e}</p>)}
      </div>
      <div className="relative min-h-[240px] overflow-hidden rounded-[20px] border border-line bg-sand">
        {src
          ? <iframe key={src} src={src} title="Xarita" loading="lazy" className="absolute inset-0 h-full w-full border-0" />
          : <span className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">Nuqta kiritilsa, shu yerda xaritada ko&apos;rinadi</span>}
      </div>
    </div>
  );
}

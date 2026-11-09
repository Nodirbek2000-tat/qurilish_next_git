"use client";

/* Yandex Maps JS API 2.1. Kalit bo'lsa — kalit bilan, bo'lmasa kalitsiz yuklanadi.
   8 soniyada yuklanmasa null qaytadi (oddiy vidjetga o'tamiz). */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type YMaps = any;

const KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY ?? "";
let promise: Promise<YMaps | null> | null = null;

export function loadYmaps(): Promise<YMaps | null> {
  if (promise) return promise;
  promise = new Promise((resolve) => {
    const w = window as unknown as { ymaps?: YMaps };
    if (w.ymaps) return w.ymaps.ready(() => resolve(w.ymaps));
    const s = document.createElement("script");
    s.src = `https://api-maps.yandex.ru/2.1/?lang=uz_UZ${KEY ? `&apikey=${encodeURIComponent(KEY)}` : ""}`;
    s.async = true;
    const timer = setTimeout(() => resolve(null), 8000);
    s.onload = () => w.ymaps?.ready(() => { clearTimeout(timer); resolve(w.ymaps); });
    s.onerror = () => { clearTimeout(timer); resolve(null); };
    document.head.appendChild(s);
  });
  return promise;
}

// Serverda ham ishlatiladi — shuning uchun alohida faylda ("use client" siz)
export { esc, photoPinHtml } from "./pin";

/** Ikki nuqta orasidagi masofa, metr */
export function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const fmtDistance = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);

export const routeUrl = (lat: number, lng: number) => `https://yandex.uz/maps/?rtext=~${lat},${lng}&rtt=auto`;

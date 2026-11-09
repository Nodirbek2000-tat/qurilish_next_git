/** Xonadon filtri uchun ruxsat etilgan URL parametrlari. */
const KEYS = ["project", "rooms", "floor_min", "floor_max", "area_min", "area_max", "year", "kind", "sort", "page"];

export function flatQuery(sp: Record<string, string | string[] | undefined>, extra: Record<string, string> = {}) {
  const q = new URLSearchParams();
  for (const k of KEYS) {
    const v = sp[k];
    if (typeof v === "string" && v && v.length < 60) q.set(k, v);
  }
  for (const [k, v] of Object.entries(extra)) q.set(k, v);
  return q;
}

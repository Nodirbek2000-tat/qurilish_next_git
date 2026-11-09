const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}-${MONTHS[m - 1]}, ${y}`;
}

export function formatNumber(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Fon rangiga qarab o'qiladigan matn rangi (oq yoki qora). */
export function readableOn(hex: string): string {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#121417" : "#ffffff";
}

export function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

export function yandexMapSrc(points: { lat: number; lng: number }[], zoom = 15): string {
  if (!points.length) return "";
  const center = points.length === 1
    ? points[0]
    : {
        lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
        lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
      };
  const pt = points.length === 1
    ? `${points[0].lng},${points[0].lat},pm2rdm`
    : points.map((p, i) => `${p.lng},${p.lat},pm2rdl${i + 1}`).join("~");
  return `https://yandex.uz/map-widget/v1/?ll=${center.lng},${center.lat}&z=${zoom}&pt=${pt}&lang=uz_UZ`;
}

/** Xarita manzil bo'yicha (aniq nuqta kiritilmagan ofis uchun) */
export function yandexSearchMapSrc(query: string, zoom = 14): string {
  return `https://yandex.uz/map-widget/v1/?text=${encodeURIComponent(query)}&z=${zoom}&lang=uz_UZ`;
}

/** «Qanday yetib borish»: nuqta bo'lsa — aniq yo'l, bo'lmasa — Yandex'da manzil qidiruvi */
export function officeRouteUrl(o: { address: string; lat: number | null; lng: number | null }): string {
  return o.lat !== null && o.lng !== null
    ? `https://yandex.uz/maps/?rtext=~${o.lat},${o.lng}&rtt=auto`
    : `https://yandex.uz/maps/?text=${encodeURIComponent(o.address)}`;
}

export function formatPrice(n: number): string {
  return `${formatNumber(Math.round(n))} so'm`;
}

export function roomsLabel(rooms: number, kind: string = "turar"): string {
  if (kind === "tijorat") return "Tijorat binosi";
  return rooms >= 4 ? "4+ xonali" : `${rooms} xonali`;
}

export function formatArea(n: number): string {
  return `${n.toFixed(2).replace(/\.?0+$/, "").replace(".", ",")} m²`;
}

function luminance(hex: string): number {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** To'q fonda yaxshi o'qiladigan variant: rangni oq bilan aralashtirib, yetarli yorqinlikka chiqaradi. */
export function lightenForDark(hex: string, min = 0.32): string {
  if (luminance(hex) >= min) return hex;
  const v = parseInt(hex.slice(1), 16);
  const rgb = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  for (let k = 0.1; k <= 0.9; k += 0.05) {
    const mixed = "#" + rgb.map((c) => Math.round(c + (255 - c) * k).toString(16).padStart(2, "0")).join("");
    if (luminance(mixed) >= min) return mixed;
  }
  return "#e6e0d6";
}

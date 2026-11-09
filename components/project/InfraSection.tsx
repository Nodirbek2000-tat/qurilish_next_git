"use client";

import { Baby, Coffee, Dumbbell, GraduationCap, LayoutGrid, MapPin, ShoppingBag, Stethoscope, Trees, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { InfraCategory, InfraPoint } from "@/lib/api";
import { distance, esc, fmtDistance } from "@/lib/ymaps";
import { YMap, type Pin } from "./YMap";

// Yandex vidjeti belgisi ranglari (pm2XXm) — kalitsiz rejimda ham filtr xaritada ko'rinadi
const WIDGET: Record<InfraCategory, string> = { talim: "bl", bogcha: "yw", tibbiyot: "rd", savdo: "vv", dam: "gn", sport: "or", kafe: "do" };

export const INFRA: Record<InfraCategory, { label: string; color: string; Icon: LucideIcon }> = {
  talim: { label: "Maktablar va universitetlar", color: "#3b82f6", Icon: GraduationCap },
  bogcha: { label: "Bolalar bog'chalari", color: "#f59e0b", Icon: Baby },
  tibbiyot: { label: "Tibbiyot", color: "#ef4444", Icon: Stethoscope },
  savdo: { label: "Savdo markazlari", color: "#8b5cf6", Icon: ShoppingBag },
  dam: { label: "Dam olish joylari", color: "#10b981", Icon: Trees },
  sport: { label: "Sport", color: "#f97316", Icon: Dumbbell },
  kafe: { label: "Kafe va restoranlar", color: "#b45309", Icon: Coffee },
};

type Props = { title: string; lat: number; lng: number; logo: string | null; color: string; points: InfraPoint[] };

export function projectPinHtml(title: string, logo: string | null, color: string) {
  const inner = logo
    ? `<img src="${esc(logo)}" alt="" />`
    : `<span style="background:${esc(color)}">${esc(title.slice(0, 1))}</span>`;
  return { html: `<div class="ym-logo" style="--c:${esc(color)}">${inner}<b>${esc(title)}</b></div>`, size: 68 };
}

export function InfraSection({ title, lat, lng, logo, color, points }: Props) {
  const [active, setActive] = useState<InfraCategory | "all">("all");
  const here = { lat, lng };

  const cats = (Object.keys(INFRA) as InfraCategory[]).filter((c) => points.some((p) => p.category === c));
  const shown = useMemo(
    () => points.filter((p) => active === "all" || p.category === active)
      .map((p) => ({ ...p, d: distance(here, p) })).sort((a, b) => a.d - b.d),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, active],
  );

  const pins: Pin[] = useMemo(() => {
    const me = projectPinHtml(title, logo, color);
    return [
      { id: "project", lat, lng, hint: esc(title), ...me },
      ...shown.map((p, i) => ({
        id: `i${i}`, lat: p.lat, lng: p.lng, size: 30, hint: `${esc(p.name)} · ${fmtDistance(p.d)}`,
        html: `<i class="ym-dot" style="--c:${INFRA[p.category].color}"></i>`,
      })),
    ];
  }, [shown, title, logo, color, lat, lng]);

  const widgetSrc = useMemo(() => {
    const pts = [`${lng},${lat},pm2ntl`, ...shown.slice(0, 40).map((p) => `${p.lng},${p.lat},pm2${WIDGET[p.category]}m`)];
    return `https://yandex.uz/map-widget/v1/?ll=${lng},${lat}&z=15&pt=${pts.join("~")}&lang=uz_UZ`;
  }, [shown, lat, lng]);

  const chip = (on: boolean) =>
    `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
      on ? "bg-ink text-paper shadow-lg" : "bg-card/90 backdrop-blur hover:bg-card"
    }`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="relative">
        <YMap center={[lat, lng]} zoom={15} pins={pins} title={`${title} infratuzilmasi`}
              fallbackSrc={widgetSrc} className="aspect-[4/3] lg:aspect-auto lg:h-[620px]" />
        <div className="absolute inset-x-3 bottom-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button type="button" onClick={() => setActive("all")} className={chip(active === "all")}>
            <LayoutGrid size={15} /> Barchasi
          </button>
          {cats.map((c) => {
            const { label, color: col, Icon } = INFRA[c];
            return (
              <button key={c} type="button" onClick={() => setActive(c)} className={chip(active === c)}>
                <Icon size={15} style={{ color: active === c ? undefined : col }} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="max-h-[620px] overflow-y-auto rounded-[26px] border border-line bg-card p-2">
        {shown.map((p, i) => {
          const { color: col, Icon } = INFRA[p.category];
          return (
            <li key={`${p.name}-${i}`} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-sand">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: `${col}1f`, color: col }}>
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="text-xs text-muted">{p.categoryLabel}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-muted">
                <MapPin size={13} /> {fmtDistance(p.d)}
              </span>
            </li>
          );
        })}
        {shown.length === 0 && <li className="p-6 text-center text-muted">Bu toifada nuqta yo&apos;q</li>}
      </ul>
    </div>
  );
}

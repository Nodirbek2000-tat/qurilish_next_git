"use client";

import { Building2, Clock, MapPin, Navigation, Phone, Store } from "lucide-react";
import { useMemo, useState } from "react";
import type { Office } from "@/lib/api";
import { telHref, yandexMapSrc } from "@/lib/format";
import { esc, photoPinHtml, routeUrl } from "@/lib/ymaps";
import { projectPinHtml } from "./InfraSection";
import { YMap } from "./YMap";

type Props = {
  title: string; address: string; lat: number | null; lng: number | null;
  logo: string | null; photo: string | null; color: string; office: Office | null; workHours: string[]; socials: [string, string][];
};

/** "Savdo ofisi" / "Obyekt" tablari: chapda ma'lumot, o'ngda xaritada tanlangan nuqta. */
export function LocationSection({ title, address, lat, lng, logo, photo, color, office, workHours, socials }: Props) {
  const hasOffice = !!(office?.lat && office?.lng);
  const hasObject = !!(lat && lng);
  const [tab, setTab] = useState<"office" | "object">(hasOffice ? "office" : "object");

  const point = tab === "office" && hasOffice
    ? { lat: office!.lat!, lng: office!.lng!, address: office!.address, phone: office!.phone, hours: office!.hours ? [office!.hours] : workHours }
    : { lat: lat!, lng: lng!, address, phone: office?.phone ?? "", hours: workHours };

  const pins = useMemo(() => {
    const isOffice = tab === "office" && hasOffice;
    const img = isOffice ? office!.photo ?? photo : photo;
    const label = isOffice ? office!.name : title;
    if (img) return [{ id: tab, lat: point.lat, lng: point.lng, hint: esc(label), size: 108, anchor: "bottom" as const, html: photoPinHtml(img, label) }];
    return [{ id: "p", lat: point.lat, lng: point.lng, hint: esc(title), ...projectPinHtml(title, logo, color) }];
  }, [tab, hasOffice, office, point.lat, point.lng, title, logo, color, photo]);

  if (!hasOffice && !hasObject) return null;

  const tabBtn = (key: "office" | "object", label: string, Icon: typeof Store) => (
    <button type="button" onClick={() => setTab(key)} aria-pressed={tab === key}
            className={`inline-flex h-12 items-center gap-2 rounded-full border px-6 font-semibold transition-all duration-300 ${
              tab === key ? "border-accent bg-accent text-on-accent" : "border-white/25 text-white hover:border-white"
            }`}>
      <Icon size={17} /> {label}
    </button>
  );

  return (
    <div className="grid overflow-hidden rounded-[32px] bg-emerald lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative flex flex-col gap-8 p-8 text-white md:p-12">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent opacity-20 blur-[100px]" />
        <div className="relative flex flex-wrap gap-3">
          {hasOffice && tabBtn("office", "Savdo ofisi", Store)}
          {hasObject && tabBtn("object", "Obyekt", Building2)}
        </div>
        <div key={tab} className="page-enter relative space-y-6">
          <p className="flex gap-3 text-xl leading-snug font-medium">
            <MapPin className="mt-1 shrink-0 text-accent" size={20} /> {point.address}
          </p>
          <a href={routeUrl(point.lat, point.lng)} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 font-semibold text-accent hover:underline">
            <Navigation size={17} /> Qanday yetib borish
          </a>
          <div className="space-y-3 border-t border-white/10 pt-6 text-white/80">
            {point.phone && (
              <a href={telHref(point.phone)} className="flex items-center gap-3 text-2xl font-semibold text-white tabular-nums hover:text-accent">
                <Phone size={19} className="text-accent" /> {point.phone}
              </a>
            )}
            {point.hours.map((h) => <p key={h} className="flex items-center gap-3"><Clock size={16} className="text-white/40" /> {h}</p>)}
          </div>
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {socials.map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">{label}</a>
              ))}
            </div>
          )}
        </div>
      </div>
      <YMap center={[point.lat, point.lng]} zoom={16} pins={pins} title={`${title} — xaritada`}
            fallbackSrc={yandexMapSrc([{ lat: point.lat, lng: point.lng }], 16)}
            fallbackPin={tab === "office" && hasOffice ? { photo: office!.photo ?? photo, label: office!.name } : { photo, label: title }}
            className="min-h-[360px] !rounded-none lg:min-h-[560px]" />
    </div>
  );
}

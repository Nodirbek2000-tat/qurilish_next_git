"use client";

import "../map-pin.css";
import { useEffect, useRef, useState } from "react";
import { loadYmaps, type YMaps } from "@/lib/ymaps";
import { MapPhotoPin } from "../MapPhotoPin";

/** anchor: "center" — doira markazi nuqtada; "bottom" — rasmli belgi, uchi nuqtada */
export type Pin = { id: string; lat: number; lng: number; html: string; hint: string; size: number; anchor?: "center" | "bottom" };

/**
 * Yandex JS xaritasi — o'zimizning HTML belgilar bilan (kattalashtirsa/sursa ham joyida turadi).
 * API yuklanmasa — `fallbackSrc` dagi oddiy Yandex vidjeti.
 */
export function YMap({
  center, zoom = 15, pins, fallbackSrc, title, className = "", fallbackPin,
}: {
  center: [number, number]; zoom?: number; pins: Pin[]; fallbackSrc: string; title: string; className?: string;
  /** Kalitsiz (oddiy vidjet) holatda markazdagi uy rasmli belgi */
  fallbackPin?: { photo: string | null; label: string } | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<YMaps>(null);
  const ym = useRef<YMaps>(null);
  const layer = useRef<YMaps>(null);
  const shown = useRef(`${center[0]},${center[1]}`); // xarita hozir qaysi nuqtaga qaragan
  const [mode, setMode] = useState<"loading" | "ready" | "fallback">("loading");
  // Rasmli belgi nuqtadan tepaga ~150px chiqadi — past xaritada kesilmasin: nuqtani biroz pastga suramiz
  const tall = pins.some((p) => p.anchor === "bottom");
  const nudge = () => {
    const m = map.current, el = box.current;
    if (!tall || !m || !el) return;
    const [x, y] = m.getGlobalPixelCenter();
    m.setGlobalPixelCenter([x, y - Math.max(30, 165 - el.clientHeight / 2)]);
  };

  // Xarita faqat ekranga yaqinlashganda va qutining o'lchami bo'lganda yaratiladi:
  // yashirin/0 o'lchamli qutida yaratilsa Yandex uni chizmaydi; sahifa ham tezroq ochiladi
  useEffect(() => {
    let alive = true;
    const el = box.current;
    if (!el) return;
    const start = () => loadYmaps().then((ymaps) => {
      if (!alive) return;
      if (!ymaps || !box.current) return setMode("fallback");
      ym.current = ymaps;
      map.current = new ymaps.Map(box.current, { center, zoom, controls: ["zoomControl"] },
                                  { suppressMapOpenBlock: true, autoFitToViewport: "always" });
      map.current.behaviors.disable("scrollZoom");
      layer.current = new ymaps.GeoObjectCollection();
      map.current.geoObjects.add(layer.current);
      nudge();
      setMode("ready");
    });
    let near = false, started = false;
    const check = () => {
      if (started || !near || el.clientWidth === 0 || el.clientHeight === 0) return;
      started = true;
      io.disconnect();
      ro.disconnect();
      start();
    };
    const io = new IntersectionObserver((entries) => { near = entries.some((e) => e.isIntersecting); check(); },
                                        { rootMargin: "300px" });
    const ro = new ResizeObserver(check);
    io.observe(el);
    ro.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      map.current?.destroy();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Belgilar
  useEffect(() => {
    const ymaps = ym.current;
    if (mode !== "ready" || !ymaps) return;
    layer.current.removeAll();
    const Center = ymaps.templateLayoutFactory.createClass('<div class="ym-pin">$[properties.html]</div>');
    const Bottom = ymaps.templateLayoutFactory.createClass('<div class="ym-pin-b">$[properties.html]</div>');
    for (const p of pins) {
      const bottom = p.anchor === "bottom";
      layer.current.add(new ymaps.Placemark([p.lat, p.lng], { html: p.html, hintContent: p.hint }, {
        iconLayout: bottom ? Bottom : Center,
        iconShape: bottom
          ? { type: "Rectangle", coordinates: [[-p.size / 2, -p.size - 40], [p.size / 2, 0]] }
          : { type: "Circle", coordinates: [0, 0], radius: p.size / 2 },
        zIndex: bottom ? 1000 : undefined,
      }));
    }
  }, [pins, mode]);

  // Markaz o'zgarsa (tab almashsa) — silliq o'tish
  const [cLat, cLng] = center;
  useEffect(() => {
    if (mode !== "ready" || !map.current) return;
    if (shown.current === `${cLat},${cLng}`) return;
    shown.current = `${cLat},${cLng}`;
    map.current.panTo([cLat, cLng], { flying: true, duration: 600 }).then(nudge);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cLat, cLng, mode]);

  return (
    <div className={`ym-gray relative overflow-hidden rounded-[26px] bg-sand ${className}`}>
      <div ref={box} className={`absolute inset-0 ${mode === "fallback" ? "hidden" : ""}`} />
      {mode === "fallback" && fallbackSrc && (
        <iframe key={fallbackSrc} src={fallbackSrc} title={title} loading="lazy" className="absolute inset-0 h-full w-full border-0" />
      )}
      {mode === "fallback" && fallbackPin?.photo && <MapPhotoPin key={`pin-${fallbackSrc}`} photo={fallbackPin.photo} label={fallbackPin.label} />}
      {mode === "loading" && <div className="absolute inset-0 animate-pulse bg-sand" />}
    </div>
  );
}

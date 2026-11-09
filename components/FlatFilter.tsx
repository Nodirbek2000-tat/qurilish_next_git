"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FlatPage } from "@/lib/api";

const ROOMS = [
  { v: "1", l: "1" },
  { v: "2", l: "2" },
  { v: "3", l: "3" },
  { v: "4", l: "4+" },
];

/** Filtr URL'da saqlanadi (ulashish mumkin), natijalar serverda chiziladi. */
export function FlatFilter({ facets, compact = false }: { facets: FlatPage["facets"]; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const list = (k: string) => (params.get(k) ?? "").split(",").filter(Boolean);
  const [area, setArea] = useState({ min: params.get("area_min") ?? "", max: params.get("area_max") ?? "" });
  const [floor, setFloor] = useState({ min: params.get("floor_min") ?? "", max: params.get("floor_max") ?? "" });

  const push = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    const target = compact ? "/kvartiralar" : pathname;
    start(() => router.replace(`${target}?${next.toString()}`, { scroll: false }));
  };

  const toggle = (k: string, v: string) => {
    const cur = list(k);
    push({ [k]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(",") });
  };

  // Raqamli maydonlar — yozib bo'lgandan keyin (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("area_min") ?? "") !== area.min || (params.get("area_max") ?? "") !== area.max ||
          (params.get("floor_min") ?? "") !== floor.min || (params.get("floor_max") ?? "") !== floor.max) {
        push({ area_min: area.min, area_max: area.max, floor_min: floor.min, floor_max: floor.max });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, floor]);

  const chip = (active: boolean) =>
    `h-11 min-w-11 rounded-full border px-4 text-sm font-semibold transition-all duration-300 ${
      active ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink"
    }`;
  const num = "field !h-11 !rounded-full !px-4 text-sm tabular-nums";

  return (
    <div className={`rounded-[26px] border border-line bg-card/70 p-5 backdrop-blur md:p-7 ${pending ? "opacity-70" : ""} transition-opacity`}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <fieldset>
          <legend className="eyebrow mb-3">Xonalar</legend>
          <div className="flex flex-wrap gap-2">
            {ROOMS.map((r) => (
              <button key={r.v} type="button" onClick={() => toggle("rooms", r.v)} className={chip(list("rooms").includes(r.v))} aria-pressed={list("rooms").includes(r.v)}>
                {r.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-3">Maydon, m²</legend>
          <div className="grid grid-cols-2 gap-2">
            <input className={num} inputMode="decimal" placeholder={`dan ${Math.floor(facets.area[0])}`} value={area.min}
                   onChange={(e) => setArea({ ...area, min: e.target.value.replace(/[^\d.]/g, "") })} aria-label="Maydon dan" />
            <input className={num} inputMode="decimal" placeholder={`gacha ${Math.ceil(facets.area[1])}`} value={area.max}
                   onChange={(e) => setArea({ ...area, max: e.target.value.replace(/[^\d.]/g, "") })} aria-label="Maydon gacha" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-3">Qavat</legend>
          <div className="grid grid-cols-2 gap-2">
            <input className={num} inputMode="numeric" placeholder={`dan ${facets.floor[0]}`} value={floor.min}
                   onChange={(e) => setFloor({ ...floor, min: e.target.value.replace(/\D/g, "") })} aria-label="Qavat dan" />
            <input className={num} inputMode="numeric" placeholder={`gacha ${facets.floor[1]}`} value={floor.max}
                   onChange={(e) => setFloor({ ...floor, max: e.target.value.replace(/\D/g, "") })} aria-label="Qavat gacha" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-3">Loyiha</legend>
          <select className="field !h-11 !rounded-full !px-4 text-sm" value={params.get("project") ?? ""} onChange={(e) => push({ project: e.target.value })}>
            <option value="">Barcha loyihalar</option>
            {facets.projects.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </select>
        </fieldset>
      </div>

      {facets.years.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-6">
          <span className="eyebrow mr-2">Topshirish yili</span>
          {facets.years.map((y) => (
            <button key={y} type="button" onClick={() => toggle("year", String(y))} className={chip(list("year").includes(String(y)))} aria-pressed={list("year").includes(String(y))}>
              {y}
            </button>
          ))}
          {params.toString() && (
            <button
              type="button"
              onClick={() => {
                setArea({ min: "", max: "" });
                setFloor({ min: "", max: "" });
                start(() => router.replace(pathname, { scroll: false }));
              }}
              className="ml-auto text-sm font-semibold text-muted underline-offset-4 hover:text-accent hover:underline"
            >
              Filtrni tozalash
            </button>
          )}
        </div>
      )}
    </div>
  );
}

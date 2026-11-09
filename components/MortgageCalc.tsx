"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";

function Slider({ label, value, min, max, step, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{value} {suffix}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[var(--accent)]"
        style={{ background: `linear-gradient(90deg, var(--accent) ${pct}%, rgb(18 20 23 / 0.1) ${pct}%)` }}
      />
      <span className="mt-1 flex justify-between text-xs text-muted tabular-nums"><span>{min}</span><span>{max}</span></span>
    </label>
  );
}

/** Bo'lmasa — Arxan Residence narxi */
const DEFAULT_M2 = 9_500_000;

/**
 * Muddatli to'lov kalkulyatori: narx = maydon × 1 m² narxi (pul kiritilmaydi).
 * Xonadon sahifasida maydon aniq (o'zgarmaydi), boshqa joyda — maydon tanlanadi.
 * Foizsiz: boshlang'ich to'lovdan keyin qolgani teng oylarga bo'linadi. Hisob taxminiy — ommaviy oferta emas.
 */
export function MortgageCalc({ priceM2, area: fixedArea, price: fixedPrice }: {
  priceM2?: number | null; area?: number; price?: number | null;
}) {
  const m2 = priceM2 || DEFAULT_M2;
  const [areaPick, setArea] = useState(60);
  const [down, setDown] = useState(30);
  const [months, setMonths] = useState(12);

  const area = fixedArea ?? areaPick;
  const price = fixedArea !== undefined && fixedPrice ? fixedPrice : area * m2;
  const first = price * (down / 100);
  const rest = Math.max(0, price - first);
  const monthly = months ? rest / months : 0;
  const money = (n: number) => formatNumber(Math.round(n));
  const areaText = `${area.toFixed(2).replace(/\.?0+$/, "").replace(".", ",")} m²`;

  return (
    <div className="grid overflow-hidden rounded-[30px] border border-line bg-card lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-8 p-6 md:p-10">
        {fixedArea === undefined && (
          <Slider label="Xonadon maydoni" value={areaPick} min={25} max={150} step={1} suffix="m²" onChange={setArea} />
        )}
        <div className="rounded-[20px] bg-sand p-5">
          <p className="eyebrow">Xonadon narxi</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{money(price)} so&apos;m</p>
          <p className="mt-1 text-sm text-muted tabular-nums">{areaText} × {money(m2)} so&apos;m (1 m²)</p>
        </div>
        <Slider label="Boshlang'ich to'lov" value={down} min={0} max={100} step={5} suffix="%" onChange={setDown} />
        <Slider label="Muddat" value={months} min={1} max={36} step={1} suffix="oy" onChange={setMonths} />
      </div>

      <div className="relative flex flex-col justify-between gap-10 overflow-hidden bg-night p-6 text-white md:p-10">
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-accent opacity-30 blur-[90px]" />
        <div className="relative">
          <p className="eyebrow !text-white/50">{rest ? "Oylik to'lov" : "To'liq to'lov"}</p>
          <p className="h-display mt-3 text-[clamp(36px,4.4vw,56px)] tabular-nums">{money(rest ? monthly : price)}</p>
          <p className="text-white/60">{rest ? <>so&apos;m / oy · {months} oy davomida</> : "so'm · bir martada"}</p>
        </div>
        <dl className="relative space-y-3 text-sm">
          {[
            ["Boshlang'ich to'lov", first],
            ["Muddatli to'lov summasi", rest],
            ["Jami to'lanadigan", price],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-white/60">{k}</dt>
              <dd className="font-semibold tabular-nums">{money(v as number)} so&apos;m</dd>
            </div>
          ))}
        </dl>
        <p className="relative text-xs leading-relaxed text-white/40">
          Hisob taxminiy va ommaviy oferta hisoblanmaydi. Aniq shartlarni sotuv bo&apos;limi bilan kelishing.
        </p>
      </div>
    </div>
  );
}

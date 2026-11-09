"use client";
/* eslint-disable @next/next/no-img-element -- panel: yuklangan rasmlarning kichik ko'rinishi */

import { Camera, Check, ImageOff, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteRecord, ensureLayout, saveRecord } from "@/app/(panel)/[panel]/actions";
import { formatNumber } from "@/lib/format";
import type { Rec, Schema } from "@/lib/panel";
import { ChildManager } from "./ChildManager";
import { RecordForm } from "./RecordForm";

export type FlatType = {
  rooms: number; area: number; areaRaw: string; total: number; available: number;
  layout: number | null; images: number; cover: string | null; description: string;
};
export type FlatRow = {
  id: number; number: string; building: number; buildingId: number; floor: number; rooms: number; area: number;
  status: string; price: number | null; showPrice: boolean;
};
export type FlatsData = {
  projects: { id: number; title: string }[]; project: number | null; types: FlatType[];
  buildings: { id: number; number: number }[]; flats: FlatRow[]; statuses: { value: string; label: string }[];
};

const STATUS_STYLE: Record<string, string> = {
  sotuvda: "bg-[#e6f3ec] text-[#1f6b45]",
  band: "bg-[#fdf3dc] text-[#8a5a00]",
  sotilgan: "bg-sand text-muted",
};

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-night/60 backdrop-blur-sm" onClick={onClose}>
      <div className="page-enter h-full w-full max-w-2xl overflow-y-auto bg-paper p-5 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Yopish" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

type Part = { name: string; area: string };

/** Xonalar tarkibi: rejadagi 1, 2, 3… tartibida nom va maydon. Yig'indi umumiy maydon bilan solishtiriladi. */
function PartsEditor({ layoutId, initial, total }: { layoutId: number; initial: unknown; total: number }) {
  const router = useRouter();
  const start = Array.isArray(initial) && initial.length
    ? (initial as { name: string; area: number }[]).map((p) => ({ name: p.name, area: Number(p.area).toFixed(2).replace(".", ",") }))
    : [{ name: "", area: "" }];
  const [rows, setRows] = useState<Part[]>(start);
  const [saving, startSave] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const sum = rows.reduce((s, r) => s + (parseFloat(r.area.replace(",", ".")) || 0), 0);
  const diff = Math.round((sum - total) * 100) / 100;
  // .field kengligi (100%) bu yerda kerak emas — o'z uslubi
  const cell = "h-10 rounded-xl border border-line bg-paper px-3 text-sm outline-none focus:border-ink";
  const set = (k: number, patch: Partial<Part>) => { setRows((v) => v.map((r, j) => (j === k ? { ...r, ...patch } : r))); setMsg(null); };

  const save = () => startSave(async () => {
    const fd = new FormData();
    const clean = rows.filter((r) => r.name.trim() || r.area.trim()).map((r) => ({ name: r.name.trim(), area: r.area.replace(",", ".") }));
    fd.set("parts", JSON.stringify(clean));
    const res = await saveRecord("layout", layoutId, {}, fd);
    if (res.ok) { setMsg({ ok: true, text: "Saqlandi" }); router.refresh(); }
    else setMsg({ ok: false, text: res.errors ? Object.values(res.errors).flat().join(" ") : res.error ?? "Xatolik" });
  });

  return (
    <div className="space-y-3 rounded-[22px] border border-line bg-card p-5">
      <p className="text-xs text-muted">Rejadagi raqamlar tartibida yozing: 1 — Dahliz, 2 — Oshxona… Saytda reja ostida ro&apos;yxat bo&apos;lib chiqadi.</p>
      {rows.map((r, k) => (
        <div key={k} className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper tabular-nums">{k + 1}</span>
          <input value={r.name} onChange={(e) => set(k, { name: e.target.value })} placeholder="Xona nomi" maxLength={40}
                 className={`${cell} min-w-0 flex-1`} aria-label={`${k + 1}-xona nomi`} />
          <input value={r.area} onChange={(e) => set(k, { area: e.target.value })} placeholder="m²" inputMode="decimal"
                 className={`${cell} w-24 shrink-0 text-right tabular-nums`} aria-label={`${k + 1}-xona maydoni`} />
          <button type="button" onClick={() => setRows((v) => (v.length > 1 ? v.filter((_, j) => j !== k) : [{ name: "", area: "" }]))}
                  aria-label="Qatorni o'chirish" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#c2412d] hover:bg-[#fdecea]"><Trash2 size={14} /></button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {rows.length < 15 && (
          <button type="button" onClick={() => setRows((v) => [...v, { name: "", area: "" }])} className="btn btn-ghost h-9 text-sm"><Plus size={14} /> Xona qo&apos;shish</button>
        )}
        <span className={`text-sm tabular-nums ${Math.abs(diff) < 0.05 ? "text-[#2f7d4f]" : "text-muted"}`}>
          Yig&apos;indi: {sum.toFixed(2).replace(".", ",")} / {String(total).replace(".", ",")} m²
          {Math.abs(diff) < 0.05 ? " ✓" : ` (farq ${diff > 0 ? "+" : ""}${String(diff).replace(".", ",")})`}
        </span>
        <button type="button" onClick={save} disabled={saving} className="btn btn-accent ml-auto h-10 text-sm disabled:opacity-60">
          {saving ? "Saqlanmoqda…" : "Xonalarni saqlash"}
        </button>
      </div>
      {msg && <p className={`flex items-center gap-1.5 text-sm font-medium ${msg.ok ? "text-[#2f7d4f]" : "text-[#c2412d]"}`}>{msg.ok && <Check size={15} />}{msg.text}</p>}
    </div>
  );
}

export function FlatsManager({ data, schema, base, layout, layoutImages, flat, newFlat }: {
  data: FlatsData; schema: Schema; base: string;
  layout: Rec | null; layoutImages: Rec[]; flat: Rec | null; newFlat: boolean;
}) {
  const router = useRouter();
  const [opening, startOpen] = useTransition();
  const [busy, startBusy] = useTransition();
  const [blok, setBlok] = useState<number | "all">("all");
  const [holat, setHolat] = useState<string>("all");
  const here = `${base}?loyiha=${data.project}`;
  const close = () => router.push(here, { scroll: false });

  const rows = useMemo(
    () => data.flats.filter((f) => (blok === "all" || f.buildingId === blok) && (holat === "all" || f.status === holat)),
    [data.flats, blok, holat],
  );
  const openType = (t: FlatType) => startOpen(async () => {
    const id = t.layout ?? await ensureLayout(data.project!, t.rooms, t.areaRaw);
    if (id) router.push(`${here}&tur=${id}`, { scroll: false });
  });
  const setStatus = (f: FlatRow, status: string) => startBusy(async () => {
    const fd = new FormData();
    fd.set("status", status);
    await saveRecord("flat", f.id, {}, fd);
    router.refresh();
  });
  const openedType = layout ? data.types.find((t) => t.layout === layout.id) : null;

  if (!data.project) return <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">Avval loyiha qo&apos;shing.</p>;

  return (
    <div className="space-y-12">
      {data.projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {data.projects.map((p) => (
            <Link key={p.id} href={`${base}?loyiha=${p.id}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${p.id === data.project ? "bg-ink text-paper" : "border border-line hover:border-ink"}`}>
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {/* ---------- Xonadon turlari: rasmlar shu yerga ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Xonadon turlari</h2>
            <p className="text-sm text-muted">Turni bosing — rasmlar va tavsif qo&apos;shing.</p>
          </div>
          {opening && <span className="text-sm text-muted">Ochilmoqda…</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.types.map((t) => (
            <button key={`${t.rooms}-${t.areaRaw}`} type="button" onClick={() => openType(t)} disabled={opening}
                    className="group overflow-hidden rounded-[20px] border border-line bg-card text-left transition-all hover:-translate-y-0.5 hover:border-accent disabled:opacity-60">
              <span className="relative block aspect-[4/3] bg-sand">
                {t.cover
                  ? <img src={t.cover} alt="" className={`absolute inset-0 h-full w-full ${t.images ? "object-cover" : "object-contain p-4 opacity-70"}`} />
                  : <span className="absolute inset-0 grid place-items-center text-muted"><ImageOff /></span>}
                <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${t.images ? "bg-ink text-paper" : "bg-[#fdecea] text-[#b3261e]"}`}>
                  <Camera size={12} /> {t.images ? `${t.images} ta rasm` : "Rasm yo'q"}
                </span>
              </span>
              <span className="block p-4">
                <span className="block text-lg font-semibold">{t.rooms} xonali · {String(t.area).replace(".", ",")} m²</span>
                <span className="block text-sm text-muted">{t.total} ta xonadon · sotuvda {t.available}</span>
              </span>
            </button>
          ))}
        </div>
        {data.types.length === 0 && <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">Bu loyihada hali xonadon yo&apos;q — pastdan qo&apos;shing.</p>}
      </section>

      {/* ---------- Xonadonlar ro'yxati ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-xl font-semibold tracking-tight">Xonadonlar <span className="text-muted">({rows.length})</span></h2>
          <select value={String(blok)} onChange={(e) => setBlok(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="h-10 rounded-full border border-line bg-card px-4 text-sm">
            <option value="all">Hamma bloklar</option>
            {data.buildings.map((b) => <option key={b.id} value={b.id}>{b.number}-blok</option>)}
          </select>
          <select value={holat} onChange={(e) => setHolat(e.target.value)} className="h-10 rounded-full border border-line bg-card px-4 text-sm">
            <option value="all">Hamma holatlar</option>
            {data.statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Link href={`${here}&xonadon=yangi`} scroll={false} className="btn btn-ink h-10 text-sm"><Plus size={16} /> Xonadon qo&apos;shish</Link>
        </div>

        <div className="overflow-x-auto rounded-[20px] border border-line bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 bg-card text-left text-xs tracking-wider text-muted uppercase">
              <tr className="border-b border-line">
                {["№", "Blok", "Qavat", "Xona", "Maydon", "Narx", "Holat", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className="border-b border-line last:border-0 hover:bg-sand/40">
                  <td className="px-4 py-2.5 font-semibold tabular-nums">{f.number}</td>
                  <td className="px-4 py-2.5 tabular-nums">{f.building}</td>
                  <td className="px-4 py-2.5 tabular-nums">{f.floor}</td>
                  <td className="px-4 py-2.5 tabular-nums">{f.rooms}</td>
                  <td className="px-4 py-2.5 tabular-nums">{String(f.area).replace(".", ",")} m²</td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {f.price ? <>{formatNumber(f.price)}{!f.showPrice && <span className="ml-1 text-xs text-muted">(yashirin)</span>}</> : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <select value={f.status} disabled={busy} onChange={(e) => setStatus(f, e.target.value)} aria-label="Holat"
                            className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[f.status] ?? ""}`}>
                      {data.statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Link href={`${here}&xonadon=${f.id}`} scroll={false} aria-label="Tahrirlash" className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand"><Pencil size={14} /></Link>
                      <button type="button" disabled={busy} aria-label="O'chirish"
                              onClick={() => confirm(`№${f.number} xonadon o'chirilsinmi?`) && startBusy(async () => { await deleteRecord("flat", f.id); router.refresh(); })}
                              className="grid h-8 w-8 place-items-center rounded-full text-[#c2412d] hover:bg-[#fdecea]"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-8 text-center text-muted">Bu filtrga mos xonadon yo&apos;q</p>}
        </div>
      </section>

      {/* ---------- Oynalar ---------- */}
      {layout && (
        <Drawer title={openedType ? `${openedType.rooms} xonali · ${String(openedType.area).replace(".", ",")} m²` : "Xonadon turi"} onClose={close}>
          {openedType && <p className="-mt-4 mb-6 text-sm text-muted">Shu o&apos;lchamdagi {openedType.total} ta xonadonning hammasida chiqadi.</p>}
          <div className="space-y-8">
            <div>
              <h4 className="mb-3 font-semibold">Rasmlar</h4>
              <ChildManager kind="layoutimage" schema={schema.layoutimage} items={layoutImages} parent={{ name: "layout", id: layout.id }} />
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Xonalar tarkibi</h4>
              <PartsEditor key={layout.id} layoutId={layout.id} initial={layout.parts} total={openedType?.area ?? Number(layout.area)} />
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Tavsif</h4>
              <RecordForm key={layout.id} kind="layout" record={layout}
                          groups={[{ title: "", fields: schema.layout.groups[0].fields.filter((f) => f.name === "description") }]}
                          onSaved={() => router.refresh()} submitLabel="Tavsifni saqlash" />
            </div>
          </div>
        </Drawer>
      )}

      {(flat || newFlat) && (
        <Drawer title={flat ? `№${String(flat.number)} xonadon` : "Yangi xonadon"} onClose={close}>
          <RecordForm key={flat ? flat.id : "yangi"} kind="flat" record={flat} groups={schema.flat.groups}
                      onSaved={() => { router.push(here, { scroll: false }); router.refresh(); }}
                      submitLabel={flat ? "Saqlash" : "Xonadonni qo'shish"} />
        </Drawer>
      )}
    </div>
  );
}

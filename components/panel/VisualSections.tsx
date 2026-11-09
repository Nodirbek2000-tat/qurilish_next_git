"use client";
/* eslint-disable @next/next/no-img-element -- panel: yuklanayotgan faylning lokal (blob:) ko'rinishi */

import {
  Accessibility, ArrowUpDown, Baby, Car, Cctv, ChevronLeft, ChevronRight, DoorClosed, Dumbbell, ImagePlus, LampCeiling,
  Package, PanelTop, Plus, ShieldCheck, Sofa, Sparkles, ThermometerSun, Trash2, Trees, Wifi, type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState, useTransition } from "react";
import { deleteRecord, saveRecord, type SaveState } from "@/app/(panel)/[panel]/actions";
import type { KindSchema, Rec } from "@/lib/panel";
import { inline, inlineDark, Toast, useMediaSlot } from "./visual-kit";

const ICONS: Record<string, LucideIcon> = {
  "arrow-up-down": ArrowUpDown, "door-closed": DoorClosed, "panel-top": PanelTop, "lamp-ceiling": LampCeiling,
  "shield-check": ShieldCheck, cctv: Cctv, car: Car, trees: Trees, baby: Baby, dumbbell: Dumbbell, wifi: Wifi,
  "thermometer-sun": ThermometerSun, sofa: Sofa, package: Package, accessibility: Accessibility, sparkles: Sparkles,
};

const field = (schema: KindSchema, name: string) => schema.groups.flatMap((g) => g.fields).find((f) => f.name === name);
const str = (r: Rec | null, k: string) => (r && r[k] !== null && r[k] !== undefined ? String(r[k]) : "");

/**
 * Bitta ichki yozuv (karta/slayd/afzallik) uchun mustaqil forma.
 * React formani avtomatik tozalamasligi uchun yuborish qo'lda.
 */
function useChildForm(kind: string, item: Rec | null, onDone?: () => void) {
  const router = useRouter();
  const [state, action, pending] = useActionState<SaveState, FormData>(saveRecord.bind(null, kind, item?.id ?? null), {});
  const [dirty, setDirty] = useState(false);
  const [removing, startRemove] = useTransition();
  useEffect(() => {
    if (state.ok) { onDone?.(); router.refresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  const formProps = {
    noValidate: true,
    onChange: () => setDirty(true),
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      startTransition(() => action(fd));
    },
  };
  const remove = () => {
    if (!item) return onDone?.();
    if (confirm("O'chirilsinmi?")) startRemove(async () => { await deleteRecord(kind, item.id); router.refresh(); });
  };
  const errors = state.errors ? Object.values(state.errors).flat().join(" ") : state.error ?? null;
  return { formProps, pending, dirty, remove, removing, errors };
}

function CardActions({ pending, dirty, isNew, remove, removing, dark = false }: {
  pending: boolean; dirty: boolean; isNew: boolean; remove: () => void; removing: boolean; dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {(dirty || isNew) && (
        <button type="submit" disabled={pending} className="btn btn-accent h-9 px-4 text-sm disabled:opacity-50">
          {pending ? "Saqlanmoqda…" : "Saqlash"}
        </button>
      )}
      <button type="button" onClick={remove} disabled={removing} aria-label={isNew ? "Bekor qilish" : "O'chirish"}
              className={`ml-auto grid h-9 w-9 place-items-center rounded-full transition-colors ${dark ? "text-white/70 hover:bg-white/10" : "text-[#c2412d] hover:bg-[#fdecea]"}`}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* ===================== ARXITEKTURA ===================== */

function ArchCard({ schema, item, projectId, index, onDone }: { schema: KindSchema; item: Rec | null; projectId: number; index: number; onDone?: () => void }) {
  const f = useChildForm("arch", item, onDone);
  const img = useMediaSlot(field(schema, "image"), (item?.image as string) || null);
  const textFirst = index % 3 === 1;

  const image = (
    <button type="button" {...img.dropProps} onClick={img.open}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[18px] border-2 border-dashed border-line bg-sand">
      {img.slot.url
        ? <img src={img.slot.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        : <span className="absolute inset-0 grid place-items-center text-sm text-muted"><span className="grid justify-items-center gap-2"><ImagePlus /> Rasm (4:5)</span></span>}
      {img.slot.dirty && <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">Saqlanmagan</span>}
    </button>
  );
  const text = (
    <div className="space-y-2 p-4">
      <span className="text-sm font-semibold text-accent tabular-nums">0{index + 1}</span>
      <input name="title" defaultValue={str(item, "title")} placeholder="Sarlavha" className={`${inlineDark} px-1 text-2xl font-semibold tracking-tight`} />
      <textarea name="text" defaultValue={str(item, "text")} rows={3} placeholder="Izoh (ixtiyoriy)" className={`${inlineDark} resize-y px-1 leading-relaxed text-muted`} />
    </div>
  );

  return (
    <form {...f.formProps} className={`overflow-hidden rounded-[24px] border border-line bg-card p-2 ${index % 3 === 1 ? "md:mt-16" : ""}`}>
      {img.hiddenInput}
      {!item && <input type="hidden" name="project" value={projectId} />}
      <input type="hidden" name="order" value={str(item, "order") || String(index)} />
      {textFirst ? <>{text}{image}</> : <>{image}{text}</>}
      <div className="space-y-2 p-3">
        <Toast text={img.error ?? f.errors} />
        <CardActions pending={f.pending} dirty={f.dirty || img.slot.dirty} isNew={!item} remove={f.remove} removing={f.removing} />
      </div>
    </form>
  );
}

export function ArchEditor({ schema, items, projectId }: { schema: KindSchema; items: Rec[]; projectId: number }) {
  const [draft, setDraft] = useState(false);
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it, i) => <ArchCard key={JSON.stringify(it)} schema={schema} item={it} projectId={projectId} index={i} />)}
        {draft && <ArchCard schema={schema} item={null} projectId={projectId} index={items.length} onDone={() => setDraft(false)} />}
      </div>
      {!draft && (
        <button type="button" onClick={() => setDraft(true)} className="btn btn-ghost mt-6 h-11 text-sm"><Plus size={16} /> Karta qo&apos;shish</button>
      )}
      <p className="mt-2 text-xs text-muted">{field(schema, "image")?.help}</p>
    </div>
  );
}

/* ===================== ICHKI MAKON ===================== */

function SlideForm({ schema, item, projectId, order, onDone }: { schema: KindSchema; item: Rec | null; projectId: number; order: number; onDone?: () => void }) {
  const f = useChildForm("interior", item, onDone);
  const img = useMediaSlot(field(schema, "image"), (item?.image as string) || null);

  return (
    <form {...f.formProps} className="relative overflow-hidden rounded-[28px] bg-night text-white">
      {img.hiddenInput}
      {!item && <input type="hidden" name="project" value={projectId} />}
      <input type="hidden" name="order" value={str(item, "order") || String(order)} />
      {img.slot.url && <img src={img.slot.url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-3xl" />}
      <div className="absolute inset-0 bg-night/60" />

      <div className="relative grid gap-6 p-6 md:p-10 lg:grid-cols-[0.8fr_1.4fr] lg:items-center">
        <div>
          <p className="eyebrow !text-white/50">Ichki makon</p>
          <input name="title" defaultValue={str(item, "title")} placeholder="Slayd sarlavhasi" className={`${inline} h-display mt-4 px-2 text-[clamp(28px,3vw,44px)]`} />
          <textarea name="text" defaultValue={str(item, "text")} rows={4} placeholder="Qisqa matn" className={`${inline} mt-3 resize-y px-2 py-1 leading-relaxed text-white/75`} />
          <div className="mt-4 space-y-2">
            <Toast text={img.error ?? f.errors} />
            <CardActions pending={f.pending} dirty={f.dirty || img.slot.dirty} isNew={!item} remove={f.remove} removing={f.removing} dark />
          </div>
        </div>
        <button type="button" {...img.dropProps} onClick={img.open}
                className="group relative aspect-[16/10] overflow-hidden rounded-[20px] border-2 border-dashed border-white/25">
          {img.slot.url
            ? <img src={img.slot.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            : <span className="absolute inset-0 grid place-items-center text-sm text-white/60"><span className="grid justify-items-center gap-2"><ImagePlus /> Rasm (16:10) — majburiy</span></span>}
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">Almashtirish</span>
          {img.slot.dirty && <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs font-bold">Saqlanmagan</span>}
        </button>
      </div>
    </form>
  );
}

export function InteriorEditor({ schema, items, projectId }: { schema: KindSchema; items: Rec[]; projectId: number }) {
  const [sel, setSel] = useState(0); // items.length → yangi slayd qoralamasi
  const isDraft = sel >= items.length;
  const current = isDraft ? null : items[sel];

  return (
    <div>
      <SlideForm key={current ? JSON.stringify(current) : "draft"} schema={schema} item={current} projectId={projectId}
                 order={items.length} onDone={() => setSel(Math.max(0, items.length - (isDraft ? 0 : 1)))} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={sel === 0} onClick={() => setSel((v) => v - 1)} aria-label="Oldingi"
                className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronLeft /></button>
        {items.map((it, i) => (
          <button key={it.id} type="button" onClick={() => setSel(i)} aria-label={str(it, "title")}
                  className={`relative h-16 w-24 overflow-hidden rounded-xl bg-sand transition-all ${i === sel ? "ring-2 ring-accent" : "opacity-60 hover:opacity-100"}`}>
            {Boolean(it.image) && <img src={String(it.image)} alt="" className="h-full w-full object-cover" />}
          </button>
        ))}
        <button type="button" onClick={() => setSel(items.length)}
                className={`grid h-16 w-24 place-items-center rounded-xl border-2 border-dashed text-sm font-semibold ${isDraft ? "border-accent text-accent" : "border-line text-muted hover:border-accent"}`}>
          <Plus size={18} />
        </button>
        <button type="button" disabled={sel >= items.length} onClick={() => setSel((v) => v + 1)} aria-label="Keyingi"
                className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronRight /></button>
        <span className="ml-auto text-xs text-muted">{field(schema, "image")?.help}</span>
      </div>
    </div>
  );
}

/* ===================== LOBBI AFZALLIKLARI ===================== */

function FeatureChip({ schema, item, projectId, order, onDone }: { schema: KindSchema; item: Rec | null; projectId: number; order: number; onDone?: () => void }) {
  const f = useChildForm("lobby", item, onDone);
  const [icon, setIcon] = useState(str(item, "icon") || "sparkles");
  const Icon = ICONS[icon] ?? Sparkles;
  const choices = field(schema, "icon")?.choices ?? [];

  return (
    <form {...f.formProps} className="flex flex-col gap-3 rounded-2xl bg-white/10 p-3">
      {!item && <input type="hidden" name="project" value={projectId} />}
      <input type="hidden" name="order" value={str(item, "order") || String(order)} />
      <label className="relative grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-white/15" title="Ikonkani tanlang">
        <Icon size={22} />
        <select name="icon" value={icon} onChange={(e) => setIcon(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
          {choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>
      <input name="label" defaultValue={str(item, "label")} placeholder="Nomi" className={`${inline} px-1 text-sm font-semibold`} />
      {f.errors && <p className="text-xs text-[#ffd0c8]">{f.errors}</p>}
      <CardActions pending={f.pending} dirty={f.dirty} isNew={!item} remove={f.remove} removing={f.removing} dark />
    </form>
  );
}

export function LobbyFeatures({ schema, items, projectId }: { schema: KindSchema; items: Rec[]; projectId: number }) {
  const [draft, setDraft] = useState(false);
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 2xl:grid-cols-3">
      {items.map((it, i) => <FeatureChip key={JSON.stringify(it)} schema={schema} item={it} projectId={projectId} order={i} />)}
      {draft && <FeatureChip schema={schema} item={null} projectId={projectId} order={items.length} onDone={() => setDraft(false)} />}
      {!draft && (
        <button type="button" onClick={() => setDraft(true)}
                className="grid min-h-32 place-items-center rounded-2xl border-2 border-dashed border-white/25 text-sm font-semibold text-white/70 hover:border-white hover:text-white">
          <span className="grid justify-items-center gap-1"><Plus size={18} /> Afzallik</span>
        </button>
      )}
    </div>
  );
}

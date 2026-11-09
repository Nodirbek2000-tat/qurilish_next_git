"use client";
/* eslint-disable @next/next/no-img-element -- panel: tanlangan faylning lokal ko'rinishi (blob:) */

import { Check, ImagePlus, Trash2, Video } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { saveRecord, type SaveState } from "@/app/(panel)/[panel]/actions";
import type { FieldSchema, Rec } from "@/lib/panel";
import { LocationFields } from "./visual-kit";

type Props = {
  kind: string;
  record: Rec | null;
  groups: { title: string; fields: FieldSchema[] }[];
  hidden?: Record<string, string | number>;
  onSaved?: (id: number) => void;
  submitLabel?: string;
};

/** Rasmni brauzerda tekshiradi: kamida W×H va nisbat ±2% */
export function checkImage(file: File, size: NonNullable<FieldSchema["size"]>): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const need = `${size.minW}×${size.minH}${size.ratio ? ` (${size.ratio[0]}:${size.ratio[1]})` : ""}`;
      if (w < size.minW || h < size.minH) return resolve(`Rasm juda kichik: ${w}×${h}. Kerak: kamida ${need}`);
      if (size.ratio) {
        const r = size.ratio[0] / size.ratio[1];
        if (Math.abs(w / h - r) > 0.02 * r) return resolve(`Nisbat noto'g'ri: ${w}×${h}. Kerak: ${need}`);
      }
      resolve(null);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve("Rasmni o'qib bo'lmadi"); };
    img.src = url;
  });
}

function FileInput({ f, current }: { f: FieldSchema; current: string | null }) {
  const [preview, setPreview] = useState<string | null>(current);
  const [err, setErr] = useState<string | null>(null);
  const [clear, setClear] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const isVideo = f.type === "file";

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErr(null);
    if (!file) return;
    if (file.size > (isVideo ? 40 : 8) * 1024 * 1024) {
      setErr(`Fayl juda katta (${(file.size / 1048576).toFixed(1)} MB). Chegara: ${isVideo ? 40 : 8} MB`);
      e.target.value = "";
      return;
    }
    if (!isVideo && f.size) {
      const problem = await checkImage(file, f.size);
      if (problem) { setErr(problem); e.target.value = ""; return; }
    }
    setClear(false);
    setPreview(URL.createObjectURL(file));
  };

  const ratio = f.size?.ratio ? `${f.size.ratio[0]} / ${f.size.ratio[1]}` : "16 / 9";
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-line bg-sand transition-colors hover:border-accent"
           style={{ aspectRatio: ratio, maxHeight: 260 }}>
        {preview && !clear ? (
          isVideo
            ? <video src={preview} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
            : <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-center text-sm text-muted">
            <span className="grid justify-items-center gap-2">{isVideo ? <Video /> : <ImagePlus />} Fayl tanlang</span>
          </span>
        )}
        <input ref={input} type="file" name={f.name} accept={f.accept} onChange={onChange}
               className="absolute inset-0 cursor-pointer opacity-0" aria-label={f.label} />
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="text-xs text-muted">{f.help}</p>
        {preview && !f.required && (
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#c2412d]">
            <input type="checkbox" checked={clear} onChange={(e) => { setClear(e.target.checked); if (input.current) input.current.value = ""; }} />
            <Trash2 size={13} /> O&apos;chirish
          </label>
        )}
      </div>
      {clear && <input type="hidden" name={`clear_${f.name}`} value="1" />}
      {err && <p className="mt-1.5 text-sm font-medium text-[#c2412d]">{err}</p>}
    </div>
  );
}

function Field({ f, value, errors }: { f: FieldSchema; value: unknown; errors?: string[] }) {
  const common = { name: f.name, id: `f-${f.name}`, required: f.required, "aria-invalid": !!errors };
  const v = value === null || value === undefined ? "" : String(value);
  let control: React.ReactNode;
  switch (f.type) {
    case "image":
    case "file":
      control = <FileInput f={f} current={(value as string) ?? null} />;
      break;
    case "textarea":
      control = <textarea {...common} defaultValue={v} rows={5} className="field" />;
      break;
    case "bool":
      control = (
        <label className="inline-flex cursor-pointer items-center gap-3">
          <input type="hidden" name={f.name} value="false" />
          <input type="checkbox" name={f.name} value="true" defaultChecked={value === true} className="peer sr-only" />
          <span className="relative h-7 w-12 rounded-full bg-line transition-colors after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5" />
          <span className="text-sm">{f.label}</span>
        </label>
      );
      break;
    case "select":
      control = (
        <select {...common} defaultValue={v} className="field">
          {!f.required && <option value="">—</option>}
          {f.choices?.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      );
      break;
    case "color":
      control = (
        <div className="flex items-center gap-3">
          <input type="color" defaultValue={v || "#c0673f"} onChange={(e) => { (e.target.nextSibling as HTMLInputElement).value = e.target.value.toUpperCase(); }}
                 className="h-12 w-16 cursor-pointer rounded-xl border border-line bg-card p-1" />
          <input {...common} defaultValue={v} pattern="#[0-9A-Fa-f]{6}" className="field max-w-40 font-mono" />
        </div>
      );
      break;
    default:
      control = (
        <input {...common} defaultValue={v} className="field"
               type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
               inputMode={f.type === "decimal" ? "decimal" : undefined} min={f.type === "number" ? 0 : undefined} />
      );
  }

  return (
    <div className={f.type === "textarea" || f.type === "image" || f.type === "file" ? "md:col-span-2" : ""}>
      {f.type !== "bool" && (
        <label htmlFor={`f-${f.name}`} className="mb-1.5 block text-sm font-semibold">
          {f.label}{f.required && <span className="text-accent"> *</span>}
        </label>
      )}
      {control}
      {f.type !== "image" && f.type !== "file" && f.help && <p className="mt-1.5 text-xs text-muted">{f.help}</p>}
      {errors?.map((e) => <p key={e} className="mt-1.5 text-sm font-medium text-[#c2412d]">{e}</p>)}
    </div>
  );
}

export function RecordForm({ kind, record, groups, hidden, onSaved, submitLabel = "Saqlash" }: Props) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveRecord.bind(null, kind, record?.id ?? null), {});
  useEffect(() => {
    if (state.ok && state.id) onSaved?.(state.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}
          className="space-y-8" noValidate>
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {groups.map((g) => (
        <fieldset key={g.title || "main"} className="rounded-[22px] border border-line bg-card p-5 md:p-7">
          {g.title && <legend className="px-2 text-sm font-semibold tracking-wide text-muted uppercase">{g.title}</legend>}
          <div className="grid gap-5 md:grid-cols-2">
            {g.fields.map((f) => {
              // Kenglik+uzunlik bitta blokda: havoladan to'ldirish va xaritada ko'rish
              if (f.name === "longitude" && g.fields.some((x) => x.name === "latitude")) return null;
              if (f.name === "latitude" && g.fields.some((x) => x.name === "longitude")) {
                return (
                  <div key="location" className="md:col-span-2">
                    <p className="mb-1.5 text-sm font-semibold">Xaritadagi joyi</p>
                    <LocationFields lat={record?.latitude} lng={record?.longitude} query={String(record?.address ?? record?.name ?? "")}
                                    errors={[...(state.errors?.latitude ?? []), ...(state.errors?.longitude ?? [])]} />
                  </div>
                );
              }
              return <Field key={f.name} f={f} value={record?.[f.name]} errors={state.errors?.[f.name]} />;
            })}
          </div>
        </fieldset>
      ))}
      {state.errors && (
        <div role="alert" className="rounded-2xl bg-[#fdecea] p-4 text-sm text-[#b3261e]">
          <p className="font-semibold">Saqlanmadi — quyidagilarni to&apos;g&apos;rilang:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {Object.entries(state.errors).map(([name, errs]) => {
              const f = groups.flatMap((g) => g.fields).find((x) => x.name === name);
              const where = groups.find((g) => g.fields.some((x) => x.name === name))?.title;
              return <li key={name}><b>{f?.label ?? "Umumiy"}</b>{where ? ` (${where})` : ""}: {errs.join(" ")}</li>;
            })}
          </ul>
        </div>
      )}
      {state.error && <p className="text-sm font-medium text-[#c2412d]">{state.error}</p>}
      <div className="sticky bottom-4 z-10 flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-accent shadow-xl disabled:opacity-60">
          {pending ? "Saqlanmoqda…" : submitLabel}
        </button>
        {state.ok && !pending && (
          <span className="page-enter inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-semibold text-[#2f7d4f] shadow">
            <Check size={15} /> Saqlandi
          </span>
        )}
      </div>
    </form>
  );
}

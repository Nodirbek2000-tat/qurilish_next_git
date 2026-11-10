"use client";
/* eslint-disable @next/next/no-img-element -- panel: yuklanayotgan faylning lokal (blob:) ko'rinishi */

import { Building2, CalendarCheck, Camera, Check, ImagePlus, Layers, Palette, Plus, Ruler, Undo2, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { saveRecord, type SaveState } from "@/app/(panel)/[panel]/actions";
import type { Rec, Schema } from "@/lib/panel";
import { ChildManager } from "./ChildManager";
import { RecordForm } from "./RecordForm";
import { ArchEditor, InteriorEditor, LobbyFeatures } from "./VisualSections";
import { inline, inlineDark, LocationFields, Toast, useMediaSlot } from "./visual-kit";

/* ---------- Vizual muharrir ---------- */

export function VisualEditor({ schema, record, items }: { schema: Schema; record: Rec; items: Record<string, Rec[]> }) {
  const router = useRouter();
  const F = `vis-${record.id}`; // loyiha maydonlari shu formaga bog'langan (form= atributi)
  const fields = Object.fromEntries(schema.project.groups.flatMap((g) => g.fields).map((f) => [f.name, f]));
  const s = (k: string) => (record[k] === null || record[k] === undefined ? "" : String(record[k]));

  const hero = useMediaSlot(fields.hero, (record.hero as string) || (record.cover as string) || null, "image", F);
  const aboutImg = useMediaSlot(fields.about_image, (record.about_image as string) || null, "image", F);
  const lobbyImg = useMediaSlot(fields.lobby_image, (record.lobby_image as string) || null, "image", F);
  const aboutVid = useMediaSlot(fields.about_video, (record.about_video as string) || null, "video", F);
  const coverImg = useMediaSlot(fields.cover, (record.cover as string) || null, "image", F);
  const logoImg = useMediaSlot(fields.logo, (record.logo as string) || null, "image", F);
  const [office, setOffice] = useState(s("office"));
  const [newOffice, setNewOffice] = useState<{ value: number; label: string } | null>(null);
  const [officeForm, setOfficeForm] = useState(false);
  const [mediaMode, setMediaMode] = useState<"image" | "video">(record.about_video ? "video" : "image");
  const [color, setColor] = useState(s("color") || "#c0673f");
  const [dirty, setDirty] = useState(false);

  const [state, action, pending] = useActionState<SaveState, FormData>(saveRecord.bind(null, "project", record.id), {});
  useEffect(() => {
    if (state.ok) router.refresh(); // yangi qiymatlar bilan qayta chiziladi (kalit orqali qayta o'rnatiladi)
  }, [state, router]);

  const anyDirty = dirty || [hero, aboutImg, aboutVid, lobbyImg, coverImg, logoImg].some((m) => m.slot.dirty);
  // Shu yerda yaratilgan ofis — sahifa yangilanguncha ro'yxatda bo'lmasligi mumkin
  const officeChoices = [...(fields.office?.choices ?? []),
    ...(newOffice && !fields.office?.choices?.some((c) => c.value === newOffice.value) ? [newOffice] : [])];
  const infra = (items.infra ?? []).map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude) })).filter((p) => !isNaN(p.lat) && !isNaN(p.lng));
  const statusChoices = fields.status?.choices ?? [];
  const errors = state.errors ? Object.entries(state.errors).map(([k, v]) => `${fields[k]?.label ?? k}: ${v.join(" ")}`) : [];

  // Rasm va video bir vaqtda bo'lmasin: birini yuklasa ikkinchisi tozalanadi
  const clearOther = mediaMode === "video"
    ? (record.about_image && aboutVid.slot.dirty ? <input type="hidden" form={F} name="clear_about_image" value="1" /> : null)
    : (record.about_video && aboutImg.slot.dirty ? <input type="hidden" form={F} name="clear_about_video" value="1" /> : null);

  return (
    // action prop o'rniga qo'lda: React formani avtomatik tozalamasin (xato bo'lsa yozilganlar saqlanib qoladi)
    <div className="space-y-12" style={{ "--accent": color } as React.CSSProperties}
         onChange={(e) => { if ((e.target as HTMLInputElement).form?.id === F) setDirty(true); }}>
      <form id={F} noValidate onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} />
      {hero.hiddenInput}{aboutImg.hiddenInput}{lobbyImg.hiddenInput}{coverImg.hiddenInput}{logoImg.hiddenInput}{mediaMode === "video" && aboutVid.hiddenInput}{clearOther}

      {/* ===================== HERO ===================== */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hero — saytdagi ko&apos;rinishi</h2>
          <p className="text-xs text-muted">{hero.hint}</p>
        </div>

        <div {...hero.dropProps} className="group/hero relative flex min-h-[560px] overflow-hidden rounded-[28px] bg-night text-white">
          <div className="absolute inset-0">
            {hero.slot.url && <img src={hero.slot.url} alt="" className="h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.1)_35%,rgb(0_0_0/0.25)_60%,rgb(0_0_0/0.85)_100%)]" />
            <div className="absolute inset-0 opacity-60 mix-blend-multiply transition-[background] duration-500" style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 55%)` }} />
          </div>

          {/* Boshqaruv tugmalari */}
          <div className="absolute top-4 right-4 z-10 flex flex-wrap justify-end gap-2">
            {hero.slot.dirty && (
              <button type="button" onClick={hero.reset} className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-black/80">
                <Undo2 size={15} /> Qaytarish
              </button>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-black/80">
              <Palette size={15} /> Rang
              <input type="color" form={F} name="color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} className="h-5 w-7 cursor-pointer rounded border-0 bg-transparent p-0" />
            </label>
            <button type="button" onClick={hero.open} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#14171a] shadow-xl hover:bg-accent hover:text-white">
              <Camera size={15} /> Fon rasmini almashtirish
            </button>
          </div>
          {hero.slot.dirty && <span className="absolute top-4 left-4 z-10 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white">Saqlanmagan</span>}
          {/* Sudrab tashlash ishorasi */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover/hero:opacity-100">
            <span className="rounded-full bg-black/40 px-4 py-2 text-sm text-white/80 backdrop-blur">Rasmni shu yerga sudrab tashlang</span>
          </div>

          <div className="relative z-[5] flex flex-1 flex-col justify-end px-6 pt-20 pb-36 md:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <select form={F} name="status" defaultValue={s("status")} className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#14171a] outline-none focus:ring-2 focus:ring-accent">
                {statusChoices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input form={F} name="address" defaultValue={s("address")} placeholder="Manzil" className={`${inline} max-w-md px-2 py-1 text-sm text-white/80`} />
            </div>
            <input form={F} name="title" defaultValue={s("title")} placeholder="Loyiha nomi"
                   className={`${inline} h-display mt-5 px-2 text-[clamp(44px,7vw,104px)]`} />
            <input form={F} name="tagline" defaultValue={s("tagline")} placeholder="Qisqa shior"
                   className={`${inline} mt-3 max-w-2xl px-2 py-1 text-xl text-white/85 md:text-2xl`} />
          </div>

          {/* Raqamlar paneli */}
          <div className="absolute inset-x-4 bottom-4 z-[5] md:inset-x-6">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-white/15 bg-white/10 backdrop-blur-xl md:grid-cols-4">
              <div className="bg-black/10 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11px] tracking-wider text-white/60 uppercase"><Building2 size={12} /> Toifa</p>
                <select form={F} name="klass" defaultValue={s("klass")} className="mt-1 w-full bg-transparent text-lg font-semibold outline-none [&>option]:text-[#14171a]">
                  {(fields.klass?.choices ?? []).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {[
                { name: "floors", label: "Qavatlar", Icon: Layers, type: "number" },
                { name: "area", label: "Maydon, m²", Icon: Ruler, type: "number" },
                { name: "handover", label: "Topshirish", Icon: CalendarCheck, type: "text" },
              ].map(({ name, label, Icon, type }) => (
                <div key={name} className="bg-black/10 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[11px] tracking-wider text-white/60 uppercase"><Icon size={12} /> {label}</p>
                  <input form={F} name={name} type={type} min={0} defaultValue={s(name)} className={`${inline} mt-1 px-1 text-lg font-semibold`} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3"><Toast text={hero.error} /></div>
      </section>

      {/* ===================== LOYIHA HAQIDA ===================== */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Loyiha haqida — saytdagi ko&apos;rinishi</h2>
        <div className="grid items-center gap-10 rounded-[28px] border border-line bg-paper p-6 md:p-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Loyiha haqida</p>
            <p className="h-display mt-3 text-[clamp(30px,3.6vw,48px)]">{s("title") || "Loyiha nomi"}</p>
            <textarea form={F} name="description" defaultValue={s("description")} rows={8} placeholder="Tavsif. Xatboshilarni bo'sh qator bilan ajrating."
                      className={`${inlineDark} mt-5 resize-y px-2 py-1 text-lg leading-relaxed`} />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { name: "stat_blocks", label: "Bloklar" }, { name: "flats", label: "Xonadonlar" },
                { name: "stat_queues", label: "Navbatlar" }, { name: "area", label: "m² maydon", readOnly: true },
              ].map((x) => (
                <label key={x.name} className="block">
                  <input form={F} name={x.readOnly ? undefined : x.name} type="number" min={0} defaultValue={s(x.name)} readOnly={x.readOnly}
                         placeholder="avto" title={x.readOnly ? "Hero'dagi «Maydon» bilan bir xil" : undefined}
                         className={`${inlineDark} px-1 text-[clamp(26px,2.6vw,36px)] font-semibold text-accent tabular-nums`} />
                  <span className="mt-1 block text-sm text-muted">{x.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 inline-flex rounded-full bg-sand p-1 text-sm font-semibold">
              {(["image", "video"] as const).map((m) => (
                <button key={m} type="button" onClick={() => { setMediaMode(m); setDirty(true); }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors ${mediaMode === m ? "bg-ink text-paper" : "text-muted"}`}>
                  {m === "image" ? <><ImagePlus size={15} /> Rasm</> : <><Video size={15} /> Video</>}
                </button>
              ))}
            </div>
            {(() => {
              const m = mediaMode === "image" ? aboutImg : aboutVid;
              return (
                <>
                  <button type="button" {...m.dropProps} onClick={m.open}
                          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[24px] border-2 border-dashed border-line bg-sand text-left transition-colors hover:border-accent">
                    {m.slot.url ? (
                      mediaMode === "image"
                        ? <img src={m.slot.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        : <video src={m.slot.url} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-muted">
                        <span className="grid justify-items-center gap-2 text-sm">{mediaMode === "image" ? <ImagePlus /> : <Video />} Bosing yoki sudrab tashlang</span>
                      </span>
                    )}
                    <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                      Almashtirish
                    </span>
                    {m.slot.dirty && <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">Saqlanmagan</span>}
                  </button>
                  <p className="mt-2 text-xs text-muted">{mediaMode === "image" ? aboutImg.hint : "MP4/WebM, 40 MB gacha, ovozsiz takrorlanadi. Video tanlansa, rasm o'chiriladi."}</p>
                  <div className="mt-2"><Toast text={m.error} /></div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ===================== ARXITEKTURA ===================== */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Arxitektura — saytdagi ko&apos;rinishi</h2>
        <ArchEditor schema={schema.arch} items={items.arch ?? []} projectId={record.id} />
      </section>

      {/* ===================== ICHKI MAKON ===================== */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Ichki makon — saytdagi ko&apos;rinishi</h2>
        <InteriorEditor schema={schema.interior} items={items.interior ?? []} projectId={record.id} />
      </section>

      {/* ===================== LOBBI ===================== */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Nafis lobbi — saytdagi ko&apos;rinishi</h2>
        <div className="grid items-center lg:grid-cols-[1fr_1.1fr]">
          <button type="button" {...lobbyImg.dropProps} onClick={lobbyImg.open}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[26px] border-2 border-dashed border-line bg-sand text-left lg:-mr-20">
            {lobbyImg.slot.url
              ? <img src={lobbyImg.slot.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              : <span className="absolute inset-0 grid place-items-center text-sm text-muted"><span className="grid justify-items-center gap-2"><ImagePlus /> Bosing yoki sudrab tashlang</span></span>}
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">Almashtirish</span>
            {lobbyImg.slot.dirty && <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">Saqlanmagan</span>}
          </button>
          <div className="relative z-10 mx-4 -mt-16 rounded-[26px] p-7 text-white shadow-2xl md:p-10 lg:m-0" style={{ background: color }}>
            <input form={F} name="lobby_title" defaultValue={s("lobby_title")} placeholder="Lobbi sarlavhasi"
                   className={`${inline} h-display px-2 text-[clamp(30px,3.6vw,48px)]`} />
            <textarea form={F} name="lobby_text" defaultValue={s("lobby_text")} rows={4} placeholder="Lobbi haqida qisqa matn"
                      className={`${inline} mt-4 resize-y px-2 py-1 leading-relaxed text-white/85`} />
            <LobbyFeatures schema={schema.lobby} items={items.lobby ?? []} projectId={record.id} />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">{lobbyImg.hint}</p>
        <div className="mt-2"><Toast text={lobbyImg.error} /></div>
      </section>

      {/* ===================== AFZALLIKLAR ===================== */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Afzalliklar ro&apos;yxati</h2>
        <p className="mb-3 text-xs text-muted">{fields.features?.help || "Har biri yangi qatorda"}</p>
        <textarea form={F} name="features" defaultValue={s("features")} rows={5} placeholder={"Yopiq hovli\nYer osti avtoturargohi"}
                  className="w-full resize-y rounded-[20px] border border-line bg-card p-5 leading-relaxed outline-none focus:border-accent" />
      </section>

      {/* ===================== JOYLASHUV ===================== */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Joylashuv — loyihaning xaritadagi nuqtasi</h2>
        <p className="mb-3 text-xs text-muted">Manzil matni yuqoridagi Hero&apos;da tahrirlanadi. Xaritada infratuzilma nuqtalari ham ko&apos;rinadi.</p>
        <div className="rounded-[24px] border border-line bg-card p-5 md:p-6">
          <LocationFields lat={record.latitude} lng={record.longitude} query={s("address")} formId={F} onDirty={() => setDirty(true)}
                          extra={infra} errors={[...(state.errors?.latitude ?? []), ...(state.errors?.longitude ?? [])]} />
        </div>
      </section>

      {/* ===================== INFRATUZILMA ===================== */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Infratuzilma — atrofdagi maktab, bog&apos;cha, shifoxona…</h2>
        <p className="mb-3 text-xs text-muted">Har bir nuqta saytdagi xaritada belgi bo&apos;lib chiqadi. Qo&apos;shishda joyini xarita havolasi bilan qo&apos;ying.</p>
        <ChildManager kind="infra" schema={schema.infra} items={items.infra ?? []} parent={{ name: "project", id: record.id }} />
      </section>

      {/* ===================== SOTUV BO'LIMI ===================== */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Sotuv bo&apos;limi — loyiha sahifasidagi ofis</h2>
        <p className="mb-3 text-xs text-muted">Ro&apos;yxatdan tanlang yoki shu yerning o&apos;zida yangisini qo&apos;shing. Ofislarni tahrirlash — «Sotuv ofislari» bo&apos;limida.</p>
        <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-line bg-card p-5 md:p-6">
          <select form={F} name="office" value={office} onChange={(e) => { setOffice(e.target.value); setDirty(true); }}
                  className="h-12 min-w-64 flex-1 rounded-xl border border-line bg-paper px-3 outline-none focus:border-accent">
            <option value="">— Ofis tanlanmagan —</option>
            {officeChoices.map((c) => <option key={c.value} value={String(c.value)}>{c.label}</option>)}
          </select>
          <button type="button" onClick={() => setOfficeForm(true)} className="btn btn-ink h-12 text-sm"><Plus size={16} /> Yangi sotuv ofisi</button>
        </div>
      </section>

      {/* ===================== GALEREYA ===================== */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Galereya</h2>
        <ChildManager kind="gallery" schema={schema.gallery} items={items.gallery ?? []} parent={{ name: "project", id: record.id }} />
      </section>

      {/* ===================== KATALOG ===================== */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Katalog (kitob) — sahifalar</h2>
        <p className="mb-3 text-xs text-muted">Sahifalar qo&apos;shilish tartibida 1, 2, 3… bo&apos;lib turadi va saytda kitobdek varaqlanadi.</p>
        <ChildManager kind="catalog" schema={schema.catalog} items={items.catalog ?? []} parent={{ name: "project", id: record.id }} />
      </section>

      {/* ===================== QO'SHIMCHA RASMLAR ===================== */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Qo&apos;shimcha rasmlar</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { m: coverImg, label: fields.cover?.label ?? "Karta rasmi", ratio: "aspect-[4/3]" },
            { m: logoImg, label: fields.logo?.label ?? "Logo", ratio: "aspect-square" },
          ].map(({ m, label, ratio }) => (
            <div key={label}>
              <button type="button" {...m.dropProps} onClick={m.open}
                      className={`group relative block w-full overflow-hidden rounded-[20px] border-2 border-dashed border-line bg-sand ${ratio}`}>
                {m.slot.url
                  ? <img src={m.slot.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
                  : <span className="absolute inset-0 grid place-items-center text-sm text-muted"><span className="grid justify-items-center gap-2"><ImagePlus /> Bosing yoki sudrab tashlang</span></span>}
                {m.slot.dirty && <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">Saqlanmagan</span>}
              </button>
              <p className="mt-2 text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted">{m.hint}</p>
              <div className="mt-1"><Toast text={m.error} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== ONLAYN VA SOZLAMALAR ===================== */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Onlayn kamera, 3D tur va sozlamalar</h2>
        <div className="grid gap-4 rounded-[24px] border border-line bg-card p-5 md:grid-cols-2 md:p-6">
          {[
            { name: "live_url", type: "url" }, { name: "tour_url", type: "url" },
            { name: "slug", type: "text" }, { name: "order", type: "number" },
          ].map(({ name, type }) => (
            <label key={name} className="block text-sm font-semibold">
              {fields[name]?.label ?? name}
              <input form={F} name={name} type={type} min={type === "number" ? 0 : undefined} defaultValue={s(name)}
                     className="mt-1.5 h-11 w-full rounded-xl border border-line bg-paper px-3 font-normal outline-none focus:border-accent" />
              {fields[name]?.help && <span className="mt-1 block text-xs font-normal text-muted">{fields[name].help}</span>}
            </label>
          ))}
          <label className="inline-flex cursor-pointer items-center gap-3 md:col-span-2">
            <input type="hidden" form={F} name="is_published" value="false" />
            <input type="checkbox" form={F} name="is_published" value="true" defaultChecked={record.is_published === true} className="peer sr-only" />
            <span className="relative h-7 w-12 rounded-full bg-line transition-colors after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5" />
            <span className="text-sm font-semibold">{fields.is_published?.label ?? "Saytda ko'rinsin"}</span>
          </label>
        </div>
      </section>

      {officeForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-night/60 backdrop-blur-sm" onClick={() => setOfficeForm(false)}>
          <div className="page-enter h-full w-full max-w-2xl overflow-y-auto bg-paper p-5 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-tight">Yangi sotuv ofisi</h3>
              <button type="button" onClick={() => setOfficeForm(false)} aria-label="Yopish" className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand"><X size={18} /></button>
            </div>
            <RecordForm kind="office" record={null} groups={schema.office.groups} submitLabel="Ofisni qo'shish"
                        onSaved={(id) => {
                          setNewOffice({ value: id, label: "Yangi ofis" });
                          setOffice(String(id));
                          setDirty(true);
                          setOfficeForm(false);
                          router.refresh();
                        }} />
          </div>
        </div>
      )}

      {/* ===================== SAQLASH ===================== */}
      {errors.length > 0 && (
        <div role="alert" className="rounded-2xl bg-[#fdecea] p-4 text-sm text-[#b3261e]">
          <p className="font-semibold">Saqlanmadi:</p>
          <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-full border border-line bg-card/90 p-2 pl-5 shadow-2xl backdrop-blur">
        <span className="text-sm font-medium text-muted">
          {pending ? "Saqlanmoqda…" : anyDirty ? "Loyiha: saqlanmagan o'zgarishlar bor" : state.ok ? "Loyiha saqlandi" : "Loyiha: o'zgarish yo'q"}
          <span className="hidden text-xs text-muted/70 md:inline"> · kartalar, slaydlar, infratuzilma, galereya va katalog o&apos;z tugmasi bilan saqlanadi</span>
        </span>
        {state.ok && !anyDirty && !pending && <Check size={16} className="text-[#2f7d4f]" />}
        <button type="submit" form={F} disabled={pending || !anyDirty} className="btn btn-accent ml-auto h-11 disabled:opacity-40">
          Saqlash
        </button>
      </div>
    </div>
  );
}

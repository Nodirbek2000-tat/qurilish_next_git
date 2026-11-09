"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRecord } from "@/app/(panel)/[panel]/actions";
import type { KindSchema, Rec } from "@/lib/panel";
import { RecordForm } from "./RecordForm";

/** Loyiha ichidagi ro'yxatlar (arxitektura, slaydlar, lobbi, infratuzilma, galereya, ofislar): qo'shish/tahrirlash/o'chirish */
export function ChildManager({
  kind, schema, items, parent,
}: { kind: string; schema: KindSchema; items: Rec[]; parent?: { name: string; id: number } }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Rec | "new" | null>(null);
  const [busy, start] = useTransition();
  const fields = schema.groups.flatMap((g) => g.fields);
  const titleField = fields.find((f) => ["title", "label", "name", "caption"].includes(f.name))?.name;
  const imageField = fields.find((f) => f.type === "image")?.name;
  const choice = (name: string, v: unknown) => fields.find((f) => f.name === name)?.choices?.find((c) => c.value === v)?.label;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{items.length} ta</p>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-ink h-11 text-sm"><Plus size={16} /> Qo&apos;shish</button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <li key={it.id} className="group flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
            {imageField && (
              <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it[imageField] ? <img src={String(it[imageField])} alt="" className="h-full w-full object-cover" /> : null}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{String(titleField ? it[titleField] ?? "—" : `#${it.id}`)}</span>
              <span className="block truncate text-xs text-muted">
                {kind === "infra" ? choice("category", it.category) : kind === "lobby" ? choice("icon", it.icon)
                  : kind === "catalog" ? `${it.order ?? "—"}-sahifa`
                  : kind === "history" || kind === "activity" ? `${it.year ?? "—"}-yil${it.organization ? ` · ${it.organization}` : ""}`
                  : `Tartib: ${it.order ?? "—"}`}
              </span>
            </span>
            <button type="button" onClick={() => setEditing(it)} aria-label="Tahrirlash" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand"><Pencil size={15} /></button>
            <button type="button" disabled={busy} aria-label="O'chirish"
                    onClick={() => confirm("O'chirilsinmi?") && start(async () => { await deleteRecord(kind, it.id); router.refresh(); })}
                    className="grid h-9 w-9 place-items-center rounded-full text-[#c2412d] hover:bg-[#fdecea]"><Trash2 size={15} /></button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">Hozircha bo&apos;sh</p>}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-night/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="page-enter h-full w-full max-w-2xl overflow-y-auto bg-paper p-5 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-tight">{editing === "new" ? "Yangi" : "Tahrirlash"}: {schema.label.toLowerCase()}</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Yopish" className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand"><X /></button>
            </div>
            <RecordForm
              kind={kind} record={editing === "new" ? null : editing} groups={schema.groups}
              hidden={parent ? { [parent.name]: parent.id } : undefined}
              onSaved={() => { setEditing(null); router.refresh(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

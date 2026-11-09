"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Rec, Schema } from "@/lib/panel";
import { ChildManager } from "./ChildManager";
import { RecordForm } from "./RecordForm";
import { VisualEditor } from "./VisualEditor";

const CHILD_TABS = [
  { kind: "arch", label: "Arxitektura" },
  { kind: "interior", label: "Ichki makon" },
  { kind: "lobby", label: "Lobbi afzalliklari" },
  { kind: "infra", label: "Infratuzilma" },
  { kind: "gallery", label: "Galereya" },
  { kind: "catalog", label: "Katalog (kitob)" },
] as const;

/** Loyiha muharriri: asosiy guruhlar va ichki ro'yxatlar tablar bilan */
export function ProjectEditor({
  schema, record, items, base,
}: { schema: Schema; record: Rec | null; items: Record<string, Rec[]> | null; base: string }) {
  const router = useRouter();
  const groups = schema.project.groups;
  const tabs = [
    ...(record ? [{ key: "visual", label: "✦ Vizual" }] : []),
    ...groups.map((g) => ({ key: `g:${g.title}`, label: g.title })),
    ...(record ? CHILD_TABS.map((c) => ({ key: c.kind, label: c.label, count: items?.[c.kind]?.length ?? 0 })) : []),
  ];
  const [tab, setTab] = useState(tabs[0].key);
  const child = CHILD_TABS.find((c) => c.kind === tab);

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-line bg-paper/90 px-4 py-2 backdrop-blur md:-mx-10 md:px-10 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    tab === t.key ? "bg-ink text-paper" : "text-muted hover:text-ink"
                  }`}>
            {t.label}{"count" in t ? <sup className="ml-1 opacity-60">{String(t.count)}</sup> : null}
          </button>
        ))}
      </div>

      {/* Asosiy forma: hamma guruhlar bitta formada, faqat tanlangani ko'rinadi — bitta "Saqlash" */}
      {tab === "visual" && record && (
        // Saqlangandan keyin yangi qiymatlar bilan qayta o'rnatiladi
        // counts (kartalar soni) kalitga kirmaydi — karta saqlansa, loyiha maydonlaridagi saqlanmagan o'zgarishlar yo'qolmasin
        <VisualEditor key={JSON.stringify({ ...record, counts: null })}
                      schema={schema} record={record} items={items ?? {}} />
      )}

      <div className={child || tab === "visual" ? "hidden" : ""}>
        <ProjectForm record={record} groups={groups} active={tab}
                     onCreated={(id) => router.replace(`${base}/${id}`)} />
      </div>

      {child && record && items && (
        <ChildManager kind={child.kind} schema={schema[child.kind]} items={items[child.kind] ?? []} parent={{ name: "project", id: record.id }} />
      )}
    </div>
  );
}

function ProjectForm({ record, groups, active, onCreated }: {
  record: Rec | null; groups: Schema[string]["groups"]; active: string; onCreated: (id: number) => void;
}) {
  return (
    <div className="[&_fieldset]:hidden" data-active={active}>
      <style>{groups.map((g, i) => `[data-active="g:${g.title}"] fieldset:nth-of-type(${i + 1}){display:block}`).join("")}</style>
      <RecordForm kind="project" record={record} groups={groups}
                  onSaved={(id) => { if (!record) onCreated(id); }}
                  submitLabel={record ? "O'zgarishlarni saqlash" : "Loyihani yaratish"} />
    </div>
  );
}

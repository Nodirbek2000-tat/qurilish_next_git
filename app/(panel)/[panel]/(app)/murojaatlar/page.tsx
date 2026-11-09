import { Search, X } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { AppealState } from "@/components/panel/AppealState";
import { panelGet, panelPath } from "@/lib/panel";

type Filters = { davr?: string; manba?: string; state?: string; q?: string };
type Option = { value: string; label: string; count?: number };

const PERIODS = [
  { value: "", label: "Hammasi" }, { value: "bugun", label: "Bugun" }, { value: "kecha", label: "Kecha" },
  { value: "hafta", label: "7 kun" }, { value: "oy", label: "30 kun" },
];

/** Joriy filtrlardan bittasini almashtirib havola yasaydi */
function href(f: Filters, patch: Filters) {
  const next = { ...f, ...patch };
  const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
  return panelPath(`/murojaatlar${qs ? `?${qs}` : ""}`);
}

function Chip({ to, on, children }: { to: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link href={to} scroll={false}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${on ? "bg-ink text-paper" : "bg-card text-muted ring-1 ring-line hover:text-ink"}`}>
      {children}
    </Link>
  );
}

type Appeal = {
  id: number; kind: string; category: string; name: string; phone: string; email: string; subject: string; message: string;
  company: string; inn: string; docNumber: string; note: string;
  country: string; project: string | null; flat: number | null; state: string; created: string;
};

async function List({ searchParams }: { searchParams: Promise<Filters> }) {
  const sp = await searchParams;
  const f: Filters = { davr: sp.davr ?? "", manba: sp.manba ?? "", state: sp.state ?? "", q: (sp.q ?? "").slice(0, 60) };
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
  const { items, states, sources, total } = await panelGet<{ items: Appeal[]; states: Option[]; sources: Option[]; total: number }>(
    `/appeals/${qs ? `?${qs}` : ""}`);
  const filtered = Boolean(f.davr || f.manba || f.state || f.q);
  return (
    <div className="space-y-5">
      {/* ---------- Filtrlar ---------- */}
      <div className="space-y-3 rounded-[20px] border border-line bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => <Chip key={p.value} to={href(f, { davr: p.value })} on={(f.davr ?? "") === p.value}>{p.label}</Chip>)}
          <form action={panelPath("/murojaatlar")} className="relative ml-auto w-full sm:w-64">
            {f.davr && <input type="hidden" name="davr" value={f.davr} />}
            {f.manba && <input type="hidden" name="manba" value={f.manba} />}
            {f.state && <input type="hidden" name="state" value={f.state} />}
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={f.q} placeholder="Ism yoki telefon" className="h-9 w-full rounded-full border border-line bg-paper pr-3 pl-9 text-sm outline-none focus:border-ink" />
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip to={href(f, { state: "" })} on={!f.state}>Barcha holat</Chip>
          {states.map((s) => (
            <Chip key={s.value} to={href(f, { state: s.value })} on={f.state === s.value}>
              {s.label} <span className="ml-1 tabular-nums opacity-60">{s.count}</span>
            </Chip>
          ))}
                  </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
          <Chip to={href(f, { manba: "" })} on={!f.manba}>Hamma joydan</Chip>
          {sources.map((s) => <Chip key={s.value} to={href(f, { manba: s.value })} on={f.manba === s.value}>{s.label}</Chip>)}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>Topildi: <b className="text-ink tabular-nums">{total}</b> ta</span>
        {filtered && <Link href={panelPath("/murojaatlar")} className="inline-flex items-center gap-1 font-semibold hover:text-ink"><X size={14} /> Filtrni tozalash</Link>}
      </div>

      <div className="space-y-3">
      {items.map((a) => (
        <article key={a.id} className={`rounded-[20px] border bg-card p-5 ${a.state === "yangi" ? "border-accent" : "border-line"}`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <b className="text-lg">{a.name}</b>
            <a href={`tel:${a.phone.replace(/[^\d+]/g, "")}`} className="font-semibold tabular-nums text-accent">{a.phone}</a>
            {a.email && <a href={`mailto:${a.email}`} className="text-sm text-muted hover:text-accent">{a.email}</a>}
            <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{a.category}</span>
            <span className="ml-auto text-xs text-muted">{new Date(a.created).toLocaleString("uz-UZ")}</span>
          </div>
          {(a.company || a.docNumber) && (
            <p className="mt-2 text-sm">
              {a.company && <b>{a.company} · STIR {a.inn}</b>}{a.company && a.docNumber ? " · " : ""}{a.docNumber && `Hujjat: ${a.docNumber}`}
            </p>
          )}
          {(a.project || a.flat || a.country) && (
            <p className="mt-2 text-sm text-muted">
              {a.project}{a.flat ? ` · xonadon #${a.flat}` : ""}{a.country ? ` · ${a.country}` : ""}
            </p>
          )}
          {a.subject && <p className="mt-3 font-semibold">{a.subject}</p>}
          {a.message && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{a.message}</p>}
          {a.note && <p className="mt-2 text-xs text-muted">Izoh: {a.note}</p>}
          <div className="mt-4"><AppealState id={a.id} state={a.state} states={states} /></div>
        </article>
      ))}
      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          {filtered ? "Bu filtr bo'yicha murojaat yo'q" : "Murojaatlar yo'q"}
        </p>
      )}
      </div>
    </div>
  );
}

export default function AppealsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  return (
    <div className="space-y-6">
      <h1 className="h-display text-[clamp(32px,4vw,48px)]">Murojaatlar</h1>
      <Suspense fallback={<HouseLoader className="h-80" />}><List searchParams={searchParams} /></Suspense>
    </div>
  );
}

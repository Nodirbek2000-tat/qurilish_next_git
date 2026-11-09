import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { panelGet, panelPath, type Rec } from "@/lib/panel";

const STATUS: Record<string, string> = { qurilmoqda: "Qurilmoqda", sotuvda: "Sotuvda", topshirilgan: "Topshirilgan" };

async function List() {
  const { items } = await panelGet<{ items: Rec[] }>("/project/");
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => (
        <Link key={p.id} href={panelPath(`/loyihalar/${p.id}`)}
              className="group overflow-hidden rounded-[22px] border border-line bg-card transition-all hover:-translate-y-1 hover:border-accent">
          <div className="relative aspect-[16/9] bg-sand" style={{ background: String(p.color) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {Boolean(p.hero || p.cover) && <img src={String(p.hero || p.cover)} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            {!p.is_published && <span className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">Yashirin</span>}
          </div>
          <div className="p-5">
            <p className="text-lg font-semibold">{String(p.title)}</p>
            <p className="text-sm text-muted">{STATUS[String(p.status)]} · /{String(p.slug)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="h-display text-[clamp(32px,4vw,48px)]">Loyihalar</h1>
        <Link href={panelPath("/loyihalar/yangi")} className="btn btn-accent"><Plus size={17} /> Yangi loyiha</Link>
      </div>
      <Suspense fallback={<HouseLoader className="h-80" />}><List /></Suspense>
    </div>
  );
}

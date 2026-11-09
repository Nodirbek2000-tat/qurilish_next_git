import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/HouseLoader";
import { Crumbs, ProjectTheme } from "@/components/ProjectTheme";
import type { Flat } from "@/lib/api";
import { getBuilding } from "@/lib/api";
import { formatArea, roomsLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Qavat va xonadon tanlash" };

const STATUS_STYLE: Record<Flat["status"], string> = {
  sotuvda: "border-accent/40 bg-card hover:bg-accent hover:text-on-accent hover:border-accent",
  band: "border-line bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(18_20_23/0.05)_6px_12px)] text-muted",
  sotilgan: "border-transparent bg-ink/[0.06] text-muted/70",
};

export default function BuildingPage({ params, searchParams }: PageProps<"/bino/[id]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Building params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Building({ params, searchParams }: Pick<PageProps<"/bino/[id]">, "params" | "searchParams">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const b = await getBuilding(id, typeof sp.qavat === "string" ? sp.qavat : "");
  if (!b) notFound();
  const p = b.project;

  return (
    <>
      <ProjectTheme color={p.color} />
      <section className="container-x pt-28 pb-24 md:pt-32">
        <Crumbs items={[
          { href: "/loyihalar", label: "Loyihalarimiz" },
          { href: `/loyihalar/${p.slug}`, label: p.title },
          { href: `/loyihalar/${p.slug}/genplan`, label: "Genplan" },
          { label: `${b.number}-blok` },
        ]} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr_120px]">
          {/* ---- Ma'lumot ---- */}
          <aside className="space-y-6" data-reveal>
            <div>
              <p className="h-display text-[72px] text-accent">{b.number}</p>
              <p className="text-lg font-semibold">blok · {b.queue}-navbat</p>
              {b.year && <p className="text-muted">Topshirish: {b.year}</p>}
            </div>
            {b.siblings.length > 1 && (
              <div>
                <p className="eyebrow mb-3">Boshqa bloklar</p>
                <div className="flex flex-wrap gap-2">
                  {b.siblings.map(([sid, num]) => (
                    <Link key={sid} href={`/bino/${sid}`}
                          className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-semibold transition-colors ${
                            sid === b.id ? "border-accent bg-accent text-on-accent" : "border-line hover:border-ink"
                          }`}>
                      {num}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3"><span className="h-4 w-4 rounded border border-accent/40 bg-card" /> Sotuvda</li>
              <li className="flex items-center gap-3"><span className="h-4 w-4 rounded border border-line bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgb(18_20_23/0.12)_3px_6px)]" /> Band qilingan</li>
              <li className="flex items-center gap-3"><span className="h-4 w-4 rounded bg-ink/10" /> Sotilgan</li>
            </ul>
          </aside>

          {/* ---- Qavat ---- */}
          <div className="min-w-0" data-reveal="fade">
            <div className="flex items-baseline justify-between">
              <h1 className="text-3xl font-semibold tracking-tight">{b.floor}-qavat</h1>
              <span className="text-muted">{b.flats.filter((f) => f.status === "sotuvda").length} ta sotuvda</span>
            </div>

            {b.floorPlan && (
              <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-[24px] border border-line bg-card">
                <Image src={b.floorPlan} alt={`${b.floor}-qavat rejasi`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain p-4" />
              </div>
            )}

            {b.flats.length === 0 ? (
              <p className="mt-6 rounded-[24px] border border-dashed border-line p-10 text-center text-muted">Bu qavatda xonadonlar yo&apos;q</p>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {b.flats.map((f, i) => {
                  const body = (
                    <>
                      <span className="flex items-center justify-between text-xs font-semibold opacity-70">
                        <span>№ {f.number}</span>
                        <span>{f.statusLabel}</span>
                      </span>
                      <span className="mt-6 block text-xl font-semibold tracking-tight">{roomsLabel(f.rooms, f.kind)}</span>
                      <span className="mt-1 block tabular-nums">{formatArea(f.area)}</span>
                    </>
                  );
                  const cls = `block rounded-[18px] border p-4 transition-all duration-300 ${STATUS_STYLE[f.status]}`;
                  return f.status === "sotuvda" ? (
                    <Link key={f.id} href={`/kvartira/${f.id}`} className={cls} data-reveal style={{ "--d": i % 3 } as React.CSSProperties}>{body}</Link>
                  ) : (
                    <div key={f.id} className={cls} aria-disabled="true">{body}</div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---- Qavat tanlash ---- */}
          <nav aria-label="Qavatlar" className="order-first lg:order-none">
            <p className="eyebrow mb-3">Qavat</p>
            <ol className="flex gap-1.5 overflow-x-auto pb-2 lg:max-h-[70vh] lg:flex-col lg:overflow-y-auto lg:pr-1">
              {b.floors.map(({ floor, available }) => (
                <li key={floor}>
                  <Link
                    href={`/bino/${b.id}?qavat=${floor}`}
                    scroll={false}
                    aria-current={floor === b.floor ? "page" : undefined}
                    className={`flex h-10 min-w-12 items-center justify-between gap-2 rounded-full border px-3 text-sm font-semibold tabular-nums transition-colors ${
                      floor === b.floor ? "border-accent bg-accent text-on-accent"
                        : available ? "border-line hover:border-ink" : "border-transparent text-muted/50"
                    }`}
                  >
                    {floor}
                    {available > 0 && floor !== b.floor && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>
    </>
  );
}

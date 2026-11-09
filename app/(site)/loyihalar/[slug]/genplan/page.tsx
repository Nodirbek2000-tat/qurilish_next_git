import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/HouseLoader";
import { Crumbs, ProjectTheme } from "@/components/ProjectTheme";
import { BuildingArt } from "@/components/BuildingArt";
import { getGenplan } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/loyihalar/[slug]/genplan">): Promise<Metadata> {
  const g = await getGenplan((await params).slug);
  return { title: g ? `${g.title} — genplan va bloklar` : "Genplan" };
}

export default function GenplanPage({ params }: PageProps<"/loyihalar/[slug]/genplan">) {
  return (
    <Suspense fallback={<PageLoader />}>
      {params.then(({ slug }) => <Genplan slug={slug} />)}
    </Suspense>
  );
}

async function Genplan({ slug }: { slug: string }) {
  const g = await getGenplan(slug);
  if (!g) notFound();

  return (
    <>
      <ProjectTheme color={g.color} />
      <section className="container-x pt-28 pb-10 md:pt-32">
        <Crumbs items={[{ href: "/loyihalar", label: "Loyihalarimiz" }, { href: `/loyihalar/${g.slug}`, label: g.title }, { label: "Blokni tanlang" }]} />
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h1 className="h-display text-[clamp(40px,6vw,84px)]">
            <span className="line-mask"><span>{g.title}</span></span>
          </h1>
          <p className="max-w-sm text-muted" data-reveal>Genplanda blokni tanlang — keyin qavat va xonadonni tanlaysiz.</p>
        </div>
      </section>

      <section className="container-x pb-16">
        <p className="mb-3 flex items-center gap-2 text-sm text-muted md:hidden">
          <span className="inline-block animate-pulse">←</span> Rasmni yon tomonga suring <span className="inline-block animate-pulse">→</span>
        </p>
        <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-4 md:mx-0 md:px-0" data-reveal="scale">
          <div className="relative min-w-[880px] overflow-hidden rounded-[28px] bg-sand">
            {g.genplan ? (
              <Image src={g.genplan} alt={`${g.title} genplani`} width={1600} height={1000} sizes="(min-width: 1320px) 1240px, 100vw" className="block h-auto w-full" preload />
            ) : (
              <BuildingArt seed={g.slug} color={g.color} className="block aspect-[16/10] w-full" />
            )}

            {g.buildings.map((b) => (
              <Link
                key={b.id}
                href={`/bino/${b.id}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                aria-label={`${b.number}-blok, ${b.available} ta xonadon sotuvda`}
              >
                {b.available > 0 && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-30" />}
                <span className={`relative grid h-14 w-14 place-items-center rounded-full border-4 border-white text-lg font-bold shadow-xl transition-transform duration-300 group-hover:scale-110 ${
                  b.available > 0 ? "bg-accent text-on-accent" : "bg-night/70 text-white"
                }`}>
                  {b.number}
                </span>
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 w-max -translate-x-1/2 translate-y-2 rounded-2xl bg-night px-4 py-3 text-sm text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <b>{b.number}-blok</b> · {b.floors} qavat
                  <br />
                  <span className="text-white/70">{b.available > 0 ? `${b.available} ta xonadon sotuvda` : "Barchasi sotilgan"}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {g.buildings.map((b, i) => (
            <Link key={b.id} href={`/bino/${b.id}`} data-reveal style={{ "--d": i % 4 } as React.CSSProperties}
                  className="group rounded-[22px] border border-line bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent">
              <div className="flex items-center justify-between">
                <span className="h-display text-5xl group-hover:text-accent">{b.number}</span>
                <span className="text-sm text-muted">{b.queue}-navbat</span>
              </div>
              <p className="mt-4 font-semibold">{b.number}-blok · {b.floors} qavat</p>
              <p className="mt-1 text-sm text-muted">
                {b.year ? `Topshirish: ${b.year}` : ""} {b.available > 0 ? `· ${b.available} ta sotuvda` : "· sotilgan"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

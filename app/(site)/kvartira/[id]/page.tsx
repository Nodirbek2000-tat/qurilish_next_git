import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/HouseLoader";
import { FavButton } from "@/components/FavButton";
import { FlatMedia } from "@/components/FlatMedia";
import { FlatCard } from "@/components/FlatCard";
import { FlatPlan } from "@/components/FlatPlan";
import { FlatRooms } from "@/components/FlatRooms";
import { LeadForm } from "@/components/LeadForm";
import { MortgageCalc } from "@/components/MortgageCalc";
import { Crumbs, ProjectTheme } from "@/components/ProjectTheme";
import { Arrow, SectionHead } from "@/components/ui";
import { formatArea, formatPrice, roomsLabel, telHref } from "@/lib/format";
import { getFlat, getSite } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/kvartira/[id]">): Promise<Metadata> {
  const f = await getFlat((await params).id);
  if (!f) return { title: "Xonadon topilmadi" };
  return {
    title: `${roomsLabel(f.rooms, f.kind)}, ${formatArea(f.area)} — ${f.project.title}`,
    description: `${f.project.title}, ${f.building.number}-blok, ${f.floor}-qavat. ${roomsLabel(f.rooms, f.kind)} xonadon, ${formatArea(f.area)}.`,
  };
}

export default function FlatPage({ params }: PageProps<"/kvartira/[id]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      {params.then(({ id }) => <FlatView id={id} />)}
    </Suspense>
  );
}

async function FlatView({ id }: { id: string }) {
  const [f, site] = await Promise.all([getFlat(id), getSite()]);
  if (!f) notFound();
  const gallery = f.gallery ?? [];
  const about = f.about ?? [];
  const parts = f.parts ?? [];

  const facts = [
    ["Loyiha", f.project.title],
    ["Blok", `${f.building.number}-blok, ${f.building.queue}-navbat`],
    ["Qavat", `${f.floor} / ${f.buildingFloors}`],
    ["Xonalar", f.kind === "tijorat" ? "Tijorat" : String(f.rooms)],
    ["Umumiy maydon", formatArea(f.area)],
    ["Topshirish", f.year ? String(f.year) : "—"],
  ];

  return (
    <>
      <ProjectTheme color={f.project.color} />
      <section className="container-x overflow-x-clip pt-28 pb-16 md:pt-32">
        <Crumbs items={[
          { href: `/loyihalar/${f.project.slug}`, label: f.project.title },
          { href: `/bino/${f.building.id}?qavat=${f.floor}`, label: `${f.building.number}-blok, ${f.floor}-qavat` },
          { label: `№ ${f.number}` },
        ]} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          {/* Kirganda: rasm chapdan, ma'lumot o'ngdan */}
          <div className="enter-left space-y-6">
            <FlatMedia plan={f.plan} photos={gallery} alt={`${roomsLabel(f.rooms, f.kind)}, ${formatArea(f.area)}`}
                       fallback={<FlatPlan rooms={f.rooms} area={f.area} kind={f.kind} className="h-full w-full" />}>
              <FavButton id={f.id} className="absolute top-5 right-5" />
            </FlatMedia>
            {parts.length > 0 && <FlatRooms parts={parts} total={f.area} />}
          </div>

          <div className="enter-right lg:sticky lg:top-28">
            <p className="eyebrow" data-reveal>
              <span className={`mr-2 inline-block h-2 w-2 rounded-full align-middle ${f.status === "sotuvda" ? "bg-[#2f9e62]" : "bg-[#d39b2a]"}`} />
              {f.statusLabel} · № {f.number}
            </p>
            <h1 className="h-display mt-4 text-[clamp(40px,5vw,72px)]">
              <span className="line-mask"><span>{roomsLabel(f.rooms, f.kind)}</span></span>
              <span className="line-mask"><span style={{ "--d": 1 } as React.CSSProperties} className="text-accent">{formatArea(f.area)}</span></span>
            </h1>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line">
              {facts.map(([k, v], i) => (
                <div key={k} className="bg-card px-5 py-4" data-reveal style={{ "--d": i % 3 } as React.CSSProperties}>
                  <dt className="text-xs tracking-wider text-muted uppercase">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-[22px] bg-sand p-6" data-reveal>
              <p className="text-sm text-muted">Narx</p>
              <p className="text-2xl font-semibold tabular-nums">{f.price ? formatPrice(f.price) : "So'rov bo'yicha"}</p>
              {f.priceM2 ? <p className="mt-1 text-sm text-muted tabular-nums">1 m² — {formatPrice(f.priceM2)}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#sorov" className="btn btn-accent">Ma&apos;lumot olish <Arrow /></a>
                {site.phone && <a href={telHref(site.phone)} className="btn btn-ghost">Qo&apos;ng&apos;iroq qilish</a>}
              </div>
            </div>

            {f.floorPlan && (
              <Link href={`/bino/${f.building.id}?qavat=${f.floor}`} className="link-arrow mt-6 hover:text-accent">
                Qavat rejasini ko&apos;rish <Arrow />
              </Link>
            )}
          </div>
        </div>
      </section>

      {about.length > 0 && (
        <section className="container-x py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow" data-reveal>Xonadon haqida</p>
              <h2 className="h-display mt-4 text-[clamp(30px,3.6vw,48px)]" data-reveal>{roomsLabel(f.rooms, f.kind)}, {formatArea(f.area)}</h2>
            </div>
            <div className="space-y-5 lg:col-span-7 lg:col-start-6">
              {about.map((p, i) => (
                <p key={i} data-reveal style={{ "--d": i } as React.CSSProperties}
                   className={i === 0 ? "text-xl leading-relaxed font-medium md:text-2xl" : "text-lg leading-relaxed text-muted"}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-x py-16">
        <SectionHead eyebrow="Muddatli to'lov" title={<>Oylik to&apos;lovni<br />oldindan biling</>} />
        <div data-reveal="scale"><MortgageCalc priceM2={f.priceM2} area={f.area} price={f.price} /></div>
      </section>

      {f.sameFloor.length > 0 && (
        <section className="container-x py-16">
          <SectionHead eyebrow="Shu qavatda" title="Boshqa xonadonlar" link={{ href: `/bino/${f.building.id}?qavat=${f.floor}`, label: "Qavatni ko'rish" }} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {f.sameFloor.map((x, i) => <FlatCard key={x.id} flat={x} index={i} />)}
          </div>
        </section>
      )}

      {/* Bog'lanish — har doim sahifaning eng pastida */}
      <section id="sorov" className="container-x scroll-mt-28 pt-8 pb-24">
        <div className="grid gap-10 rounded-[32px] bg-premium p-8 text-white md:p-14 lg:grid-cols-2 lg:items-center" data-reveal="scale">
          <div>
            <p className="eyebrow !text-white/50">{f.project.title} · № {f.number}</p>
            <h2 className="h-display mt-4 text-[clamp(32px,4vw,52px)]">Shu xonadon haqida<br />batafsil bilib oling</h2>
            <p className="mt-5 max-w-md text-white/60">Narx, to&apos;lov rejasi va ko&apos;rish vaqtini menejer aytib beradi.</p>
            {site.phone && (
              <a href={telHref(site.phone)} className="mt-6 inline-block text-2xl font-semibold tabular-nums hover:text-accent">{site.phone}</a>
            )}
          </div>
          <LeadForm source="xonadon" flat={f.id} project={f.project.slug} dark />
        </div>
      </section>
    </>
  );
}

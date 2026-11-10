import { Building2, CalendarCheck, Layers, Ruler } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FlatCard } from "@/components/FlatCard";
import { Flipbook } from "@/components/Flipbook";
import { Gallery } from "@/components/Gallery";
import { PageLoader } from "@/components/HouseLoader";
import { GirihPattern } from "@/components/Decor";
import { LeadForm } from "@/components/LeadForm";
import { MortgageCalc } from "@/components/MortgageCalc";
import { AboutSection } from "@/components/project/AboutSection";
import { FloatingDock } from "@/components/project/FloatingDock";
import { InfraSection } from "@/components/project/InfraSection";
import { InteriorSlider } from "@/components/project/InteriorSlider";
import { LocationSection } from "@/components/project/LocationSection";
import { ArchSection, LobbySection } from "@/components/project/Sections";
import { ProjectTheme } from "@/components/ProjectTheme";
import { BuildingArt } from "@/components/BuildingArt";
import { Arrow, PostCard, ProjectCard, SectionHead, StatusChip } from "@/components/ui";
import { getFlats, getProject, getSite } from "@/lib/api";
import { formatNumber, readableOn } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/loyihalar/[slug]">): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return { title: "Loyiha topilmadi" };
  return {
    title: `${p.title} — ${p.klass.toLowerCase()} toifadagi turar-joy majmuasi`,
    description: p.tagline || p.description[0]?.slice(0, 160),
    openGraph: (p.hero ?? p.cover) ? { images: [(p.hero ?? p.cover)!] } : undefined,
  };
}

export default function ProjectPage({ params }: PageProps<"/loyihalar/[slug]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      {params.then(({ slug }) => <ProjectDetail slug={slug} />)}
    </Suspense>
  );
}

const SOCIAL_LABELS: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", telegram: "Telegram", youtube: "YouTube" };
// Hero panelidagi ustunlar soni faktlar soniga teng (Tailwind sinflari to'liq yozilishi shart)
const FACT_COLS = ["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];

async function ProjectDetail({ slug }: { slug: string }) {
  const [p, flats, site] = await Promise.all([getProject(slug), getFlats(`project=${encodeURIComponent(slug)}&per=4&kind=turar`), getSite()]);
  if (!p) notFound();

  const color = /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : "#b85c38";
  const onColor = readableOn(color);
  const heroImg = p.hero ?? p.cover;
  const facts = [
    { k: "Toifa", v: p.klass, Icon: Building2 },
    p.floors && { k: "Qavatlar", v: String(p.floors), Icon: Layers },
    p.area && { k: "Maydon", v: `${formatNumber(p.area)} m²`, Icon: Ruler },
    p.handover && { k: "Topshirish", v: p.handover, Icon: CalendarCheck },
  ].filter(Boolean) as { k: string; v: string; Icon: typeof Layers }[];
  const stats = [
    p.about.blocks && { value: p.about.blocks, label: "Bloklar" },
    p.flats && { value: p.flats, label: "Xonadonlar" },
    p.about.queues && { value: p.about.queues, label: "Navbatlar" },
    p.area && { value: p.area, label: "m², loyiha maydoni" },
  ].filter(Boolean) as { value: number; label: string }[];
  const socials = Object.entries(site.socials).map(([k, url]) => [SOCIAL_LABELS[k] ?? k, url as string] as [string, string]);

  return (
    <>
      <ProjectTheme color={color} darkHero />
      <FloatingDock liveUrl={p.liveUrl} tourUrl={p.tourUrl} title={p.title} />

      {/* ---------- HERO: to'liq ekranli fon ---------- */}
      <section className="relative flex min-h-[100svh] overflow-hidden bg-night text-white">
        <div className="absolute inset-0">
          {heroImg
            ? <Image src={heroImg} alt={p.title} fill preload sizes="100vw" quality={85} className="kenburns object-cover" />
            : <BuildingArt seed={p.slug} color={color} className="absolute inset-0 h-full w-full" />}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.1)_35%,rgb(0_0_0/0.25)_60%,rgb(0_0_0/0.85)_100%)]" />
          <div className="absolute inset-0 opacity-60 mix-blend-multiply" style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 55%)` }} />
        </div>

        <div className="container-x relative flex flex-1 flex-col justify-end pt-32 pb-44 md:pb-48">
          <Link href="/loyihalar" className="link-arrow mb-auto w-fit pb-10 text-sm text-white/70 transition-colors hover:text-white">
            <Arrow className="rotate-180" /> Barcha loyihalar
          </Link>
          <div className="flex flex-wrap items-center gap-3" data-reveal>
            <StatusChip project={p} light />
            <span className="text-sm text-white/75">{p.address}</span>
          </div>
          <h1 className="h-display mt-6 max-w-5xl text-[clamp(56px,10vw,160px)]">
            <span className="line-mask"><span>{p.title}</span></span>
          </h1>
          {p.tagline && <p className="mt-6 max-w-xl text-xl text-white/85 md:text-2xl" data-reveal>{p.tagline}</p>}
          {p.status !== "topshirilgan" && (
            <div className="mt-10 flex flex-wrap gap-3" data-reveal>
              <Link href={`/kvartiralar?project=${p.slug}`} className="btn bg-white text-[#14171a] hover:bg-accent hover:text-on-accent">
                Kvartira tanlash <Arrow />
              </Link>
            </div>
          )}
        </div>

        {/* Shisha panel: asosiy raqamlar */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-x pb-6">
            <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-white/15 bg-white/10 backdrop-blur-xl ${FACT_COLS[facts.length]}`}>
              {facts.map(({ k, v, Icon }) => (
                <div key={k} className="bg-black/10 px-5 py-4 odd:last:col-span-2 md:px-6 md:py-5 md:odd:last:col-span-1">
                  <dt className="flex items-center gap-2 text-xs tracking-wider text-white/60 uppercase"><Icon size={13} /> {k}</dt>
                  <dd className="mt-1.5 text-lg font-semibold md:text-xl">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- GALEREYA: hero'dan keyinoq ---------- */}
      {p.gallery.length > 0 && (
        <section className="container-x pt-24 pb-4 md:pt-32">
          <SectionHead eyebrow="Galereya" title="Loyihani ko'ring" />
          <Gallery items={p.gallery} title={p.title} />
        </section>
      )}

      {/* ---------- LOYIHA HAQIDA ---------- */}
      <section className="container-x py-24 md:py-32">
        <AboutSection title={p.title} paragraphs={p.description} address={p.address} lat={p.lat} lng={p.lng}
                      image={p.about.image} video={p.about.video} fallbackImage={p.cover} stats={stats} />
      </section>

      {/* ---------- INFRATUZILMA ---------- */}
      {p.lat && p.lng && (
        <section className="container-x py-16">
          <SectionHead eyebrow="Atrofda" title="Infratuzilma" />
          <InfraSection title={p.title} lat={p.lat} lng={p.lng} logo={p.logo} color={color} points={p.infra} />
        </section>
      )}

      {/* ---------- ARXITEKTURA ---------- */}
      {p.arch.length > 0 && (
        <section className="container-x py-24">
          <SectionHead eyebrow="Arxitektura" title="Har bir detal o'ylangan" />
          <ArchSection items={p.arch} seed={p.slug} color={color} />
        </section>
      )}

      {/* ---------- ICHKI MAKON ---------- */}
      {p.interior.length > 0 && (
        <section className="container-x py-16">
          <InteriorSlider slides={p.interior} />
        </section>
      )}

      {/* ---------- KVARTIRA TANLASH ---------- */}
      {flats.items.length > 0 && (
        <section className="container-x py-24">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow" data-reveal>Sotuvda: {flats.total} ta xonadon</p>
              <h2 className="h-display mt-4 text-[clamp(34px,5vw,64px)]" data-reveal>Kvartira tanlash</h2>
            </div>
            <div className="flex flex-wrap gap-3" data-reveal>
              <Link href={`/kvartiralar?project=${p.slug}`} className="btn btn-accent">Barcha xonadonlar <Arrow /></Link>
            </div>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&>*]:w-[82%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto">
            {flats.items.map((f, i) => <FlatCard key={f.id} flat={f} index={i} />)}
          </div>
        </section>
      )}

      {/* ---------- NAFIS LOBBI ---------- */}
      {(p.lobby.text || p.lobby.image || p.lobby.features.length > 0) && (
        <section className="container-x py-24">
          <LobbySection lobby={p.lobby} seed={p.slug} color={color} />
        </section>
      )}

      {/* ---------- KATALOG (kitob) ---------- */}
      {p.catalog.length > 0 && (
        <section id="katalog" className="container-x scroll-mt-24 py-24">
          <SectionHead eyebrow="Katalog" title={<>Loyiha katalogini<br />kitobdek varaqlang</>} />
          <div data-reveal="scale"><Flipbook pages={p.catalog} title={p.title} /></div>
        </section>
      )}

      {/* ---------- MUDDATLI TO'LOV ---------- */}
      <section className="container-x py-20">
        <SectionHead eyebrow="Muddatli to'lov" title={<>Oylik to&apos;lovni<br />oldindan biling</>} />
        <div data-reveal="scale"><MortgageCalc priceM2={p.priceM2} /></div>
      </section>

      {/* ---------- SAVDO OFISI / OBYEKT ---------- */}
      <section className="container-x py-20">
        <LocationSection title={p.title} address={p.address} lat={p.lat} lng={p.lng} logo={p.logo} photo={p.cover} color={color}
                         office={p.office} workHours={site.workHours} socials={socials} />
      </section>

      {/* ---------- YANGILIKLAR ---------- */}
      {p.news.length > 0 && (
        <section className="container-x py-20">
          <SectionHead eyebrow="Qurilishdan xabarlar" title="Loyiha yangiliklari" link={{ href: "/media", label: "Barchasi" }} />
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
            {p.news.map((n, i) => <PostCard key={n.slug} post={n} index={i} />)}
          </div>
        </section>
      )}

      {/* ---------- SO'ROV ---------- */}
      <section id="sorov" className="container-x scroll-mt-24 py-20">
        <div className="relative overflow-hidden rounded-[32px] px-6 py-16 md:px-16 md:py-20" style={{ background: color, color: onColor }} data-reveal="scale">
          {/* Girih ramka: chetlarda ko'rinadi, o'rtada (matn va forma ostida) so'nadi */}
          <GirihPattern id="girih-project" scale={1.2} className="inset-0 h-full w-full opacity-[0.16] [mask-image:radial-gradient(ellipse_70%_85%_at_50%_50%,transparent_40%,black)]" />
          <div className="relative mx-auto max-w-4xl">
            <div className="text-center">
              <p className="eyebrow !text-current opacity-60">{p.title}</p>
              <h2 className="h-display mt-4 text-[clamp(34px,4.6vw,60px)]">Ko&apos;proq bilmoqchimisiz?</h2>
              <p className="mx-auto mt-6 max-w-xl opacity-70">Kontaktlaringizni qoldiring — menejerimiz loyiha haqida batafsil aytib beradi.</p>
            </div>
            <div className="mt-10">
              <LeadForm source="loyiha" project={p.slug} inline dark={onColor === "#ffffff"}
                        buttonClass={onColor === "#ffffff" ? "bg-white text-[#14171a] hover:bg-night hover:text-white" : "btn-ink"} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BOSHQA LOYIHALAR ---------- */}
      {p.others.length > 0 && (
        <section className="container-x py-24">
          <SectionHead eyebrow="Yana" title="Boshqa loyihalarimiz" link={{ href: "/loyihalar", label: "Barchasi" }} />
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-3">
            {p.others.map((o, i) => <ProjectCard key={o.slug} project={o} index={i} />)}
          </div>
        </section>
      )}
    </>
  );
}

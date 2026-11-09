import Image from "next/image";
import Link from "next/link";
import { Counter } from "@/components/Counter";
import { GirihPattern, WaveLines } from "@/components/Decor";
import { Hero3D } from "@/components/Hero3D";
import { HomeMotion } from "@/components/HomeMotion";
import { LeadForm } from "@/components/LeadForm";
import { NewsList } from "@/components/NewsList";
import { Arrow, FeaturedPost, ProjectCard, SectionHead } from "@/components/ui";
import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { FlatCard } from "@/components/FlatCard";
import { FlatFilter } from "@/components/FlatFilter";
import { MortgageCalc } from "@/components/MortgageCalc";
import { getFlats, getPosts, getProjects, getSite } from "@/lib/api";

const MARQUEE = ["Sifat", "Muddat", "Ochiqlik", "Yashil hovli", "Xavfsizlik", "Qulaylik"];

export default async function Home() {
  const [site, projects, posts, flats] = await Promise.all([getSite(), getProjects(), getPosts(5), getFlats("per=8&kind=turar")]);
  // Faqat panelda kiritilgan (0 dan katta) raqamlar ko'rsatiladi
  const heroStats = [
    { v: site.years ?? 0, s: "+", l: "yillik tajriba" },
    { v: site.stats.projects, s: "", l: "topshirilgan loyiha" },
    { v: site.stats.families, s: "+", l: "baxtli oila" },
    { v: site.stats.area, s: "", l: "m² qurilgan maydon" },
  ].filter((x) => x.v > 0);
  // «Kompaniya haqida»: bazadagi haqiqiy raqamlar — yangi loyiha qo'shilgan sari o'zi o'sadi
  const aboutStats = [
    { v: site.years ?? 0, l: "yillik tajriba" },
    { v: projects.length, l: "ta loyiha" },
    { v: flats.total, l: "ta xonadon sotuvda" },
    { v: projects.reduce((sum, p) => sum + (p.area ?? 0), 0), l: "m² loyihalar umumiy maydoni" },
  ].filter((x) => x.v > 0);
  const showcase = projects.find((p) => p.cover) ?? null;
  const featured = projects.slice(0, 3);

  return (
    <>
      {/* ---------- HERO: kechki shahar, kran bino qurmoqda ---------- */}
      <section className="px-2 pt-[84px] sm:px-3">
        <div data-hero-panel className="relative origin-top overflow-hidden rounded-[30px] bg-premium text-white will-change-transform sm:rounded-[40px]">
          {/* Yumshoq nurlar */}
          <div className="glow pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-accent opacity-20 blur-[140px]" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-[420px] w-[620px] rounded-full bg-[#2f6b5c] opacity-30 blur-[140px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

          <div className="container-x relative grid min-h-[calc(100svh-96px)] items-center gap-4 py-16 lg:grid-cols-12">
            <div data-hero-copy className="relative z-10 lg:col-span-6">
              <p className="eyebrow !text-white/50" data-hero-fade data-hero-hide>Samarqand{site.stats.founded ? ` · ${site.stats.founded}-yildan` : ""}</p>
              <h1 data-hero-title data-hero-hide className="h-display mt-6 text-[clamp(48px,8vw,120px)]">
                Yashash<br />uchun qurilgan<br /><span className="text-accent">makon.</span>
              </h1>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-white/60" data-hero-fade data-hero-hide>
                Arxan — puxta o&apos;ylangan rejalar, obod hovlilar va sifatli qurilish. Uyingizni ishonch bilan tanlang.
              </p>
              <div className="mt-10 flex flex-wrap gap-3" data-hero-fade data-hero-hide>
                <Link href="/kvartiralar" data-magnetic className="btn btn-accent hover:!bg-white hover:!text-[#14171a]">Kvartira tanlash <Arrow /></Link>
                <Link href="/loyihalar" data-magnetic className="btn border border-white/25 hover:border-white hover:bg-white hover:text-[#14171a]">Loyihalar</Link>
              </div>
            </div>
            <div className="relative h-[44svh] min-h-[320px] lg:col-span-6 lg:h-[72svh]" data-hero-scene data-hero-hide>
              <Hero3D />
            </div>
          </div>

          {/* Raqamlar — hero pastida */}
          {heroStats.length > 0 && <div className="relative border-t border-white/10">
            <div className="container-x grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4">
              {heroStats.map((x) => (
                <div key={x.l} className="lg:border-l lg:border-white/10 lg:pl-8 lg:first:border-0 lg:first:pl-0" data-hero-fade data-hero-hide>
                  <p className="text-[clamp(30px,3.4vw,48px)] font-semibold tracking-tight tabular-nums">
                    <Counter value={x.v} /><span className="text-accent">{x.s}</span>
                  </p>
                  <p className="mt-1 text-sm text-white/50">{x.l}</p>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </section>

      {/* ---------- LOYIHALAR ---------- */}
      {featured.length > 0 && (
        <section className="container-x py-24">
          <SectionHead eyebrow="Loyihalar" title={<>Biz qurayotgan<br />uylar</>} link={{ href: "/loyihalar", label: "Barcha loyihalar" }} />
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {featured.map((p, i) => (
              <div key={p.slug} className={i === 0 ? "md:col-span-2" : ""}>
                <ProjectCard project={p} index={i} large={i === 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- KVARTIRA TANLASH ---------- */}
      {flats.total > 0 && (
        <section className="relative mb-24 overflow-hidden bg-sand py-24">
          <WaveLines className="inset-0 h-full w-full text-ink/[0.13] [mask-image:linear-gradient(to_bottom,black_30%,transparent)]" />
          <div className="container-x relative">
          <SectionHead eyebrow={`Sotuvda: ${flats.total} ta xonadon`} title={<>Ideal xonadonni<br />tanlang</>} link={{ href: "/kvartiralar", label: "Barcha xonadonlar" }} />
          <Suspense fallback={<HouseLoader className="h-56" />}>
            <FlatFilter facets={flats.facets} compact />
          </Suspense>
          <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&>*]:w-[82%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {flats.items.map((f, i) => <FlatCard key={f.id} flat={f} index={i} />)}
          </div>
        </div></section>
      )}

      {/* ---------- LENTA ---------- */}
      <section aria-hidden="true" className="-rotate-1 overflow-hidden bg-accent py-6 text-on-accent">
        <div className="marquee" data-marquee>
          {[...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} className="flex items-center gap-10 pr-10 text-[clamp(36px,5vw,72px)] font-semibold tracking-tight whitespace-nowrap">
              {w} <span className="h-3 w-3 rotate-45 bg-current opacity-60" />
            </span>
          ))}
        </div>
      </section>

      {/* ---------- MUDDATLI TO'LOV ---------- */}
      <section className="container-x py-24">
        <SectionHead eyebrow="Muddatli to'lov" title={<>Oylik to&apos;lovni<br />oldindan biling</>} />
        <div data-reveal="scale"><MortgageCalc /></div>
      </section>

      {/* ---------- KOMPANIYA HAQIDA ---------- */}
      <section className="container-x py-24">
        <div className="relative overflow-hidden rounded-[32px] bg-night text-white" data-reveal="scale">
          <GirihPattern id="girih-about" scale={1.2} className="inset-0 h-full w-full text-white/[0.07] [mask-image:linear-gradient(to_right,black,transparent_65%)]" />
          <div className="relative grid lg:grid-cols-2">
            <div className="px-6 py-14 md:px-14 md:py-16">
              <p className="eyebrow !text-white/50">Kompaniya haqida</p>
              <h2 className="h-display mt-4 text-[clamp(34px,4.4vw,58px)]">
                <span className="text-accent">Arxan</span> qurilish<br />kompaniyasi
              </h2>
              {site.about.text[0] && <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">{site.about.text[0]}</p>}

              {aboutStats.length > 0 && (
                <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
                  {aboutStats.map((s) => (
                    <div key={s.l}>
                      <dd className="text-[clamp(30px,3.2vw,46px)] font-semibold tracking-tight whitespace-nowrap tabular-nums"><Counter value={s.v} /></dd>
                      <dt className="mt-2 flex items-start gap-2 text-sm leading-snug text-white/60">
                        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent">
                          <path d="M8 0c.6 4.2 3.8 7.4 8 8-4.2.6-7.4 3.8-8 8-.6-4.2-3.8-7.4-8-8 4.2-.6 7.4-3.8 8-8z" />
                        </svg>
                        {s.l}
                      </dt>
                    </div>
                  ))}
                </dl>
              )}

              <Link href="/biz-haqimizda" className="group mt-12 inline-flex items-center gap-4 font-semibold">
                Batafsil
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/25 transition-colors group-hover:border-accent group-hover:bg-accent"><Arrow /></span>
              </Link>
            </div>

            {/* O'ngda — loyihaning o'zi: rasm va yorliq, bosilsa loyiha sahifasi */}
            {showcase?.cover && (
              <Link href={`/loyihalar/${showcase.slug}`} className="group relative block min-h-[300px] overflow-hidden sm:min-h-[400px]">
                <Image src={showcase.cover} alt={showcase.title} fill sizes="(min-width: 1024px) 50vw, 100vw"
                       className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-night lg:via-transparent" />
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#14171a] backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: showcase.color }} />
                  {showcase.title} · {showcase.statusLabel}
                  <Arrow />
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>


      {/* ---------- MEDIA ---------- */}
      {posts.length > 0 && (
        <section className="container-x py-24">
          <SectionHead eyebrow="Media" title={<>Qurilishdan<br />so&apos;nggi xabarlar</>} link={{ href: "/media", label: "Barcha materiallar" }} />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <FeaturedPost post={posts[0]} />
            {posts.length > 1 && <NewsList posts={posts.slice(1)} />}
          </div>
        </section>
      )}

      {/* ---------- QO'NG'IROQ ---------- */}
      <section className="container-x pb-28">
        <div className="relative overflow-hidden rounded-[32px] bg-premium px-6 py-16 text-white md:px-16 md:py-20" data-reveal="scale">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-accent opacity-25 blur-[120px]" />
          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow !text-white/50">Maslahat bepul</p>
              <h2 className="h-display mt-4 text-[clamp(34px,4.6vw,60px)]">Uy tanlashda<br />yordam beramiz</h2>
              <p className="mt-6 max-w-md text-white/60">Raqamingizni qoldiring — mutaxassisimiz loyihalar, rejalar va to&apos;lov shartlari haqida aytib beradi.</p>
            </div>
            <LeadForm source="bosh_sahifa" dark />
          </div>
        </div>
      </section>
      <HomeMotion />
    </>
  );
}

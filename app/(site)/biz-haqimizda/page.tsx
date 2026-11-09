import type { Metadata } from "next";
import Link from "next/link";
import { ActivityCarousel } from "@/components/about/ActivityCarousel";
import { HistorySlider } from "@/components/about/HistorySlider";
import { FacadeSketch } from "@/components/Decor";
import { Arrow, PageHero, Stat } from "@/components/ui";
import { getSite } from "@/lib/api";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description: "Arxan kompaniyasi: tarix, qadriyatlar va raqamlar.",
};

const PRINCIPLES = [
  {
    t: "Avval odam, keyin bino",
    d: "Loyihalashni bo'sh hududdan emas, balki sizning oilaviy hayot tarzingizdan boshlaymiz. Xonadonlardagi tabiiy yorug'lik taqsimoti, qulay saqlash tizimlari va bolalar xavfsizligi eng mayda detallarigacha hisob-kitob qilinadi. Bino inson uchun xizmat qilishi kerak.",
  },
  {
    t: "Hovli — uyning davomi",
    d: "Sizning qulayligingiz xonadon ostonasida tugab qolmaydi. Har bir loyihamizda zamonaviy bolalar maydonchalari, boy ko'kalamzorlashtirilgan hududlar va sokin dam olish joylari majburiy hamda ajralmas qism hisoblanadi.",
  },
  {
    t: "Uzoq muddatli sifat",
    d: "Biz faqat bugungi kunni emas, kelajakni o'ylaymiz. Bino fasadi, murakkab muhandislik tizimlari va barcha qurilish materiallari o'nlab yillar davomida ishonchli foydalanishni kafolatlash maqsadida qat'iy seleksiyadan o'tkaziladi.",
  },
  {
    t: "Ochiq va shaffof jarayon",
    d: "Mijozlarimiz o'z sarmoyalari qanday o'zlashtirilayotganini ko'rib turishga haqli. Shu sababli, biz qurilishning har bir bosqichini ochiq ko'rsatamiz — foto-hisobotlar va jarayon yangiliklarini muntazam ravishda e'lon qilib boramiz.",
  },
];

export default async function AboutPage() {
  const site = await getSite();
  // Faqat panelda kiritilgan (0 dan katta) raqamlar ko'rsatiladi
  const stats = [
    { value: site.years ?? 0, suffix: "+", label: "yillik tajriba" },
    { value: site.stats.projects, suffix: "", label: "topshirilgan loyiha" },
    { value: site.stats.families, suffix: "+", label: "baxtli oila" },
    { value: site.stats.area, suffix: "", label: "m² qurilgan maydon" },
  ].filter((s) => s.value > 0);

  return (
    <>
      <PageHero title="Biz haqimizda" />

      {site.about.text.length > 0 && (
        <section className="container-x pb-24">
          <div className="grid gap-10 lg:grid-cols-12">
            {site.about.title && (
              <h2 className="h-display text-[clamp(30px,3.4vw,46px)] lg:col-span-5" data-reveal>{site.about.title}</h2>
            )}
            <div className="lg:col-span-7 lg:col-start-6">
              {site.about.text.map((p, i) => (
                <p key={i} data-reveal style={{ "--d": i } as React.CSSProperties}
                   className={i === 0 ? "text-2xl leading-snug font-medium tracking-tight md:text-3xl" : "mt-6 text-lg leading-relaxed text-muted"}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section className="container-x pb-28">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} index={i} />)}
          </div>
        </section>
      )}

      {/* ---------- QADRIYATLAR: hovli, qulaylik — zumrad bo'lim ---------- */}
      <section className="relative overflow-hidden bg-emerald py-28 text-white">
        <FacadeSketch className="absolute -top-4 -right-12 hidden w-[min(700px,55%)] text-white/[0.11] [mask-image:linear-gradient(to_left,black_50%,transparent)] md:block" />
        <div className="container-x relative">
          <p className="eyebrow !text-white/40" data-reveal>Qadriyatlarimiz</p>
          <h2 className="h-display mt-4 max-w-3xl text-[clamp(34px,5vw,64px)]" data-reveal>Bizning fundamental qadriyatlarimiz</h2>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] bg-white/10 md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div key={p.t} className="group bg-emerald p-8 transition-colors duration-500 hover:bg-emerald-soft md:p-12" data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="text-sm font-semibold text-accent tabular-nums">0{i + 1}</span>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight md:text-3xl">{p.t}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-white/60">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TARIX (panel → «Kompaniya tarixi») ---------- */}
      {site.milestones.length > 0 && (
        <section className="container-x pt-28 pb-14">
          <HistorySlider items={site.milestones} />
        </section>
      )}

      {/* ---------- FAOLIYAT: mukofotlar, yutuqlar (panel → «Kompaniya faoliyati») ---------- */}
      {site.activities.length > 0 && (
        <section className="container-x pt-14 pb-28">
          <ActivityCarousel items={site.activities} />
        </section>
      )}

      <section className="container-x pb-28">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] bg-sand p-10 md:flex-row md:items-center md:p-14" data-reveal="scale">
          <h2 className="h-display max-w-xl text-[clamp(28px,3.6vw,48px)]">Loyihalarimiz bilan tanishing</h2>
          <Link href="/loyihalar" className="btn btn-ink">Loyihalar <Arrow /></Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { AppealForm } from "@/components/AppealForm";
import { GirihPattern } from "@/components/Decor";
import { PageHero } from "@/components/ui";
import { getSite } from "@/lib/api";
import { telHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Murojaat",
  description: "Arxan rahbariyatiga taklif, shikoyat yoki savol yuboring.",
};

const STEPS = [
  { t: "Yuborasiz", d: "Formani to'ldirasiz — murojaat darhol ro'yxatga olinadi." },
  { t: "Ko'rib chiqamiz", d: "Mas'ul bo'lim 1 ish kuni ichida o'rganadi." },
  { t: "Javob beramiz", d: "Natija haqida telefon yoki email orqali xabar beramiz." },
];

export default async function AppealPage() {
  const site = await getSite();

  return (
    <>
      <PageHero title="Murojaat" />

      <section className="relative overflow-hidden pb-32">
        <GirihPattern id="girih-appeal" className="inset-0 h-full w-full text-ink/[0.11] [mask-image:radial-gradient(ellipse_55%_75%_at_75%_35%,black,transparent)]" />
        <div className="container-x relative grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <ol className="space-y-8">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-5" data-reveal style={{ "--d": i } as React.CSSProperties}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-sm font-semibold tabular-nums">{i + 1}</span>
                  <div>
                    <h2 className="text-lg font-semibold">{s.t}</h2>
                    <p className="mt-1 text-muted">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            {site.phone && (
              <div className="mt-12 border-t border-line pt-8" data-reveal>
                <p className="eyebrow">Shoshilinch bo&apos;lsa</p>
                <a href={telHref(site.phone)} className="mt-3 block text-2xl font-semibold tabular-nums hover:text-accent">{site.phone}</a>
              </div>
            )}
          </aside>
          <div className="lg:col-span-8" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <div className="rounded-[28px] border border-line bg-card p-6 md:p-10">
              <AppealForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

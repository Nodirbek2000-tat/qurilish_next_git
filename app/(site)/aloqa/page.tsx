import type { Metadata } from "next";
import { WaveLines } from "@/components/Decor";
import { LeadForm } from "@/components/LeadForm";
import { PageHero, YandexMap } from "@/components/ui";
import { getSite } from "@/lib/api";
import { officeRouteUrl, telHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Aloqa",
  description: "Arxan bilan bog'lanish: telefon, manzil, ish vaqti va xarita.",
};

const SOCIAL_LABELS = { telegram: "Telegram", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" } as const;

export default async function ContactPage() {
  const site = await getSite();
  const socials = Object.entries(site.socials) as [keyof typeof SOCIAL_LABELS, string][];
  // Nuqtasi kiritilgan ofislar, bo'lmasa bosh ofis nuqtasi; nuqta yo'q bo'lsa — birinchi ofis manzili bo'yicha qidiruv
  const pinned = site.offices.filter((o) => o.lat !== null && o.lng !== null).map((o) => ({ lat: o.lat!, lng: o.lng! }));
  const mapPoints = pinned.length ? pinned : site.lat !== null && site.lng !== null ? [{ lat: site.lat, lng: site.lng }] : [];
  const mapQuery = mapPoints.length ? undefined : site.offices[0]?.address;
  // Telefon/email kiritilmagan bo'lsa bo'sh katak qolmasin — ustunlar soni kataklar soniga teng
  const cells = 2 + (site.phone ? 1 : 0) + (site.email ? 1 : 0);
  const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }[cells];

  return (
    <>
      <PageHero title="Aloqa" />

      <section className="container-x pb-20">
        <div className={`grid gap-px overflow-hidden rounded-[24px] border border-line bg-line ${cols}`}>
          {site.phone && (
            <a href={telHref(site.phone)} className="group bg-paper p-8 transition-colors hover:bg-card" data-reveal>
              <p className="eyebrow">Telefon</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums group-hover:text-accent">{site.phone}</p>
            </a>
          )}
          {site.email && (
            <a href={`mailto:${site.email}`} className="group bg-paper p-8 transition-colors hover:bg-card" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
              <p className="eyebrow">Email</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight break-all group-hover:text-accent">{site.email}</p>
            </a>
          )}
          <div className="bg-paper p-8" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            <p className="eyebrow">Manzil</p>
            <p className="mt-4 text-xl leading-snug font-semibold tracking-tight">{site.address}</p>
          </div>
          <div className="bg-paper p-8" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
            <p className="eyebrow">Ish vaqti</p>
            <ul className="mt-4 space-y-1 text-lg font-medium">
              {site.workHours.map((l) => <li key={l}>{l}</li>)}
            </ul>
          </div>
        </div>

        {socials.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-3" data-reveal>
            {socials.map(([key, url]) => (
              <li key={key}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-11 text-sm">{SOCIAL_LABELS[key]}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {site.offices.length > 0 && (
        <section className="container-x pb-12">
          <h2 className="h-display text-[clamp(30px,4vw,52px)]" data-reveal>Sotuv ofislari</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {site.offices.map((o, i) => (
              <div key={o.name} className="rounded-[22px] border border-line bg-card p-7" data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="text-sm font-semibold text-accent tabular-nums">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{o.name}</h3>
                <p className="mt-2 text-muted">{o.address}</p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {o.phone && <a href={telHref(o.phone)} className="font-semibold tabular-nums hover:text-accent">{o.phone}</a>}
                  {o.hours && <span className="text-muted">{o.hours}</span>}
                  <a href={officeRouteUrl(o)} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">
                    Qanday yetib borish →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(mapPoints.length > 0 || mapQuery) && (
        <section className="container-x pb-20" data-reveal="scale">
          <YandexMap
            points={mapPoints}
            query={mapQuery}
            zoom={mapPoints.length > 1 ? 12 : 15}
            pin={pinned.length === 1 ? { photo: site.offices.find((o) => o.lat !== null)?.photo ?? null, label: site.offices.find((o) => o.lat !== null)!.name } : null}
            title="Arxan ofislari xaritada"
            className="aspect-[4/3] sm:aspect-[16/8]"
          />
        </section>
      )}

      <section className="container-x pb-28">
        <div className="relative grid gap-12 overflow-hidden rounded-[32px] bg-sand p-8 md:p-14 lg:grid-cols-2 lg:items-center" data-reveal="scale">
          <WaveLines className="inset-0 h-full w-full text-accent/30" />
          <div className="relative">
            <h2 className="h-display text-[clamp(32px,4vw,52px)]">Qayta qo&apos;ng&apos;iroq qilamiz</h2>
            <p className="mt-4 max-w-md text-muted">Raqamingizni qoldiring — ish vaqtida 15 daqiqa ichida bog&apos;lanamiz.</p>
          </div>
          <div className="relative"><LeadForm source="aloqa" /></div>
        </div>
      </section>
    </>
  );
}

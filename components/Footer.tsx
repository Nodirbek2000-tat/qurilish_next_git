import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import Link from "next/link";
import type { Site } from "@/lib/api";
import { officeRouteUrl, telHref } from "@/lib/format";
import { ArchBand } from "./Decor";
import { LogoStacked } from "./Logo";
import { NAV } from "./nav";
import { YandexMap } from "./ui";

type SocialKey = "telegram" | "instagram" | "facebook" | "youtube";
const SOCIAL_LABELS: Record<SocialKey, string> = { telegram: "Telegram", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };

/** Ijtimoiy tarmoq belgilari — oddiy chiziqli SVG (lucide yangi versiyasida brend belgilari yo'q) */
function SocialIcon({ name }: { name: SocialKey }) {
  const p = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "telegram":
      return <svg {...p}><path d="M21.2 3.6 2.9 10.7c-.8.3-.7 1.3.1 1.5l4.5 1.3 1.7 5.3c.2.7 1.1.9 1.6.3l2.5-2.6 4.6 3.4c.6.4 1.5.1 1.6-.6l2.9-14.8c.2-.8-.6-1.4-1.3-1.1Z" /><path d="m7.6 13.5 10.2-7.2-8 8.6" /></svg>;
    case "instagram":
      return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>;
    case "facebook":
      return <svg {...p}><path d="M14.5 21v-7.5h2.7l.4-3.2h-3.1V8.4c0-.9.3-1.6 1.6-1.6h1.6V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8.6v3.2h2.7V21" /></svg>;
    case "youtube":
      return <svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.3 5 2.7-5 2.7Z" fill="currentColor" /></svg>;
  }
}

export function Footer({ site }: { site: Site }) {
  const socials = (Object.entries(site.socials) as [SocialKey, string][]).filter(([, url]) => url);
  const offices = site.offices.filter((o) => o.lat !== null && o.lng !== null);
  const pinned = offices.map((o) => ({ lat: o.lat!, lng: o.lng! }));

  return (
    <footer className="relative overflow-hidden bg-night text-white/90">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent opacity-15 blur-[120px]" />
      {/* Marmar: kulrang tomirlar soft-light bilan ko'k fonga singadi — rang fondan, naqsh toshdan */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url(/textures/marmar.webp)] bg-cover bg-center opacity-45 mix-blend-soft-light" />
      <ArchBand id="arch-footer" className="inset-x-0 bottom-0 h-[100px] w-full text-white/[0.08] [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]" />
      <div className="container-x relative pt-14 pb-10">
        {/* Tepada: shior, sahifalar, aloqa va o'ngda sotuv bo'limi; pastda — keng xarita */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1.2fr] lg:gap-8">
          <div>
            <LogoStacked height={96} className="text-[#F4F0E8]" />
            <p className="mt-6 max-w-sm text-[22px] leading-snug font-medium text-white">Yashash uchun qurilgan makon.</p>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-3" aria-label="Ijtimoiy tarmoqlar">
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[key]} title={SOCIAL_LABELS[key]}
                       className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-accent hover:bg-accent">
                      <SocialIcon name={key} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Pastki menyu">
            <p className="eyebrow !text-white/40">Sahifalar</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-accent">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow !text-white/40">Aloqa</p>
            <ul className="mt-5 space-y-3">
              {(site.phones?.length ? site.phones : site.phone ? [site.phone] : []).map((tel) => (
                <li key={tel}>
                  <a href={telHref(tel)} className="inline-flex items-center gap-2.5 text-xl font-semibold whitespace-nowrap text-white tabular-nums transition-colors hover:text-accent">
                    <Phone size={18} className="text-accent" /> {tel}
                  </a>
                </li>
              ))}
              {site.address && (
                <li className="flex items-start gap-2.5 text-white/80"><MapPin size={16} className="mt-1 shrink-0 text-accent" /> {site.address}</li>
              )}
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2.5 transition-colors hover:text-accent">
                    <Mail size={16} className="text-white/40" /> {site.email}
                  </a>
                </li>
              )}
              {site.workHours.map((l) => (
                <li key={l} className="flex items-center gap-2.5 text-white/60"><Clock size={16} className="text-white/40" /> {l}</li>
              ))}
            </ul>
          </div>

          {/* ---------- SOTUV BO'LIMI ---------- */}
          {site.offices.length > 0 && (
            <section aria-label="Sotuv bo'limi">
              <p className="eyebrow !text-accent">Sotuv bo&apos;limi</p>
              <ul className="mt-5 space-y-5">
                {site.offices.map((o) => (
                  <li key={o.name}>
                    <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">{o.name}</p>
                    <p className="mt-1.5 flex gap-2 leading-snug text-white">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-accent" /> {o.address}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60">
                      {o.phone && (
                        <a href={telHref(o.phone)} className="inline-flex items-center gap-1.5 tabular-nums hover:text-white"><Phone size={14} /> {o.phone}</a>
                      )}
                      {o.hours && <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {o.hours}</span>}
                      <a href={officeRouteUrl(o)} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
                        <Navigation size={14} /> Qanday yetib borish
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Xarita: aniq nuqta kiritilgan bo'lsa — nuqtalar, bo'lmasa — birinchi ofis manzili bo'yicha qidiruv */}
        {site.offices.length > 0 && (
          <YandexMap points={pinned} query={pinned.length ? undefined : site.offices[0].address}
                     zoom={pinned.length > 1 ? 12 : 16} pin={offices[0] && { photo: offices[0].photo ?? null, label: offices[0].name }} title="Sotuv ofislari xaritada" className="mt-12 h-48 !rounded-[18px] md:h-56" />
        )}

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-8 text-sm text-white/40 sm:flex-row">
          <p>© Arxan{site.stats.founded ? `, ${site.stats.founded}-yildan` : ""}. Barcha huquqlar himoyalangan.</p>
          <p>Samarqand, O&apos;zbekiston</p>
        </div>
      </div>
    </footer>
  );
}

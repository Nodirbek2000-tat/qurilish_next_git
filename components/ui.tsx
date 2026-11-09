import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PostBrief, Project } from "@/lib/api";
import { formatDate, yandexMapSrc, yandexSearchMapSrc } from "@/lib/format";
import { BuildingArt } from "./BuildingArt";
import { Counter } from "./Counter";
import { photoPinHtml } from "@/lib/pin";
import { YMap, type Pin } from "./project/YMap";

export const Arrow = ({ className = "" }: { className?: string }) => (
  <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" className={`arrow ${className}`} />
);

export function Cover({
  src, seed, color, alt, sizes, preload = false,
}: { src: string | null; seed: string; color: string; alt: string; sizes: string; preload?: boolean }) {
  return src ? (
    <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" />
  ) : (
    <BuildingArt seed={seed} color={color} className="absolute inset-0 h-full w-full" />
  );
}

/** Bo'lim sarlavhasi: kichik yorliq + katta sarlavha + ixtiyoriy havola */
export function SectionHead({
  eyebrow, title, link,
}: { eyebrow: string; title: React.ReactNode; link?: { href: string; label: string } }) {
  return (
    <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
      <div>
        <p className="eyebrow" data-reveal>{eyebrow}</p>
        <h2 className="h-display mt-4 max-w-3xl text-[clamp(34px,5vw,64px)]" data-reveal data-split style={{ "--d": 1 } as React.CSSProperties}>
          {title}
        </h2>
      </div>
      {link && (
        <Link href={link.href} className="link-arrow shrink-0 hover:text-accent" data-reveal>
          {link.label} <Arrow />
        </Link>
      )}
    </div>
  );
}

/** Ichki sahifalar boshi — ixcham, kontent darhol ko'rinsin */
export function PageHero({ title }: { title: string }) {
  return (
    <section className="container-x pt-28 pb-8 md:pt-32 md:pb-10">
      <h1 className="h-display text-[clamp(32px,4.4vw,56px)]">
        <span className="line-mask"><span>{title}</span></span>
      </h1>
    </section>
  );
}

export function StatusChip({ project, light = false }: { project: Project; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        light ? "bg-white/90 text-[#14171a] backdrop-blur" : "bg-ink/5"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.status === "topshirilgan" ? "#7a8a5a" : project.color }} />
      {project.statusLabel}
    </span>
  );
}

export function ProjectCard({ project, index = 0, large = false }: { project: Project; index?: number; large?: boolean }) {
  return (
    <article data-reveal style={{ "--d": index % 3 } as React.CSSProperties} className="group">
      <Link href={`/loyihalar/${project.slug}`} className="block" aria-label={project.title}>
        <div data-tilt="4" data-reveal="curtain" data-parallax className={`zoom-img relative overflow-hidden rounded-[22px] bg-sand ${large ? "aspect-[4/3] md:aspect-[16/10]" : "aspect-[4/3]"}`}>
          <Cover src={project.cover} seed={project.slug} color={project.color} alt={project.title}
                 sizes={large ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"} />
          <div className="absolute top-4 left-4"><StatusChip project={project} light /></div>
          <span className="absolute right-4 bottom-4 grid h-12 w-12 translate-y-3 place-items-center rounded-full bg-white text-[#14171a] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <Arrow />
          </span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent">{project.title}</h3>
            <p className="mt-1 text-muted">{project.address}</p>
          </div>
          <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-semibold">{project.klass}</span>
        </div>
      </Link>
    </article>
  );
}

export function PostCard({ post, index = 0 }: { post: PostBrief; index?: number }) {
  return (
    <article data-reveal style={{ "--d": index % 3 } as React.CSSProperties} className="group">
      <Link href={`/media/${post.slug}`} className="block">
        <div className="zoom-img relative aspect-[16/11] overflow-hidden rounded-[20px] bg-sand">
          <Cover src={post.cover} seed={post.slug} color="#2b2e33" alt={post.title} sizes="(min-width: 768px) 33vw, 100vw" />
          {post.kind === "video" && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-[#14171a] backdrop-blur">
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M5 3l10 6-10 6z" fill="currentColor" /></svg>
              </span>
            </span>
          )}
        </div>
        <div className="mt-5 flex items-center gap-3 text-sm text-muted">
          <span className="font-semibold text-accent">{post.kindLabel}</span>
          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h3 className="mt-2 text-xl leading-snug font-semibold tracking-tight transition-colors group-hover:text-accent">{post.title}</h3>
      </Link>
    </article>
  );
}

/** Asosiy (katta) yangilik kartasi */
export function FeaturedPost({ post }: { post: PostBrief }) {
  return (
    <article className="group" data-reveal="scale">
      <Link href={`/media/${post.slug}`} className="relative block overflow-hidden rounded-[26px] bg-night text-white">
        <div data-parallax className="zoom-img relative aspect-[4/5] sm:aspect-[16/12]">
          <Cover src={post.cover} seed={post.slug} color="#14231f" alt={post.title} sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-on-accent">{post.kindLabel}</span>
          <h3 className="mt-4 max-w-xl text-2xl leading-tight font-semibold tracking-tight md:text-4xl">{post.title}</h3>
          <p className="mt-3 flex items-center gap-3 text-sm text-white/60">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="inline-flex items-center gap-1.5 font-semibold text-white transition-transform duration-500 group-hover:translate-x-1">
              O&apos;qish <Arrow />
            </span>
          </p>
        </div>
      </Link>
    </article>
  );
}

export function Stat({ value, suffix = "", label, index = 0 }: { value: number; suffix?: string; label: string; index?: number }) {
  return (
    <div data-reveal style={{ "--d": index } as React.CSSProperties} className="border-t border-line pt-6">
      <p className="h-display text-[clamp(44px,5.5vw,76px)] tabular-nums">
        <Counter value={value} />
        {suffix && <span className="text-accent">{suffix}</span>}
      </p>
      <p className="mt-3 text-muted">{label}</p>
    </div>
  );
}

export function YandexMap({
  points, query, zoom = 15, title, className = "", pin,
}: {
  points: { lat: number; lng: number }[]; query?: string; zoom?: number; title: string; className?: string;
  /** Bitta nuqta bo'lsa — ustida uy rasmli katta belgi */
  pin?: { photo: string | null; label: string } | null;
}) {
  // Nuqtalar bo'lmasa — manzil matni bo'yicha qidiruv xaritasi
  const src = points.length ? yandexMapSrc(points, zoom) : query ? yandexSearchMapSrc(query, zoom) : "";
  if (!src) return null;
  // Nuqtalar bor — JS xarita: belgilar xarita bilan birga suriladi va kattalashadi
  if (points.length) {
    const one = points.length === 1 && pin?.photo ? pin : null;
    const pins: Pin[] = points.map((p, i) => one
      ? { id: `p${i}`, lat: p.lat, lng: p.lng, hint: one.label, size: 108, anchor: "bottom", html: photoPinHtml(one.photo!, one.label) }
      : { id: `p${i}`, lat: p.lat, lng: p.lng, hint: title, size: 26, html: `<i class="ym-dot" style="--c:var(--accent)"></i>` });
    const c = points.reduce((a, p) => [a[0] + p.lat / points.length, a[1] + p.lng / points.length], [0, 0]) as [number, number];
    return <YMap center={c} zoom={zoom} pins={pins} fallbackSrc={src} fallbackPin={one} title={title} className={className} />;
  }
  return (
    <div className={`map-frame relative overflow-hidden rounded-[24px] bg-sand ${className}`}>
      <iframe src={src} title={title} loading="lazy" className="absolute inset-0 h-full w-full border-0" allowFullScreen />
    </div>
  );
}

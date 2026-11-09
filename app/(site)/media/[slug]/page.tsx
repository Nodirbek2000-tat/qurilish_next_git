import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/HouseLoader";
import { Gallery } from "@/components/Gallery";
import { Arrow, PostCard, SectionHead } from "@/components/ui";
import { getPost } from "@/lib/api";
import { formatDate, youtubeEmbed } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/media/[slug]">): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return { title: "Material topilmadi" };
  return {
    title: p.title,
    description: p.excerpt || p.body[0]?.slice(0, 160),
    openGraph: { type: "article", images: p.cover ? [p.cover] : undefined },
  };
}

export default function PostPage({ params }: PageProps<"/media/[slug]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      {params.then(({ slug }) => <PostDetail slug={slug} />)}
    </Suspense>
  );
}

async function PostDetail({ slug }: { slug: string }) {
  const p = await getPost(slug);
  if (!p) notFound();
  const video = p.videoUrl ? youtubeEmbed(p.videoUrl) : null;

  return (
    <>
      <article className="container-x pt-36 md:pt-44">
        <div className="mx-auto max-w-3xl">
          <Link href="/media" className="link-arrow text-sm text-muted hover:text-accent">
            <Arrow className="rotate-180" /> Media
          </Link>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted" data-reveal>
            <span className="font-semibold text-accent">{p.kindLabel}</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
            <time dateTime={p.date}>{formatDate(p.date)}</time>
          </div>
          <h1 className="h-display mt-5 text-[clamp(36px,5.5vw,72px)] !leading-[1.04]">
            <span className="line-mask"><span>{p.title}</span></span>
          </h1>
          {p.excerpt && <p className="mt-6 text-xl leading-relaxed text-muted" data-reveal>{p.excerpt}</p>}
        </div>

        {video ? (
          <div className="mx-auto mt-14 aspect-video max-w-5xl overflow-hidden rounded-[24px] bg-night" data-reveal="scale">
            <iframe src={video} title={p.title} className="h-full w-full" loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        ) : p.cover ? (
          <div className="relative mx-auto mt-14 aspect-[16/9] max-w-5xl overflow-hidden rounded-[24px] bg-sand" data-reveal="scale">
            <Image src={p.cover} alt={p.title} fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" preload />
          </div>
        ) : null}

        <div className="mx-auto mt-14 max-w-3xl space-y-6 text-lg leading-[1.75]">
          {p.body.map((para, i) => <p key={i} data-reveal>{para}</p>)}
        </div>

        {p.gallery.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <Gallery items={p.gallery.map((src) => ({ src }))} title={p.title} />
          </div>
        )}

        {p.project && (
          <div className="mx-auto mt-16 max-w-3xl">
            <Link href={`/loyihalar/${p.project.slug}`} className="group flex items-center justify-between rounded-[20px] border border-line p-6 transition-colors hover:border-ink">
              <span>
                <span className="eyebrow">Loyiha</span>
                <span className="mt-1 block text-2xl font-semibold tracking-tight group-hover:text-accent">{p.project.title}</span>
              </span>
              <span className="link-arrow"><Arrow /></span>
            </Link>
          </div>
        )}
      </article>

      {p.related.length > 0 && (
        <section className="container-x py-28">
          <SectionHead eyebrow="Yana o'qing" title="Boshqa materiallar" link={{ href: "/media", label: "Barchasi" }} />
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
            {p.related.map((r, i) => <PostCard key={r.slug} post={r} index={i} />)}
          </div>
        </section>
      )}
    </>
  );
}

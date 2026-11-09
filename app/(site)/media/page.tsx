import type { Metadata } from "next";
import { FilterTabs } from "@/components/FilterTabs";
import { FeaturedPost, PageHero, PostCard } from "@/components/ui";
import { NewsList } from "@/components/NewsList";
import { getPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Media",
  description: "Arxan yangiliklari, qurilishdan fotoreportajlar va videolar.",
};

const KINDS = [
  { key: "yangilik", label: "Yangiliklar" },
  { key: "qurilish", label: "Qurilish jarayoni" },
  { key: "hamkorlik", label: "Hamkorlik" },
  { key: "foto", label: "Fotoreportaj" },
  { key: "video", label: "Video" },
];

export default async function MediaPage() {
  const posts = await getPosts();
  const tabs = [
    { key: "all", label: "Barchasi", count: posts.length },
    ...KINDS.map((k) => ({ ...k, count: posts.filter((p) => p.kind === k.key).length })),
  ];

  return (
    <>
      <PageHero title="Yangiliklar" />
      <section className="container-x pb-32">
        {posts.length === 0 ? (
          <p className="text-muted">Materiallar tez orada qo&apos;shiladi.</p>
        ) : (
          <>
          <div className="mb-20 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <FeaturedPost post={posts[0]} />
            {posts.length > 1 && <NewsList posts={posts.slice(1, 5)} />}
          </div>
          <h2 className="h-display mb-8 text-[clamp(28px,3.5vw,44px)]" data-reveal>Barcha materiallar</h2>
          <FilterTabs tabs={tabs} className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((p, i) => (
              <div key={p.slug} data-key={p.kind}>
                <PostCard post={p} index={i} />
              </div>
            ))}
          </FilterTabs>
          </>
        )}
      </section>
    </>
  );
}

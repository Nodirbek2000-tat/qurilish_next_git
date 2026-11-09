import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { FlatCard } from "@/components/FlatCard";
import { FlatFilter } from "@/components/FlatFilter";
import { PageHero } from "@/components/ui";
import { getFlats } from "@/lib/api";
import { flatQuery } from "@/lib/flats";

export const metadata: Metadata = {
  title: "Kvartirangizni tanlang",
  description: "Arxan loyihalaridagi sotuvdagi xonadonlar: xonalar, maydon, qavat va topshirish yili bo'yicha filtr.",
};

export default function FlatsPage({ searchParams }: PageProps<"/kvartiralar">) {
  return (
    <>
      <PageHero title="Kvartirangizni tanlang" />
      <section className="container-x pb-32">
        <Suspense fallback={<HouseLoader className="h-56" />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/kvartiralar">["searchParams"] }) {
  const sp = await searchParams;
  const query = flatQuery(sp, { per: "12" });
  const data = await getFlats(query.toString());

  const pageHref = (n: number) => {
    const q = flatQuery(sp);
    q.set("page", String(n));
    return `/kvartiralar?${q.toString()}`;
  };
  const pages = Array.from({ length: data.pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === data.pages || Math.abs(n - data.page) <= 1,
  );

  return (
    <>
      <FlatFilter facets={data.facets} />

      <p className="mt-10 mb-8 text-muted">
        Topildi: <b className="text-ink tabular-nums">{data.total}</b> ta xonadon
      </p>

      {data.items.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-line p-14 text-center">
          <p className="text-xl font-semibold">Bu shartlar bo&apos;yicha xonadon topilmadi</p>
          <p className="mt-2 text-muted">Filtrni kengaytirib ko&apos;ring yoki biz bilan bog&apos;laning — mos variantni topib beramiz.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((f, i) => <FlatCard key={f.id} flat={f} index={i} />)}
        </div>
      )}

      {data.pages > 1 && (
        <nav aria-label="Sahifalar" className="mt-14 flex flex-wrap items-center justify-center gap-2">
          {pages.map((n, i) => (
            <span key={n} className="flex items-center gap-2">
              {i > 0 && n - pages[i - 1] > 1 && <span className="text-muted">…</span>}
              <Link
                href={pageHref(n)}
                scroll={false}
                aria-current={n === data.page ? "page" : undefined}
                className={`grid h-11 min-w-11 place-items-center rounded-full border px-3 text-sm font-semibold tabular-nums transition-colors ${
                  n === data.page ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                }`}
              >
                {n}
              </Link>
            </span>
          ))}
        </nav>
      )}
    </>
  );
}

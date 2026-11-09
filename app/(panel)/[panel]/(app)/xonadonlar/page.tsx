import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { FlatsManager, type FlatsData } from "@/components/panel/FlatsManager";
import { panelGet, panelPath, type Rec, type Schema } from "@/lib/panel";

type Search = { loyiha?: string; tur?: string; xonadon?: string };
const num = (v?: string) => (v && /^\d+$/.test(v) ? v : "");

async function Manager({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const [schema, data] = await Promise.all([
    panelGet<Schema>("/schema/"),
    panelGet<FlatsData>(`/flats/${num(sp.loyiha) ? `?project=${sp.loyiha}` : ""}`),
  ]);
  // Ochiq oyna: xonadon turi (rasmlar) yoki bitta xonadon — URL'da, shunda saqlagandan keyin yangilanadi
  const layoutId = num(sp.tur);
  const [layout, images] = layoutId
    ? await Promise.all([panelGet<Rec>(`/layout/${layoutId}/`), panelGet<{ items: Rec[] }>(`/layoutimage/?layout=${layoutId}`)])
    : [null, null];
  const flatId = sp.xonadon === "yangi" ? "yangi" : num(sp.xonadon);
  const flat = flatId && flatId !== "yangi" ? await panelGet<Rec>(`/flat/${flatId}/`) : null;

  return (
    <FlatsManager data={data} schema={schema} base={panelPath("/xonadonlar")}
                  layout={layout} layoutImages={images?.items ?? []} flat={flat} newFlat={flatId === "yangi"} />
  );
}

export default function FlatsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-[clamp(32px,4vw,48px)]">Xonadonlar</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Rasmlar har bir <b className="text-ink">xonadon turiga</b> bir marta yuklanadi — shu o&apos;lchamdagi barcha xonadonlar sahifasida chiqadi.
        </p>
      </div>
      <Suspense fallback={<HouseLoader className="h-80" />}><Manager searchParams={searchParams} /></Suspense>
    </div>
  );
}

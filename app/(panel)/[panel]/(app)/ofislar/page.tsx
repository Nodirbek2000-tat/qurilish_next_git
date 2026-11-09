import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { ChildManager } from "@/components/panel/ChildManager";
import { panelGet, type Rec, type Schema } from "@/lib/panel";

async function Offices() {
  const [schema, { items }] = await Promise.all([panelGet<Schema>("/schema/"), panelGet<{ items: Rec[] }>("/office/")]);
  return <ChildManager kind="office" schema={schema.office} items={items} />;
}

export default function OfficesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-[clamp(32px,4vw,48px)]">Sotuv ofislari</h1>
        <p className="mt-2 text-muted">Loyiha sahifasidagi «Savdo ofisi» bo&apos;limi va footer shu yerdan olinadi. Koordinatani Yandex xaritada nuqtani bosib nusxalang.</p>
      </div>
      <Suspense fallback={<HouseLoader className="h-80" />}><Offices /></Suspense>
    </div>
  );
}

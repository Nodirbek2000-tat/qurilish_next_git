import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { ChildManager } from "@/components/panel/ChildManager";
import { panelGet, type Rec, type Schema } from "@/lib/panel";

async function Items() {
  const [schema, { items }] = await Promise.all([panelGet<Schema>("/schema/"), panelGet<{ items: Rec[] }>("/activity/")]);
  return <ChildManager kind="activity" schema={schema.activity} items={items} />;
}

export default function ActivitiesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-[clamp(32px,4vw,48px)]">Kompaniya faoliyati</h1>
        <p className="mt-2 text-muted">Mukofotlar, sertifikatlar, ko&apos;rgazmalar — yil va tashkilot bilan. «Biz haqimizda» sahifasida kartochkalar bo&apos;lib chiqadi.</p>
      </div>
      <Suspense fallback={<HouseLoader className="h-80" />}><Items /></Suspense>
    </div>
  );
}

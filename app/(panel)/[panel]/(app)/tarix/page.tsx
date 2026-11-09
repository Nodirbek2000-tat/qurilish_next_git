import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { ChildManager } from "@/components/panel/ChildManager";
import { panelGet, type Rec, type Schema } from "@/lib/panel";

async function Items() {
  const [schema, { items }] = await Promise.all([panelGet<Schema>("/schema/"), panelGet<{ items: Rec[] }>("/history/")]);
  return <ChildManager kind="history" schema={schema.history} items={items} />;
}

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-display text-[clamp(32px,4vw,48px)]">Kompaniya tarixi</h1>
        <p className="mt-2 text-muted">«Biz haqimizda» sahifasidagi tarix slayderi. Har bir yil uchun voqea, izoh va rasm qo&apos;shing — yangi yillar birinchi chiqadi.</p>
      </div>
      <Suspense fallback={<HouseLoader className="h-80" />}><Items /></Suspense>
    </div>
  );
}

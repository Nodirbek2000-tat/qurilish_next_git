import { Suspense } from "react";
import { PanelNav } from "@/components/panel/PanelNav";
import { HouseLoader } from "@/components/HouseLoader";
import { assertPanelKey, panelGet, panelPath } from "@/lib/panel";

async function Shell({ children, params }: { children: React.ReactNode; params: Promise<{ panel: string }> }) {
  assertPanelKey((await params).panel); // kalit noto'g'ri bo'lsa — hech qanday yo'naltirishsiz 404
  const me = await panelGet<{ name: string }>("/me/"); // sessiya yo'q bo'lsa — kirishga yo'naltiradi
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <PanelNav base={panelPath()} name={me.name} />
      <main className="min-w-0 px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}

export default function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ panel: string }> }) {
  return (
    <Suspense fallback={<HouseLoader className="min-h-screen" label="Panel ochilmoqda" />}>
      <Shell params={params}>{children}</Shell>
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { assertPanelKey } from "@/lib/panel";

export const metadata: Metadata = { title: "Boshqaruv", robots: { index: false, follow: false } };

async function Gate({ params, children }: { params: Promise<{ panel: string }>; children: React.ReactNode }) {
  assertPanelKey((await params).panel); // noto'g'ri manzil — oddiy 404, panel borligi bilinmaydi
  return <>{children}</>;
}

export default function PanelRoot({ children, params }: { children: React.ReactNode; params: Promise<{ panel: string }> }) {
  return (
    <Suspense fallback={null}>
      <Gate params={params}>{children}</Gate>
    </Suspense>
  );
}

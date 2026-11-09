import { Suspense } from "react";
import { LoginForm } from "@/components/panel/LoginForm";
import { LogoMark } from "@/components/Logo";
import { PANEL_BOT } from "@/lib/panel";

async function Login({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  const { t } = await searchParams;
  const token = typeof t === "string" && /^[\w-]{20,100}$/.test(t) ? t : undefined;
  return <LoginForm token={token} bot={PANEL_BOT} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  return (
    <main className="grid min-h-screen place-items-center bg-night p-4">
      <div className="pointer-events-none fixed -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-accent opacity-25 blur-[140px]" />
      <div className="relative w-full max-w-[420px] rounded-[26px] bg-card p-8 shadow-2xl md:p-10">
        <div className="mb-8 flex items-end gap-2.5">
          <LogoMark />
          <span className="text-[19px] leading-none font-bold tracking-[0.34em]">ARXAN</span>
        </div>
        <Suspense fallback={null}><Login searchParams={searchParams} /></Suspense>
      </div>
    </main>
  );
}

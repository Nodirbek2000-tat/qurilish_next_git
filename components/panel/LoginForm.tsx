"use client";

import { LogIn, Send, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { telegramLoginAction, type LoginState } from "@/app/(panel)/[panel]/actions";

/**
 * Panelga kirish faqat Telegram bot orqali: login/parol yo'q.
 * Bot bergan havolada token bo'ladi — sahifa ochilganda emas, tugma bosilganda ishlatiladi
 * (Telegram/brauzer havolani oldindan ochib ko'rsa ham bir martalik token kuymaydi).
 */
export function LoginForm({ token, bot }: { token?: string; bot: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(telegramLoginAction, {});
  const botUrl = `https://t.me/${bot}`;

  if (token && !state.error) {
    return (
      <form action={action} className="space-y-5">
        <input type="hidden" name="token" value={token} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panelga kirish</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">Havola Telegram bot orqali tasdiqlandi. Kirish uchun tugmani bosing.</p>
        </div>
        <button type="submit" disabled={pending} className="btn btn-accent h-12 w-full justify-center disabled:opacity-60">
          <LogIn size={17} /> {pending ? "Kirilmoqda…" : "Panelga kirish"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panelga kirish</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">Kirish faqat Telegram bot orqali — login va parol yo&apos;q.</p>
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-medium text-[#b3261e]">{state.error}</p>}
      <ol className="space-y-3 text-sm">
        {[
          <>Telegram&apos;da <b>@{bot}</b> botini oching va <b>/start</b> bosing</>,
          <>«📱 Raqamni yuborish» tugmasi orqali raqamingizni yuboring</>,
          <>Bot bergan <b>bir martalik havolani</b> bosing (5 daqiqa amal qiladi)</>,
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sand text-xs font-bold tabular-nums">{i + 1}</span>
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ol>
      <a href={botUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ink h-12 w-full justify-center">
        <Send size={16} /> Telegram botni ochish
      </a>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck size={15} className="mt-px shrink-0" /> Faqat ruxsat berilgan raqamlar kira oladi. Ruxsat olish uchun administratorga murojaat qiling.
      </p>
    </div>
  );
}

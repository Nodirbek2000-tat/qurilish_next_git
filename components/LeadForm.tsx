"use client";

import { useActionState, useState } from "react";
import { sendLead, type LeadState } from "@/app/actions";
import { Arrow } from "./ui";

/** +998 90 123 45 67 ko'rinishiga keltiradi */
function maskPhone(value: string): string {
  let d = value.replace(/\D/g, "");
  if (!d.startsWith("998")) d = "998" + d; // maydon fokusda "+998 " bilan ochiladi
  d = d.slice(0, 12);
  const parts = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
  return "+" + parts.join(" ");
}

/** Botlar uchun yashirin tuzoq. Nomi ataylab ma'nosiz — brauzer avtoto'ldirishi uni tanimasin va to'ldirmasin. */
export function Honeypot() {
  return (
    <input type="text" name="hp_x9" tabIndex={-1} autoComplete="off" aria-hidden="true"
           data-lpignore="true" data-1p-ignore="" data-form-type="other" className="absolute -left-[9999px]" />
  );
}

export function Err({ err, name }: { err: Record<string, string>; name: string }) {
  return err[name] ? <p className="mt-1.5 text-sm text-[#e0603f]">{err[name]}</p> : null;
}

export function PhoneField({ err, placeholder = "+998 __ ___ __ __" }: { err: Record<string, string>; placeholder?: string }) {
  const [phone, setPhone] = useState(""); // boshqariladigan maydon — forma tozalanganda ham saqlanadi
  return (
    <label className="block">
      <span className="sr-only">Telefon raqamingiz</span>
      <input
        name="phone" type="tel" inputMode="tel" className="field tabular-nums" placeholder={placeholder}
        autoComplete="tel" required value={phone} aria-invalid={!!err.phone}
        onFocus={() => !phone && setPhone("+998 ")}
        onBlur={() => phone.replace(/\D/g, "").length <= 3 && setPhone("")}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").length > 3 ? maskPhone(e.target.value) : "+998 ")}
      />
      <Err err={err} name="phone" />
    </label>
  );
}

/** Rozilik matni — tugmaning haqiqiy nomi bilan («Yuborish», «Qo'ng'iroq kutaman»…) */
export function Consent({ button, dark = false, className = "" }: { button: string; dark?: boolean; className?: string }) {
  return (
    <p className={`text-xs ${dark ? "text-white/40" : "text-muted"} ${className}`}>
      «{button}» tugmasini bosish orqali shaxsiy ma&apos;lumotlaringizni qayta ishlashga rozilik bildirasiz.
    </p>
  );
}

export function Sent({ dark = false }: { dark?: boolean }) {
  return (
    <div className="rounded-[22px] border border-current/15 p-8" role="status">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-on-accent">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="mt-5 text-2xl font-semibold">Rahmat! So&apos;rovingiz qabul qilindi.</p>
      <p className={`mt-2 ${dark ? "text-white/60" : "text-muted"}`}>Mutaxassisimiz tez orada siz bilan bog&apos;lanadi.</p>
    </div>
  );
}

/** Formaning qaysi sahifadan yuborilgani — Telegramda kategoriya bo'lib keladi */
export type LeadSource = "bosh_sahifa" | "loyiha" | "xonadon" | "aloqa" | "ariza";

type Props = {
  source: LeadSource;
  project?: string;
  flat?: number;
  dark?: boolean;
  /** Ism, telefon va tugma bir qatorda (loyiha sahifasi uchun) */
  inline?: boolean;
  /** Tugma to'liq kenglikda, rozilik matni ostida o'rtada (Ariza oynasi uchun) */
  stack?: boolean;
  submitLabel?: string;
  buttonClass?: string;
};

export function LeadForm({ source, project, flat, dark = false, inline = false, stack = false, submitLabel, buttonClass }: Props) {
  const [state, action, pending] = useActionState<LeadState, FormData>(sendLead, { ok: false });
  const err = state.errors ?? {};
  const v = state.values ?? {};

  if (state.ok) return <Sent dark={dark} />;

  const label = submitLabel ?? (inline ? "Yuborish" : "Qo'ng'iroq kutaman");
  const button = (
    <button type="submit" disabled={pending} className={`btn ${buttonClass ?? (dark ? "btn-accent" : "btn-ink")} shrink-0 justify-center whitespace-nowrap disabled:opacity-60`}>
      {pending ? "Yuborilmoqda…" : label}
      {!pending && <Arrow />}
    </button>
  );

  return (
    <form action={action} className={`grid gap-4 ${dark ? "on-dark" : ""}`} noValidate>
      <input type="hidden" name="kind" value="qongiroq" />
      <input type="hidden" name="source" value={source} />
      {project && <input type="hidden" name="project" value={project} />}
      {flat && <input type="hidden" name="flat" value={flat} />}
      <Honeypot />

      <div className={inline ? "grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]" : "grid gap-4"}>
        <label className="block">
          <span className="sr-only">Ismingiz</span>
          <input name="name" className="field" placeholder="Ismingiz" autoComplete="name" required maxLength={120} aria-invalid={!!err.name} defaultValue={v.name} />
          <Err err={err} name="name" />
        </label>
        <PhoneField err={err} placeholder={inline ? "Telefon" : undefined} />
        {inline && <div className="sm:col-span-2 lg:col-span-1 [&>.btn]:h-[54px] [&>.btn]:w-full">{button}</div>}
      </div>

      {state.message && <p className="text-sm text-[#e0603f]" role="alert">{state.message}</p>}

      {inline ? (
        <Consent button={label} dark={dark} />
      ) : stack ? (
        <div className="grid gap-4 [&>.btn]:h-14 [&>.btn]:w-full">
          {button}
          <Consent button={label} dark={dark} className="text-center" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {button}
          <Consent button={label} dark={dark} />
        </div>
      )}
    </form>
  );
}

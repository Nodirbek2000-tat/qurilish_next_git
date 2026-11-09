"use client";

import { useActionState, useState } from "react";
import { sendLead, type LeadState } from "@/app/actions";
import { Consent, Err, Honeypot, PhoneField, Sent } from "./LeadForm";
import { Arrow } from "./ui";

const TABS = [
  { value: "mijoz", label: "Mijoz" },
  { value: "kompaniya", label: "Kompaniya" },
] as const;

/** «Murojaat» sahifasi: jismoniy shaxs yoki kompaniya nomidan murojaat */
export function AppealForm() {
  const [state, action, pending] = useActionState<LeadState, FormData>(sendLead, { ok: false });
  const [applicant, setApplicant] = useState<(typeof TABS)[number]["value"]>("mijoz");
  const err = state.errors ?? {};
  const v = state.values ?? {};
  const company = applicant === "kompaniya"; // kompaniya uchun hamma maydon majburiy

  if (state.ok) return <Sent />;

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="kind" value="murojaat" />
      <input type="hidden" name="source" value="murojaat" />
      <input type="hidden" name="applicant" value={applicant} />
      <Honeypot />

      <div role="tablist" aria-label="Kim nomidan" className="mb-4 grid grid-cols-2 gap-3 sm:gap-6">
        {TABS.map((t) => (
          <button key={t.value} type="button" role="tab" aria-selected={applicant === t.value} onClick={() => setApplicant(t.value)}
                  className={`btn h-14 justify-center border ${applicant === t.value ? "btn-ink border-transparent" : "border-line hover:border-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {applicant === "kompaniya" && (
        <>
          <label className="block">
            <span className="sr-only">Kompaniya nomi</span>
            <input name="company" className="field" placeholder="Kompaniya nomi" autoComplete="organization" required maxLength={200} aria-invalid={!!err.company} defaultValue={v.company} />
            <Err err={err} name="company" />
          </label>
          <label className="block">
            <span className="sr-only">Kompaniyaning STIR (INN) raqami</span>
            <input name="inn" className="field tabular-nums" placeholder="Kompaniyaning STIR (INN) raqami" inputMode="numeric" required maxLength={9} aria-invalid={!!err.inn} defaultValue={v.inn} />
            <Err err={err} name="inn" />
          </label>
        </>
      )}

      <label className="block">
        <span className="sr-only">Ism-sharifingiz</span>
        <input name="name" className="field" placeholder={applicant === "kompaniya" ? "Mas'ul shaxsning ism-sharifi" : "Ism-sharifingiz"} autoComplete="name" required maxLength={120} aria-invalid={!!err.name} defaultValue={v.name} />
        <Err err={err} name="name" />
      </label>
      <PhoneField err={err} placeholder="Telefon raqami" />
      <label className="block">
        <span className="sr-only">Elektron pochta</span>
        <input name="email" type="email" className="field" placeholder={company ? "Elektron pochta manzili" : "Elektron pochta manzili (ixtiyoriy)"}
               autoComplete="email" maxLength={254} required={company} aria-invalid={!!err.email} defaultValue={v.email} />
        <Err err={err} name="email" />
      </label>
      <label className="block">
        <span className="sr-only">Hujjat raqami</span>
        <input name="doc_number" className="field" placeholder={company ? "Hujjat raqami" : "Hujjat raqami (ixtiyoriy)"} maxLength={60}
               required={company} aria-invalid={!!err.doc_number} defaultValue={v.doc_number} />
        <Err err={err} name="doc_number" />
      </label>
      <label className="block">
        <span className="sr-only">Murojaat mavzusi</span>
        <input name="subject" className="field" placeholder={company ? "Murojaat mavzusi" : "Murojaat mavzusi (ixtiyoriy)"} maxLength={200}
               required={company} aria-invalid={!!err.subject} defaultValue={v.subject} />
        <Err err={err} name="subject" />
      </label>
      <label className="block">
        <span className="sr-only">Xabar</span>
        <textarea name="message" className="field" placeholder="Xabar" rows={6} maxLength={3000} required aria-invalid={!!err.message} defaultValue={v.message} />
        <Err err={err} name="message" />
      </label>

      {state.message && <p className="text-sm text-[#e0603f]" role="alert">{state.message}</p>}

      <div className="mt-2 flex flex-col items-center gap-4 text-center">
        <button type="submit" disabled={pending} className="btn btn-ink w-full justify-center disabled:opacity-60 sm:w-auto sm:min-w-72">
          {pending ? "Yuborilmoqda…" : "Yuborish"}
          {!pending && <Arrow />}
        </button>
        <Consent button="Yuborish" />
      </div>
    </form>
  );
}

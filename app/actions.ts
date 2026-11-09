"use server";

import { headers } from "next/headers";
import { API_URL, type Flat } from "@/lib/api";

/** `values` — xato bo'lsa forma qayta to'ldiriladi (React yuborilgan formani tozalab yuboradi) */
export type LeadState = { ok: boolean; message?: string; errors?: Record<string, string>; values?: Record<string, string> };

const FIELDS = ["name", "phone", "email", "subject", "message", "project", "flat", "country",
  "source", "applicant", "company", "inn", "doc_number"] as const;
const KINDS = ["murojaat", "qongiroq"];

export async function sendLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  const kind = String(form.get("kind"));
  const payload: Record<string, string> = { kind: KINDS.includes(kind) ? kind : "murojaat" };
  for (const f of FIELDS) payload[f] = String(form.get(f) ?? "").slice(0, 3000);
  // Tuzoq to'ldirilgan bo'lsa ham murojaat yo'qolmaydi — faqat «bot bo'lishi mumkin» deb belgilanadi
  if (form.get("hp_x9")) payload.suspect = "1";

  const h = await headers();
  const ip = (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "").trim();

  try {
    const res = await fetch(`${API_URL}/api/appeals/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Site-Key": process.env.SITE_API_KEY ?? "",
        "X-Client-IP": ip,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (res.status === 201) return { ok: true };
    if (res.status === 422) return { ok: false, errors: (await res.json()).errors, values: payload };
    if (res.status === 429) return { ok: false, message: "So'rovlar juda ko'p. Birozdan keyin qayta urinib ko'ring.", values: payload };
  } catch {
    // pastdagi umumiy xabar
  }
  return { ok: false, message: "Xatolik yuz berdi. Iltimos, telefon orqali bog'laning.", values: payload };
}

/** Sevimlilar sahifasi uchun: brauzerdagi id'lar bo'yicha xonadonlar */
export async function loadFlatsByIds(ids: number[]): Promise<Flat[]> {
  const clean = ids.filter((x) => Number.isInteger(x) && x > 0).slice(0, 100);
  if (!clean.length) return [];
  try {
    const res = await fetch(`${API_URL}/api/flats/by-ids/?ids=${clean.join(",")}`, { cache: "no-store" });
    return res.ok ? (await res.json()).items : [];
  } catch {
    return [];
  }
}

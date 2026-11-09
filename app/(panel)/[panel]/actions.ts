"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, PANEL_KEY, panelFetch, panelPath } from "@/lib/panel";

export type LoginState = { error?: string };

async function startSession(data: { token: string; maxAge: number }): Promise<never> {
  (await cookies()).set(COOKIE, data.token, {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production",
    path: `/${PANEL_KEY}`, maxAge: data.maxAge,
  });
  redirect(panelPath());
}

/** Bot bergan bir martalik havola (…/kirish?t=…) → «Panelga kirish» tugmasi bosilganda sessiya */
export async function telegramLoginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const res = await panelFetch("/telegram-login/", {
    auth: false, method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: String(form.get("token") ?? "").slice(0, 100) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error ?? "Xatolik yuz berdi. Botdan yangi havola oling." };
  return startSession(data);
}

export async function logoutAction() {
  (await cookies()).delete({ name: COOKIE, path: `/${PANEL_KEY}` });
  redirect(panelPath("/kirish"));
}

export type SaveState = { ok?: boolean; id?: number; errors?: Record<string, string[]>; error?: string };

const KINDS = new Set(["project", "arch", "interior", "lobby", "infra", "gallery", "catalog", "office", "history", "activity", "flat", "layout", "layoutimage"]);

/** Yozuvni yaratish/yangilash. Bo'sh fayl maydonlari yuborilmaydi (eski fayl qoladi). */
export async function saveRecord(kind: string, id: number | null, _prev: SaveState, form: FormData): Promise<SaveState> {
  if (!KINDS.has(kind)) return { error: "Noma'lum bo'lim" };
  const out = new FormData();
  for (const [k, v] of form.entries()) {
    if (k.startsWith("$ACTION")) continue;
    if (typeof v !== "string" && v.size === 0) continue;
    out.append(k, v);
  }
  const res = await panelFetch(`/${kind}/${id ? `${id}/` : ""}`, { method: "POST", body: out });
  if (res.status === 401) redirect(panelPath("/kirish"));
  const data = await res.json().catch(() => ({}));
  if (res.status === 422) return { errors: data.errors };
  if (!res.ok) return { error: "Saqlab bo'lmadi. Qayta urinib ko'ring." };
  revalidatePath(panelPath(), "layout");
  return { ok: true, id: data.id };
}

export async function deleteRecord(kind: string, id: number) {
  if (!KINDS.has(kind)) return;
  const res = await panelFetch(`/${kind}/${id}/`, { method: "DELETE" });
  if (res.status === 401) redirect(panelPath("/kirish"));
  revalidatePath(panelPath(), "layout");
}

export async function deleteProject(id: number): Promise<{ error: string } | undefined> {
  const res = await panelFetch(`/project/${id}/`, { method: "DELETE" });
  if (res.status === 401) redirect(panelPath("/kirish"));
  if (!res.ok && res.status !== 404) return { error: "O'chirib bo'lmadi. Qayta urinib ko'ring." };
  revalidatePath(panelPath(), "layout");
  redirect(panelPath("/loyihalar"));
}

export async function setAppealState(id: number, state: string) {
  const res = await panelFetch(`/appeals/${id}/`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }),
  });
  if (res.status === 401) redirect(panelPath("/kirish"));
  revalidatePath(panelPath("/murojaatlar"));
}

/** Xonadon turi (loyiha + xonalar + maydon) yozuvini topadi yoki yaratadi — rasmlar shunga yuklanadi */
export async function ensureLayout(project: number, rooms: number, area: string): Promise<number | null> {
  const res = await panelFetch("/flat-layout/", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project, rooms, area }),
  });
  if (res.status === 401) redirect(panelPath("/kirish"));
  if (!res.ok) return null;
  return (await res.json()).id;
}

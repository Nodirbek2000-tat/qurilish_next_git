import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { API_URL } from "./api";

/* Admin panel — faqat serverda. Token httpOnly cookie'da, brauzer Django bilan to'g'ridan-to'g'ri gaplashmaydi. */

export const PANEL_KEY = process.env.PANEL_URL_KEY ?? "panel";
export const COOKIE = "arxan_panel";
export const panelPath = (p = "") => `/${PANEL_KEY}${p}`;
/** Panelga kirish faqat shu bot orqali (login/parol yo'q) */
export const PANEL_BOT = process.env.PANEL_BOT ?? "arxansorovbot";

export function assertPanelKey(key: string) {
  if (!PANEL_KEY || key !== PANEL_KEY) notFound();
}

async function clientIp() {
  const h = await headers();
  return (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "").trim();
}

export async function panelFetch(path: string, init: RequestInit & { auth?: boolean } = {}) {
  const { auth = true, ...rest } = init;
  const h = new Headers(rest.headers);
  h.set("X-Site-Key", process.env.SITE_API_KEY ?? "");
  h.set("X-Client-IP", await clientIp());
  if (auth) {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return new Response(null, { status: 401 });
    h.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_URL}/api/panel${path}`, { ...rest, headers: h, cache: "no-store" });
}

/** JSON qaytaradi; sessiya tugagan bo'lsa — kirish sahifasiga */
export async function panelGet<T>(path: string): Promise<T> {
  const res = await panelFetch(path);
  if (res.status === 401) redirect(panelPath("/kirish"));
  if (!res.ok) throw new Error(`panel ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export type FieldSchema = {
  name: string; label: string; type: string; help: string; required: boolean;
  choices?: { value: string | number; label: string }[];
  size?: { minW: number; minH: number; ratio: [number, number] | null };
  accept?: string;
};
export type KindSchema = { label: string; parent: string | null; groups: { title: string; fields: FieldSchema[] }[] };
export type Schema = Record<string, KindSchema>;
export type Rec = { id: number; [k: string]: unknown };

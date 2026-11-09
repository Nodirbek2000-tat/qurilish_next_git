import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const ALLOWED = new Set(["site", "projects", "posts", "flats"]);

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Django panelda o'zgarish bo'lganda chaqiradi — kesh darhol yangilanadi. */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? "";
  if (!secret || !safeEqual(request.headers.get("x-revalidate-secret") ?? "", secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const tags = (Array.isArray(body.tags) ? body.tags : []).filter((t: unknown) => typeof t === "string" && ALLOWED.has(t));
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, tags });
}

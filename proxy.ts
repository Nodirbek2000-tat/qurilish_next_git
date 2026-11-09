import { NextResponse, type NextRequest } from "next/server";

/*
 * Render boshlanishidan OLDIN ishlaydi:
 *  - noma'lum manzillar → haqiqiy 404 (panel borligi hech qayerda bilinmaydi)
 *  - panel: cookie bo'lmasa → kirish sahifasi
 */

const KEY = process.env.PANEL_URL_KEY ?? "";
const COOKIE = "arxan_panel";
const SITE = new Set([
  "", "kvartiralar", "loyihalar", "biz-haqimizda", "media", "murojaat",
  "aloqa", "sevimlilar", "bino", "kvartira", "api", "uploads", "_next", "topilmadi", "textures",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  if (KEY && first === KEY) {
    const isLogin = pathname === `/${KEY}/kirish`;
    if (!isLogin && !request.cookies.has(COOKIE)) {
      return NextResponse.redirect(new URL(`/${KEY}/kirish`, request.url));
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Referrer-Policy", "no-referrer"); // kirish havolasidagi token boshqa saytga sizmasin
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (SITE.has(first) || first.includes(".")) return NextResponse.next();
  return NextResponse.rewrite(new URL("/topilmadi", request.url), { status: 404 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|uploads/).*)"],
};

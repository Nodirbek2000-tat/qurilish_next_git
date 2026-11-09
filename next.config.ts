import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8001";
// Yuklangan rasmlar qayerdan olinadi. Serverda (Docker) — nginx beradi, Django emas
const UPLOADS_ORIGIN = process.env.UPLOADS_ORIGIN ?? API_URL;

const nextConfig: NextConfig = {
  // Docker uchun: faqat kerakli fayllar (.next/standalone) — obraz kichik, tez ishga tushadi
  output: "standalone",
  experimental: {
    agentFeedback: true,
    // Paneldan video (40 MB gacha) va rasmlar yuklash uchun
    serverActions: { bodySizeLimit: "45mb" },
  },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Django yuklagan rasmlar sayt domenidan beriladi: /uploads/... (/media/ — "Media" bo'limi sahifalari)
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${UPLOADS_ORIGIN}/uploads/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/api";
import { NAV } from "@/components/nav";

const BASE = process.env.SITE_URL ?? "http://localhost:3002";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts(100)]);
  return [
    { url: BASE, priority: 1 },
    ...NAV.map((n) => ({ url: `${BASE}${n.href}`, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${BASE}/loyihalar/${p.slug}`, priority: 0.9 })),
    ...posts.map((p) => ({ url: `${BASE}/media/${p.slug}`, lastModified: p.date, priority: 0.6 })),
  ];
}

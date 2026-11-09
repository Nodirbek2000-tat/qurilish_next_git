import { cacheLife, cacheTag } from "next/cache";

export const API_URL = process.env.API_URL ?? "http://127.0.0.1:8001";

export type ProjectStatus = "qurilmoqda" | "sotuvda" | "topshirilgan";
export type PostKind = "yangilik" | "qurilish" | "hamkorlik" | "foto" | "video";

export type Project = {
  slug: string;
  title: string;
  status: ProjectStatus;
  statusLabel: string;
  klass: string;
  tagline: string;
  address: string;
  color: string;
  cover: string | null;
  floors: number | null;
  flats: number | null;
  area: number | null;
  handover: string;
  lat: number | null;
  lng: number | null;
  /** 1 m² narxi, so'm (bo'lmasa — null) */
  priceM2: number | null;
};

export type PostBrief = {
  slug: string;
  title: string;
  kind: PostKind;
  kindLabel: string;
  cover: string | null;
  excerpt: string;
  date: string;
};

export type InfraCategory = "talim" | "bogcha" | "tibbiyot" | "savdo" | "dam" | "sport" | "kafe";
export type InfraPoint = { category: InfraCategory; categoryLabel: string; name: string; lat: number; lng: number };
export type Office = { name: string; address: string; phone: string; hours: string; lat: number | null; lng: number | null; photo: string | null };

export type ProjectDetail = Project & {
  hero: string | null;
  logo: string | null;
  description: string[];
  features: string[];
  about: { image: string | null; video: string | null; blocks: number | null; queues: number | null };
  arch: { title: string; text: string; image: string | null }[];
  interior: { title: string; text: string; image: string }[];
  lobby: { title: string; text: string; image: string | null; features: { icon: string; label: string }[] };
  infra: InfraPoint[];
  office: Office | null;
  liveUrl: string;
  tourUrl: string;
  gallery: { src: string; caption: string }[];
  /** Kitobdek varaqlanadigan katalog sahifalari (1, 2, 3… tartibida) */
  catalog: { src: string; w: number | null; h: number | null }[];
  others: Project[];
  news: PostBrief[];
};

export type PostDetail = PostBrief & {
  body: string[];
  videoUrl: string;
  gallery: string[];
  project: { slug: string; title: string } | null;
  related: PostBrief[];
};

export type Site = {
  phone: string;
  email: string;
  address: string;
  lat: number | null;
  lng: number | null;
  workHours: string[];
  socials: Partial<Record<"telegram" | "instagram" | "facebook" | "youtube", string>>;
  about: { title: string; text: string[] };
  stats: { founded: number | null; projects: number; families: number; area: number };
  milestones: { year: number; title: string; text: string; image: string | null }[];
  activities: { year: number; organization: string; title: string; image: string | null }[];
  offices: { name: string; address: string; phone: string; hours: string; lat: number | null; lng: number | null; photo?: string | null }[];
  years?: number;
};

const FALLBACK_SITE: Site = {
  phone: "",
  email: "",
  address: "Samarqand",
  lat: null,
  lng: null,
  workHours: [],
  socials: {},
  about: { title: "Arxan", text: [] },
  stats: { founded: null, projects: 0, families: 0, area: 0 },
  milestones: [],
  activities: [],
  offices: [],
};

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}/api${path}`, { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

// Panelda o'zgarish bo'lsa Django /api/revalidate ga xabar beradi → teglar yangilanadi.

export async function getSite(): Promise<Site> {
  "use cache";
  cacheLife("minutes");
  cacheTag("site");
  let site = FALLBACK_SITE;
  try {
    // Standart qiymatlar ustiga — API'da yangi maydon hali bo'lmasa ham sahifa yiqilmaydi
    site = { ...FALLBACK_SITE, ...(await get<Site>("/site/")) };
  } catch {}
  // Kesh ichida hisoblanadi — har so'rovda emas. Yil kiritilmagan bo'lsa tajriba ko'rsatilmaydi.
  const founded = site.stats.founded;
  return { ...site, years: founded ? Math.max(1, new Date().getFullYear() - founded) : undefined };
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("projects");
  try {
    return (await get<{ items: Project[] }>("/projects/"))?.items ?? [];
  } catch {
    return [];
  }
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("projects");
  return get<ProjectDetail>(`/projects/${encodeURIComponent(slug)}/`);
}

export async function getPosts(limit = 60): Promise<PostBrief[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  try {
    return (await get<{ items: PostBrief[] }>(`/posts/?limit=${limit}`))?.items ?? [];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<PostDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  return get<PostDetail>(`/posts/${encodeURIComponent(slug)}/`);
}

// ---------- xonadonlar ----------

export type FlatStatus = "sotuvda" | "band" | "sotilgan";

export type Flat = {
  id: number;
  number: string;
  kind: "turar" | "tijorat";
  rooms: number;
  area: number;
  floor: number;
  status: FlatStatus;
  statusLabel: string;
  price: number | null;
  priceM2: number | null;
  plan: string | null;
  building: { id: number; number: number; queue: number };
  year: number | null;
  project: { slug: string; title: string; color: string };
};

export type FlatPage = {
  items: Flat[];
  total: number;
  page: number;
  pages: number;
  facets: { floor: [number, number]; area: [number, number]; years: number[]; projects: { slug: string; title: string }[] };
};

export type FlatDetail = Flat & {
  floorPlan: string | null; buildingFloors: number; sameFloor: Flat[];
  /** Shu o'lchamdagi xonadon turining rasmlari va tavsifi (panel → Xonadonlar) */
  gallery: { src: string; caption: string }[]; about: string[];
  /** Xonalar tarkibi (rejadagi raqamlar tartibida) */
  parts: { name: string; area: number }[];
};

export type Genplan = Project & {
  genplan: string | null;
  buildings: { id: number; number: number; floors: number; queue: number; year: number | null; x: number; y: number; available: number; total: number }[];
};

export type BuildingView = {
  id: number;
  number: number;
  queue: number;
  year: number | null;
  project: Project;
  siblings: [number, number][];
  floors: { floor: number; available: number }[];
  floor: number;
  floorPlan: string | null;
  flats: Flat[];
};

const EMPTY_FLATS: FlatPage = { items: [], total: 0, page: 1, pages: 1, facets: { floor: [1, 1], area: [0, 0], years: [], projects: [] } };

export async function getFlats(query: string): Promise<FlatPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("flats");
  try {
    return (await get<FlatPage>(`/flats/?${query}`)) ?? EMPTY_FLATS;
  } catch {
    return EMPTY_FLATS;
  }
}

export async function getFlat(id: string): Promise<FlatDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("flats");
  return /^\d+$/.test(id) ? get<FlatDetail>(`/flats/${id}/`) : null;
}

export async function getGenplan(slug: string): Promise<Genplan | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("flats");
  return get<Genplan>(`/projects/${encodeURIComponent(slug)}/genplan/`);
}

export async function getBuilding(id: string, floor: string): Promise<BuildingView | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("flats");
  if (!/^\d+$/.test(id)) return null;
  return get<BuildingView>(`/buildings/${id}/${/^-?\d+$/.test(floor) ? `?floor=${floor}` : ""}`);
}

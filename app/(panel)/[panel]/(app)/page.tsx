import { Building2, DoorOpen, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { panelGet, panelPath } from "@/lib/panel";

type Dash = {
  projects: number; appealsNew: number;
  flats: { sotuvda: number; band: number; sotilgan: number };
  recent: { id: number; category: string; name: string; phone: string; project: string | null; stateLabel: string; state: string; created: string }[];
};

async function Dashboard() {
  const d = await panelGet<Dash>("/dashboard/");
  const total = d.flats.sotuvda + d.flats.band + d.flats.sotilgan || 1;
  const cards = [
    { label: "Loyihalar", value: d.projects, Icon: Building2, href: panelPath("/loyihalar") },
    { label: "Sotuvdagi xonadonlar", value: d.flats.sotuvda, Icon: DoorOpen },
    { label: "Yangi murojaatlar", value: d.appealsNew, Icon: Mail, href: panelPath("/murojaatlar"), hot: d.appealsNew > 0 },
  ];
  return (
    <div className="space-y-8">
      <h1 className="h-display text-[clamp(32px,4vw,48px)]">Bosh sahifa</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, Icon, href, hot }) => {
          const body = (
            <>
              <span className={`grid h-11 w-11 place-items-center rounded-full ${hot ? "bg-accent text-on-accent" : "bg-sand"}`}><Icon size={20} /></span>
              <p className="mt-5 text-4xl font-semibold tracking-tight tabular-nums">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </>
          );
          return href
            ? <Link key={label} href={href} className="rounded-[22px] border border-line bg-card p-6 transition-colors hover:border-accent">{body}</Link>
            : <div key={label} className="rounded-[22px] border border-line bg-card p-6">{body}</div>;
        })}
      </div>

      <div className="rounded-[22px] border border-line bg-card p-6">
        <p className="font-semibold">Xonadonlar holati</p>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full">
          <span className="bg-[#2f7d4f]" style={{ width: `${(d.flats.sotuvda / total) * 100}%` }} />
          <span className="bg-[#d9a23b]" style={{ width: `${(d.flats.band / total) * 100}%` }} />
          <span className="bg-ink/30" style={{ width: `${(d.flats.sotilgan / total) * 100}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-5 text-sm">
          <span><b className="text-[#2f7d4f]">●</b> Sotuvda: {d.flats.sotuvda}</span>
          <span><b className="text-[#d9a23b]">●</b> Band: {d.flats.band}</span>
          <span><b className="text-muted">●</b> Sotilgan: {d.flats.sotilgan}</span>
        </div>
      </div>

      <div className="rounded-[22px] border border-line bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold">So&apos;nggi murojaatlar</p>
          <Link href={panelPath("/murojaatlar")} className="text-sm font-semibold text-accent">Barchasi →</Link>
        </div>
        <ul className="divide-y divide-line">
          {d.recent.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
              <span className={`h-2 w-2 rounded-full ${a.state === "yangi" ? "bg-accent" : "bg-line"}`} />
              <b>{a.name}</b>
              <a href={`tel:${a.phone.replace(/[^\d+]/g, "")}`} className="tabular-nums hover:text-accent">{a.phone}</a>
              <span className="text-muted">{a.category}{a.project && !a.category.includes(a.project) ? ` · ${a.project}` : ""}</span>
              <span className="ml-auto text-xs text-muted">{new Date(a.created).toLocaleString("uz-UZ")}</span>
            </li>
          ))}
          {d.recent.length === 0 && <li className="py-6 text-center text-muted">Murojaatlar yo&apos;q</li>}
        </ul>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<HouseLoader className="h-96" />}><Dashboard /></Suspense>;
}

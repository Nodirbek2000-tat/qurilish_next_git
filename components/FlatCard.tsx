import { Building2, CalendarCheck, Layers, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Flat } from "@/lib/api";
import { formatArea, formatPrice, roomsLabel } from "@/lib/format";
import { FavButton } from "./FavButton";
import { FlatPlan } from "./FlatPlan";

export function FlatCard({ flat, index = 0 }: { flat: Flat; index?: number }) {
  const rows = [
    { k: "Maydon", v: formatArea(flat.area), Icon: Ruler },
    { k: "Qavat", v: String(flat.floor), Icon: Layers },
    { k: "Blok", v: `${flat.building.number}-blok`, Icon: Building2 },
    { k: "Topshirish", v: flat.year ? String(flat.year) : "—", Icon: CalendarCheck },
  ];
  return (
    <article className="group relative" data-reveal style={{ "--d": index % 4 } as React.CSSProperties}>
      <Link href={`/kvartira/${flat.id}`} className="block rounded-[22px] border border-line bg-card p-5 transition-all duration-500 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_30px_60px_-35px_rgb(18_20_23/0.35)]">
        <div className="pr-12">
          <p className="text-xs font-semibold tracking-wide">
            <span style={{ color: flat.project.color }}>{flat.project.title}</span>
            <span className="text-muted tabular-nums"> · № {flat.number}</span>
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">{roomsLabel(flat.rooms, flat.kind)}</h3>
        </div>
        <div className="relative my-5 aspect-[4/3] text-ink">
          {flat.plan ? (
            <Image src={flat.plan} alt={`${roomsLabel(flat.rooms)} reja`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain" />
          ) : (
            <FlatPlan rooms={flat.rooms} area={flat.area} kind={flat.kind} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" />
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
          {rows.map(({ k, v, Icon }) => (
            <div key={k}>
              <dt className="flex items-center gap-1.5 text-xs text-muted"><Icon size={13} strokeWidth={1.8} /> {k}</dt>
              <dd className="mt-0.5 font-semibold whitespace-nowrap tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">Narx</span>
          <span className="font-semibold whitespace-nowrap tabular-nums text-accent">{flat.price ? formatPrice(flat.price) : "So'rov bo'yicha"}</span>
        </p>
      </Link>
      <FavButton id={flat.id} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100" />
    </article>
  );
}

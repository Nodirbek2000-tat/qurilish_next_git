import {
  Accessibility, ArrowUpDown, Baby, Car, Cctv, DoorClosed, Dumbbell, LampCeiling, Package, PanelTop, ShieldCheck,
  Sofa, Sparkles, ThermometerSun, Trees, Wifi, type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { ProjectDetail } from "@/lib/api";
import { BuildingArt } from "../BuildingArt";

const ICONS: Record<string, LucideIcon> = {
  "arrow-up-down": ArrowUpDown, "door-closed": DoorClosed, "panel-top": PanelTop, "lamp-ceiling": LampCeiling,
  "shield-check": ShieldCheck, cctv: Cctv, car: Car, trees: Trees, baby: Baby, dumbbell: Dumbbell, wifi: Wifi,
  "thermometer-sun": ThermometerSun, sofa: Sofa, package: Package, accessibility: Accessibility, sparkles: Sparkles,
};

/** Arxitektura: kartalar zinapoya bo'lib joylashadi; o'rtadagisi matn bilan boshlanadi */
export function ArchSection({ items, seed, color }: { items: ProjectDetail["arch"]; seed: string; color: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((a, i) => {
        const textFirst = i % 3 === 1;
        const img = (
          <div className="zoom-img relative aspect-[4/5] overflow-hidden rounded-[20px] bg-sand" data-parallax>
            {a.image
              ? <Image src={a.image} alt={a.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              : <BuildingArt seed={`${seed}-${i}`} color={color} className="absolute inset-0 h-full w-full" />}
          </div>
        );
        const text = (
          <div className="p-6 md:p-7">
            <span className="text-sm font-semibold text-accent tabular-nums">0{i + 1}</span>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{a.title}</h3>
            {a.text && <p className="mt-3 leading-relaxed text-muted">{a.text}</p>}
          </div>
        );
        return (
          <article key={i} data-reveal style={{ "--d": i } as React.CSSProperties}
                   className={`group overflow-hidden rounded-[26px] border border-line bg-card p-2 transition-shadow duration-500 hover:shadow-[0_40px_80px_-50px_rgb(0_0_0/0.45)] ${
                     i % 3 === 1 ? "md:mt-16" : ""
                   }`}>
            {textFirst ? <>{text}{img}</> : <>{img}{text}</>}
          </article>
        );
      })}
    </div>
  );
}

/** Nafis lobbi: rasm + rangli panel, afzalliklar ikonkalar bilan */
export function LobbySection({ lobby, seed, color }: { lobby: ProjectDetail["lobby"]; seed: string; color: string }) {
  return (
    <div className="grid items-center lg:grid-cols-[1fr_1.1fr]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] bg-sand lg:-mr-24" data-reveal="curtain" data-parallax>
        {lobby.image
          ? <Image src={lobby.image} alt={lobby.title} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          : <BuildingArt seed={`${seed}-lobby`} color={color} className="absolute inset-0 h-full w-full" />}
      </div>
      <div className="relative z-10 -mt-20 mx-4 rounded-[30px] p-8 text-on-accent shadow-[0_50px_100px_-50px_rgb(0_0_0/0.6)] md:p-12 lg:m-0" style={{ background: color }} data-reveal>
        <h2 className="h-display text-[clamp(34px,4.4vw,60px)]">{lobby.title}</h2>
        {lobby.text && <p className="mt-6 max-w-xl leading-relaxed opacity-80">{lobby.text}</p>}
        {lobby.features.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {lobby.features.map((f) => {
              const Icon = ICONS[f.icon] ?? Sparkles;
              return (
                <li key={f.label} className="flex flex-col gap-3 border-l border-current/20 pl-4 first:border-0 first:pl-0 sm:first:pl-0">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><Icon size={22} /></span>
                  <span className="text-sm font-semibold">{f.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

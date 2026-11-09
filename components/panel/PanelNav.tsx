"use client";

import { Award, Building2, DoorOpen, ExternalLink, History, LayoutDashboard, LogOut, Mail, Menu, Store, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/(panel)/[panel]/actions";
import { LogoMark, LogoWord } from "../Logo";

export function PanelNav({ base, name }: { base: string; name: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = [
    { href: base, label: "Bosh sahifa", Icon: LayoutDashboard, exact: true },
    { href: `${base}/loyihalar`, label: "Loyihalar", Icon: Building2 },
    { href: `${base}/xonadonlar`, label: "Xonadonlar", Icon: DoorOpen },
    { href: `${base}/murojaatlar`, label: "Murojaatlar", Icon: Mail },
    { href: `${base}/ofislar`, label: "Sotuv ofislari", Icon: Store },
    { href: `${base}/tarix`, label: "Kompaniya tarixi", Icon: History },
    { href: `${base}/faoliyat`, label: "Kompaniya faoliyati", Icon: Award },
  ];
  const active = (h: string, exact?: boolean) => (exact ? path === h : path.startsWith(h));

  return (
    <>
      <div className="flex items-center justify-between bg-night px-4 py-3 text-white lg:hidden">
        <span className="flex items-center gap-2"><LogoMark size={28} /><LogoWord height={22} /></span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Menyu">{open ? <X /> : <Menu />}</button>
      </div>
      <aside className={`${open ? "block" : "hidden"} bg-night text-white lg:sticky lg:top-0 lg:block lg:h-screen`}>
        <div className="flex h-full flex-col p-5">
          <div className="mb-10 hidden items-center gap-2.5 px-2 pt-2 lg:flex">
            <LogoMark size={34} /><LogoWord height={26} />
          </div>
          <nav className="space-y-1">
            {items.map(({ href, label, Icon, exact }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                      active(href, exact) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}>
                <Icon size={18} className={active(href, exact) ? "text-accent" : ""} /> {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
            <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white">
              <ExternalLink size={16} /> Saytni ochish
            </a>
            <form action={logoutAction}>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white">
                <LogOut size={16} /> Chiqish <span className="ml-auto truncate text-xs text-white/40">{name}</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

import Link from "next/link";
import { lightenForDark, readableOn } from "@/lib/format";

/** Sahifa ochiq turganda butun sayt (menyu, tugmalar) loyiha rangiga o'tadi. */
export function ProjectTheme({ color, darkHero = false }: { color: string; darkHero?: boolean }) {
  const safe = /^#[0-9a-f]{6}$/i.test(color) ? color : "#b85c38";
  const light = lightenForDark(safe);
  // To'q joylar (hero, footer, to'q bloklar) va tungi rejimda — rangning yorqin varianti
  const dark = `--accent:${light};--on-accent:${readableOn(light)}`;
  const hero = darkHero ? `header[data-top="true"]{color:#fff;${dark}}header[data-top="true"] .border-line{border-color:rgb(255 255 255/.3)}` : "";
  return (
    <style>{`:root{--accent:${safe};--on-accent:${readableOn(safe)}}.bg-night{${dark}}:root[data-theme="dark"]{${dark}}${hero}`}</style>
  );
}

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Yo'l" className="flex flex-wrap items-center gap-2 text-sm text-muted">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="opacity-40">/</span>}
          {it.href ? <Link href={it.href} className="hover:text-accent">{it.label}</Link> : <span className="text-ink">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

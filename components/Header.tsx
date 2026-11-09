"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FavLink } from "./FavButton";
import { Logo } from "./Logo";
import { RequestButton } from "./RequestButton";
import { ThemeToggle } from "./ThemeToggle";
import { NAV } from "./nav";

type ListProps = { pathname: string; mobile?: boolean; open?: boolean; onNavigate?: () => void };

function NavList({ pathname, mobile, open, onNavigate }: ListProps) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (mobile) {
    return (
      <ul className="space-y-1">
        {NAV.map((item, i) => (
          <li key={item.href} className="overflow-hidden">
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block py-1.5 text-[clamp(28px,8vw,40px)] font-semibold tracking-tight transition-transform duration-700 ease-out-soft ${
                open ? "translate-y-0" : "translate-y-full"
              } ${isActive(item.href) ? "text-accent" : ""}`}
              style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex items-center gap-0.5">
      {NAV.map((item) => (
        <li key={item.href}>
          {"pill" in item ? (
            <Link
              href={item.href}
              className={`mr-1 inline-flex h-10 items-center rounded-full border px-3.5 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${
                isActive(item.href) ? "border-accent bg-accent text-on-accent" : "border-ink/15 hover:border-accent hover:text-accent"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <Link
              href={item.href}
              className={`relative px-2 py-2 text-[14px] font-medium whitespace-nowrap transition-colors hover:text-accent 2xl:px-3.5 ${
                isActive(item.href) ? "text-accent" : ""
              }`}
            >
              {item.label}
              <span
                className={`absolute inset-x-2.5 -bottom-0.5 h-px origin-left bg-current transition-transform duration-500 ${
                  isActive(item.href) ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

// usePathname dinamik sahifalarda kutadi — shuning uchun alohida, Suspense ichida
function ActiveNavList(props: Omit<ListProps, "pathname">) {
  return <NavList pathname={usePathname()} {...props} />;
}

export function Header({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        data-top={!scrolled && !open}
        className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-500 ${
          scrolled || open ? "bg-paper/85 backdrop-blur-xl shadow-[0_1px_0_var(--line)]" : "bg-transparent"
        }`}
      >
        <div className="container-x flex h-[76px] items-center justify-between gap-6">
          <Logo className="relative z-10" />

          <nav aria-label="Asosiy menyu" className="hidden xl:block">
            <Suspense fallback={<NavList pathname="" />}>
              <ActiveNavList />
            </Suspense>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <FavLink />
            {phone && (
              <a href={phoneHref} className="hidden text-[15px] font-semibold whitespace-nowrap tabular-nums transition-colors hover:text-accent md:block xl:hidden 2xl:block">
                {phone}
              </a>
            )}
            <RequestButton />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-line xl:hidden"
              aria-expanded={open}
              aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-500 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-500 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-paper transition-[opacity,visibility] duration-500 xl:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Mobil menyu" className="container-x flex h-full flex-col justify-between overflow-y-auto pt-24 pb-10">
          <Suspense fallback={<NavList pathname="" mobile open={open} onNavigate={close} />}>
            <ActiveNavList mobile open={open} onNavigate={close} />
          </Suspense>
          {phone && (
            <a href={phoneHref} className="btn btn-ink w-full justify-center">
              {phone}
            </a>
          )}
        </nav>
      </div>
    </>
  );
}

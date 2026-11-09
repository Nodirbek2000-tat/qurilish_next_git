"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const KEY = "arxan-theme";

/** <head> da bo'yashdan oldin ishlaydi — sahifa "miltillamaydi" */
export const THEME_SCRIPT = `try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion');if(sessionStorage.getItem('arxan-intro'))document.documentElement.dataset.intro='skip';else sessionStorage.setItem('arxan-intro','1')}catch(e){}`;

const listeners = new Set<() => void>();
const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {}
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "dark" ? "#0f1312" : "#f1ede6");
  listeners.forEach((l) => l());
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Kunduzgi rejim" : "Tungi rejim"}
      title={dark ? "Kunduzgi rejim" : "Tungi rejim"}
      className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-line transition-colors hover:border-ink ${className}`}
    >
      {/* Quyosh va oy almashadi */}
      <Sun size={18} strokeWidth={1.8} aria-hidden="true" className={`absolute transition-all duration-500 ${dark ? "translate-y-0 rotate-0 opacity-100" : "translate-y-6 rotate-90 opacity-0"}`} />
      <Moon size={18} strokeWidth={1.8} aria-hidden="true" className={`absolute transition-all duration-500 ${dark ? "-translate-y-6 -rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100"}`} />
    </button>
  );
}

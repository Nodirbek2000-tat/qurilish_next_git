"use client";

import { Heart as HeartIcon } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites";

export const Heart = ({ filled = false, size = 18 }: { filled?: boolean; size?: number }) => (
  <HeartIcon size={size} strokeWidth={1.7} fill={filled ? "currentColor" : "none"} aria-hidden="true" />
);

/** Xonadonni sevimlilarga qo'shish/olib tashlash */
export function FavButton({ id, className = "" }: { id: number; className?: string }) {
  const { has, toggle } = useFavorites();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={on}
      aria-label={on ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
      className={`grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 active:scale-90 ${
        on ? "border-accent bg-accent text-on-accent" : "border-line bg-card/80 hover:border-ink"
      } ${className}`}
    >
      <Heart filled={on} />
    </button>
  );
}

/** Sarlavhadagi yurakcha + son */
export function FavLink() {
  const { ids } = useFavorites();
  return (
    <Link href="/sevimlilar" aria-label={`Sevimlilar: ${ids.length}`} className="relative grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-ink">
      <Heart />
      {ids.length > 0 && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent tabular-nums">
          {ids.length}
        </span>
      )}
    </Link>
  );
}

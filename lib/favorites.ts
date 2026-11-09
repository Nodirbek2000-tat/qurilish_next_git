"use client";

import { useSyncExternalStore } from "react";

/** Sevimli xonadonlar — faqat shu brauzerda (localStorage), ro'yxatdan o'tishsiz. */
const KEY = "arxan-favorites";
const EMPTY: number[] = [];
let cache: number[] | null = null;
const listeners = new Set<() => void>();

function read(): number[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(raw) ? raw.filter((x) => Number.isInteger(x)).slice(0, 100) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: number[]) {
  cache = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // shaxsiy rejim — xotirada qoladi
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = (id: number) => write(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  return { ids, toggle, has: (id: number) => ids.includes(id) };
}

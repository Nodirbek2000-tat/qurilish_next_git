"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const m = matchMedia(QUERY);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

/** Foydalanuvchi animatsiyani kamaytirishni so'raganmi. Serverda — true (avtomatik aylanish yo'q). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => true);
}

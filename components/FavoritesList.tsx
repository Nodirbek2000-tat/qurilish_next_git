"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadFlatsByIds } from "@/app/actions";
import type { Flat } from "@/lib/api";
import { useFavorites } from "@/lib/favorites";
import { FlatCard } from "./FlatCard";
import { HouseLoader } from "./HouseLoader";
import { Arrow } from "./ui";

export function FavoritesList() {
  const { ids } = useFavorites();
  const [flats, setFlats] = useState<Flat[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    let alive = true;
    loadFlatsByIds(key ? key.split(",").map(Number) : []).then((items) => alive && setFlats(items));
    return () => {
      alive = false;
    };
  }, [key]);

  if (flats === null) return <HouseLoader className="h-64" />;

  const visible = flats.filter((f) => ids.includes(f.id));
  if (visible.length === 0) {
    return (
      <div className="rounded-[26px] border border-dashed border-line p-14 text-center">
        <p className="text-xl font-semibold">Hozircha bo&apos;sh</p>
        <p className="mt-2 text-muted">Xonadon kartasidagi yurakchani bosing — u shu yerda paydo bo&apos;ladi.</p>
        <Link href="/kvartiralar" className="btn btn-ink mt-8">Kvartira tanlash <Arrow /></Link>
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map((f, i) => <FlatCard key={f.id} flat={f} index={i} />)}
    </div>
  );
}

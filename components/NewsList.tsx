"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PostBrief } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { BuildingArt } from "./BuildingArt";
import { Arrow } from "./ui";

/** Yangiliklar ro'yxati: qator ustiga kelganda rasm kursor ortidan suzadi (faqat sichqonchali qurilmalarda). */
export function NewsList({ posts }: { posts: PostBrief[] }) {
  const box = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = preview.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    const r = gsap.quickTo(el, "rotate", { duration: 0.8, ease: "power3" });
    let lastX = 0;
    const move = (e: PointerEvent) => {
      const rect = box.current!.getBoundingClientRect();
      x(e.clientX - rect.left);
      y(e.clientY - rect.top);
      r(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    const area = box.current!;
    area.addEventListener("pointermove", move);
    return () => area.removeEventListener("pointermove", move);
  }, []);

  return (
    <div ref={box} className="relative" onPointerLeave={() => setActive(null)}>
      <ul>
        {posts.map((p, i) => (
          <li key={p.slug} data-reveal style={{ "--d": i } as React.CSSProperties}>
            <Link
              href={`/media/${p.slug}`}
              onPointerEnter={() => setActive(i)}
              className={`group grid grid-cols-[1fr_auto] items-center gap-4 border-t border-line py-6 transition-opacity duration-500 ${
                active !== null && active !== i ? "opacity-35" : ""
              }`}
            >
              <span>
                <span className="flex items-center gap-3 text-sm text-muted">
                  <span className="font-semibold text-accent">{p.kindLabel}</span>
                  <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                </span>
                <span className="mt-2 block text-xl leading-snug font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-2xl">
                  {p.title}
                </span>
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-full border border-line transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                <Arrow className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Kursor ortidan suzuvchi rasm */}
      <div
        ref={preview}
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-0 z-10 hidden h-48 w-72 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] shadow-2xl transition-[opacity,scale] duration-500 lg:block ${
          active === null ? "scale-75 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {posts.map((p, i) => (
          <div key={p.slug} className={`absolute inset-0 transition-opacity duration-500 ${active === i ? "opacity-100" : "opacity-0"}`}>
            {p.cover ? (
              <Image src={p.cover} alt="" fill sizes="288px" className="object-cover" />
            ) : (
              <BuildingArt seed={p.slug} color="#14231f" className="h-full w-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

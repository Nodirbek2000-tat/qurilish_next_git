"use client";

import { ChevronDown, MapPin, Navigation } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Counter } from "../Counter";
import { formatNumber } from "@/lib/format";
import { routeUrl } from "@/lib/ymaps";

type Props = {
  title: string; paragraphs: string[]; address: string; lat: number | null; lng: number | null;
  image: string | null; video: string | null; fallbackImage: string | null;
  stats: { value: number; label: string }[];
};

/** «Loyiha haqida»: matn (yig'ma), raqamlar, manzil va yo'l; o'ngda rasm yoki video. */
export function AboutSection({ title, paragraphs, address, lat, lng, image, video, fallbackImage, stats }: Props) {
  const [open, setOpen] = useState(false);
  const [first, ...rest] = paragraphs;
  const media = image ?? fallbackImage;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <p className="eyebrow" data-reveal>Loyiha haqida</p>
        <h2 className="h-display mt-4 text-[clamp(36px,4.6vw,64px)]" data-reveal>{title}</h2>
        {first && <p className="mt-8 text-lg leading-relaxed md:text-xl" data-reveal>{first}</p>}
        {rest.length > 0 && (
          <>
            <div className={`grid transition-[grid-template-rows] duration-700 ease-out-soft ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                {rest.map((p, i) => <p key={i} className="mt-5 text-lg leading-relaxed text-muted">{p}</p>)}
              </div>
            </div>
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-accent">
              {open ? "Yig'ish" : "Tavsifni kengaytirish"}
              <ChevronDown size={18} className={`transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
            </button>
          </>
        )}

        {stats.length > 0 && (
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6" data-reveal>
            {stats.map((s) => (
              <div key={s.label}>
                {/* Raqam bo'linmaydi; yakuniy qiymat joyni oldindan egallaydi — sanash paytida qo'shnilar siljimaydi */}
                <dd className="grid text-[clamp(30px,3.2vw,44px)] font-semibold tracking-tight whitespace-nowrap text-accent tabular-nums">
                  <span className="invisible col-start-1 row-start-1" aria-hidden>{formatNumber(s.value)}</span>
                  <span className="col-start-1 row-start-1"><Counter value={s.value} /></span>
                </dd>
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-sand p-5" data-reveal>
          <span className="flex items-center gap-3 font-medium"><MapPin size={19} className="text-accent" /> {address}</span>
          {lat && lng && (
            <a href={routeUrl(lat, lng)} target="_blank" rel="noopener noreferrer"
               className="group inline-flex items-center gap-2 text-sm font-semibold text-accent">
              Qanday yetib borish
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 group-hover:rotate-45">
                <Navigation size={15} />
              </span>
            </a>
          )}
        </div>
      </div>

      {(video || media) && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] bg-sand shadow-[0_50px_100px_-50px_rgb(0_0_0/0.5)]" data-reveal="curtain" data-parallax>
          {video ? (
            <video src={video} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Image src={media!} alt={title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          )}
        </div>
      )}
    </div>
  );
}

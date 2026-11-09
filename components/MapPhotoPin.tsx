"use client";

import "./map-pin.css";
import { useEffect, useRef, useState } from "react";

/**
 * Faqat zaxira holat: Yandex JS yuklanmasa, oddiy vidjet ustida markazdagi rasmli belgi.
 * Ko'rinishi JS xaritadagi belgi bilan bir xil (.ym-bubble). Xaritani surib boshlasa — yo'qoladi.
 */
export function MapPhotoPin({ photo, label }: { photo: string; label: string }) {
  const me = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const frame = me.current?.parentElement?.querySelector("iframe");
    const onBlur = () => setTimeout(() => { if (document.activeElement === frame) setHidden(true); }, 0);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  return (
    <div ref={me} aria-hidden
         className={`pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-full transition-opacity duration-500 ${hidden ? "opacity-0" : ""}`}>
      <div className="ym-bubble">
        <div className="ym-bubble-ph">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" />
          <b>{label}</b>
        </div>
        <i /><s />
      </div>
    </div>
  );
}

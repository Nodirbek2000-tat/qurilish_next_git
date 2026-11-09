"use client";

import { useId, useState } from "react";

/**
 * Kartalar serverda chiziladi; bu komponent faqat CSS orqali keraksizlarini yashiradi.
 * Bolalar `data-key` atributiga ega bo'lishi kerak.
 */
export function FilterTabs({
  tabs, children, className = "",
}: { tabs: { key: string; label: string; count: number }[]; children: React.ReactNode; className?: string }) {
  const [active, setActive] = useState("all");
  const id = "f" + useId().replace(/:/g, "");

  return (
    <>
      <div role="tablist" aria-label="Saralash" className="mb-12 flex flex-wrap gap-2" data-reveal>
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            disabled={t.count === 0}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-35 ${
              active === t.key ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
            }`}
          >
            {t.label} <sup className="ml-0.5 opacity-50 tabular-nums">{t.count}</sup>
          </button>
        ))}
      </div>
      {active !== "all" && <style>{`#${id} > [data-key]:not([data-key="${active}"]){display:none}`}</style>}
      <div id={id} className={className}>{children}</div>
    </>
  );
}

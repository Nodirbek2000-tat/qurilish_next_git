// Rejadagidek doim 2 xona kasr: 9,60 m²
const m2 = (n: number) => `${n.toFixed(2).replace(".", ",")} m²`;

/** Reja ostida: xonalar ro'yxati — raqamlar rejadagi doirachalar bilan bir xil tartibda */
export function FlatRooms({ parts, total }: { parts: { name: string; area: number }[]; total: number }) {
  const max = Math.max(...parts.map((p) => p.area));
  const sum = Math.round(parts.reduce((s, p) => s + p.area, 0) * 100) / 100;
  return (
    <div className="@container tilt-shadow rounded-[26px] border border-line bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Xonalar tarkibi</h2>
        <span className="text-xs text-muted">Raqamlar rejadagi bilan bir xil</span>
      </div>
      {/* Ikki ustun — kartochkaning o'zi yetarli keng bo'lsa (ekranga emas, joyiga qarab) */}
      <ol className="mt-5 grid gap-x-10 gap-y-4 @lg:grid-cols-2">
        {parts.map((p, i) => (
          <li key={i} data-reveal style={{ "--d": i % 2 } as React.CSSProperties}>
            <div className="flex items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper tabular-nums">{i + 1}</span>
              <span className="min-w-0 truncate font-medium">{p.name}</span>
              <span aria-hidden className="mb-1 min-w-4 flex-1 self-end border-b border-dotted border-line" />
              <span className="font-semibold whitespace-nowrap tabular-nums">{m2(p.area)}</span>
            </div>
            <div className="mt-2 ml-10 h-1 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.max(8, (p.area / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <span className="text-muted">Umumiy maydon</span>
        <span className="text-lg font-semibold tabular-nums">{m2(sum || total)}</span>
      </div>
    </div>
  );
}

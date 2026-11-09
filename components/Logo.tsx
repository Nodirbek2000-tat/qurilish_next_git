import Link from "next/link";

/** ARXAN belgisi: o'rtaga qarab ko'tariladigan 5 ta bino — "A" harfi, kesib o'tgan chiziq — A ning ko'ndalangi. */
export function LogoMark({ size = 30, className = "" }: { size?: number; className?: string }) {
  const bars = [
    { x: 2, h: 10 },
    { x: 8, h: 17 },
    { x: 14, h: 26 },
    { x: 20, h: 17 },
    { x: 26, h: 10 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <mask id="arxan-cut">
        <rect width="32" height="32" fill="#fff" />
        <rect y="21.5" width="32" height="2" fill="#000" />
      </mask>
      <g fill="currentColor" mask="url(#arxan-cut)">
        {bars.map((b) => (
          <rect key={b.x} className="logo-bar" x={b.x} y={30 - b.h} width="4" height={b.h} />
        ))}
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Arxan — bosh sahifa" className={`logo inline-flex items-end gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-[19px] leading-none font-bold tracking-[0.34em] -mr-[0.34em] translate-y-[-1px]">ARXAN</span>
    </Link>
  );
}

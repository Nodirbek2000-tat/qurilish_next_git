/** Yuklanish: qavatlar birin-ketin tushadi, derazalar yonadi, tom yopiladi, kran tebranadi. Sof CSS + SVG. */
export function HouseSvg({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.87} viewBox="0 0 120 104" className="house-loader overflow-visible" aria-hidden="true">
      {/* kran */}
      <g stroke="currentColor" strokeOpacity=".5" fill="none" strokeWidth="1.4">
        <path d="M100 100V14M96 100V14M96 22l4 8M100 30l-4 8M96 38l4 8M100 46l-4 8M96 54l4 8M100 62l-4 8M96 70l4 8M100 78l-4 8" />
        <g className="crane-jib" style={{ transformOrigin: "98px 14px" }}>
          <path d="M60 14h56M98 7l-38 7M98 7l18 7M112 14v6" />
          <rect x="110" y="20" width="6" height="6" fill="currentColor" fillOpacity=".5" stroke="none" />
          <path d="M70 14v14" strokeDasharray="2 2" />
          <rect x="66" y="28" width="8" height="5" fill="var(--accent)" stroke="none" />
        </g>
      </g>
      {/* qavatlar (pastdan yuqoriga) */}
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} className="floor">
            <rect x="14" y={84 - i * 16} width="64" height="14" rx="2" fill="var(--accent)" fillOpacity={0.15 + i * 0.1} stroke="var(--accent)" strokeWidth="1.5" />
            {[0, 1, 2].map((w) => (
              <rect key={w} className="win" x={24 + w * 18} y={88 - i * 16} width="8" height="6" rx="1" fill="#ffd59a" />
            ))}
          </g>
        ))}
        <path className="roof" d="M8 36 L46 16 L84 36 Z" fill="currentColor" fillOpacity=".9" />
      </g>
      <path d="M0 99h120" stroke="currentColor" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HouseLoader({ label = "Yuklanmoqda", className = "", size = 150 }: { label?: string; className?: string; size?: number }) {
  return (
    <div role="status" aria-live="polite" className={`loader-in flex flex-col items-center justify-center gap-6 text-ink ${className}`}>
      <HouseSvg size={size} />
      <p className="eyebrow !text-ink/70">{label}<span className="dots" /></p>
    </div>
  );
}

export function PageLoader() {
  return <HouseLoader className="min-h-[80vh] pt-24" label="Qurilmoqda" size={180} />;
}

/** Birinchi kirishda (sessiyada bir marta) — to'liq ekranli intro. Sof CSS, o'zi yo'qoladi. */
export function Intro() {
  return (
    <div className="intro fixed inset-0 z-[100] flex flex-col items-center justify-center bg-night text-white" aria-hidden="true">
      <HouseSvg size={260} />
      <p className="intro-word mt-10 text-[28px] font-bold tracking-[0.5em] -mr-[0.5em]">ARXAN</p>
      <p className="intro-sub mt-3 text-xs tracking-[0.3em] text-white/50 uppercase">Yashash uchun qurilgan makon</p>
      <span className="intro-bar mt-8 block h-px w-40 origin-left bg-accent" />
    </div>
  );
}

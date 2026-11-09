/** Rasm yuklanmagan loyiha uchun: loyiha rangidagi chizma uslubidagi muqova (SVG, 0 KB rasm). */
function makeTowers(seed: string) {
  let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 5 }, (_, i) => {
    const w = 46 + rnd() * 30;
    const h = 90 + rnd() * 150 + (i === 2 ? 50 : 0);
    return { x: 30 + i * 72 + rnd() * 10, w, h };
  });
}

export function BuildingArt({ seed, color, className = "" }: { seed: string; color: string; className?: string }) {
  const towers = makeTowers(seed);

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="">
      <rect width="400" height="300" fill={color} />
      <rect width="400" height="300" fill={`url(#art-${seed})`} />
      <defs>
        <linearGradient id={`art-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".14" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <g stroke="#fff" fill="none" strokeOpacity=".5">
        {towers.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={262 - t.h} width={t.w} height={t.h} fill="#fff" fillOpacity={i === 2 ? 0.14 : 0.05} />
            {Array.from({ length: Math.floor(t.h / 14) - 1 }, (_, f) => (
              <line key={f} x1={t.x} x2={t.x + t.w} y1={262 - (f + 1) * 14} y2={262 - (f + 1) * 14} strokeOpacity=".2" />
            ))}
            <line x1={t.x + t.w / 2} x2={t.x + t.w / 2} y1={262 - t.h} y2={262} strokeOpacity=".15" />
          </g>
        ))}
        <line x1="0" x2="400" y1="262" y2="262" strokeOpacity=".7" />
      </g>
    </svg>
  );
}

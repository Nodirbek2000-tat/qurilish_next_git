/** Reja rasmi yuklanmagan xonadon uchun sxematik reja (SVG). Xona maydonlari umumiy maydonga mutanosib. */

type Room = [x: number, y: number, w: number, h: number, label: string];

const LAYOUTS: Record<number, Room[]> = {
  1: [[0, 0, 0.6, 1, "Yashash xonasi"], [0.6, 0, 0.4, 0.5, "Oshxona"], [0.6, 0.5, 0.2, 0.5, "Hammom"], [0.8, 0.5, 0.2, 0.5, "Dahliz"]],
  2: [[0, 0, 0.5, 0.55, "Mehmonxona"], [0, 0.55, 0.5, 0.45, "Yotoqxona"], [0.5, 0, 0.5, 0.45, "Oshxona"],
      [0.5, 0.45, 0.22, 0.3, "Hammom"], [0.5, 0.75, 0.22, 0.25, "Hojatxona"], [0.72, 0.45, 0.28, 0.55, "Dahliz"]],
  3: [[0, 0, 0.42, 0.55, "Mehmonxona"], [0, 0.55, 0.42, 0.45, "Yotoqxona"], [0.42, 0, 0.3, 0.5, "Bolalar xonasi"],
      [0.72, 0, 0.28, 0.5, "Oshxona"], [0.42, 0.5, 0.36, 0.5, "Dahliz"], [0.78, 0.5, 0.22, 0.5, "Hammom"]],
  4: [[0, 0, 0.4, 0.5, "Mehmonxona"], [0.4, 0, 0.3, 0.5, "Oshxona"], [0.7, 0, 0.3, 0.25, "Hammom"], [0.7, 0.25, 0.3, 0.25, "Dahliz"],
      [0, 0.5, 0.3, 0.5, "Yotoqxona"], [0.3, 0.5, 0.3, 0.5, "Bolalar xonasi"], [0.6, 0.5, 0.4, 0.5, "Kabinet"]],
};

export function FlatPlan({ rooms, area, kind, className = "" }: { rooms: number; area: number; kind: string; className?: string }) {
  const layout: Room[] = kind === "tijorat" ? [[0, 0, 1, 1, "Ochiq maydon"]] : LAYOUTS[Math.min(Math.max(rooms, 1), 4)];
  const X = 30, Y = 24, W = 340, H = 220;

  return (
    <svg viewBox="0 0 400 290" className={className} role="img" aria-label={`Sxematik reja: ${area} m²`}>
      {/* balkon */}
      <rect x={X} y={Y + H} width={W * 0.45} height={26} fill="none" stroke="currentColor" strokeOpacity=".35" strokeDasharray="4 4" />
      <text x={X + 10} y={Y + H + 17} fontSize="10" fill="currentColor" opacity=".45">Balkon</text>
      {layout.map(([x, y, w, h, label], i) => {
        const rx = X + x * W, ry = Y + y * H, rw = w * W, rh = h * H;
        const m2 = (area * 0.92 * w * h).toFixed(1).replace(".", ",");
        return (
          <g key={i}>
            <rect x={rx} y={ry} width={rw} height={rh} fill={i === 0 ? "var(--accent)" : "currentColor"} fillOpacity={i === 0 ? 0.1 : 0.025}
                  stroke="currentColor" strokeWidth="2.5" />
            {rw > 60 && rh > 34 && (
              <>
                <text x={rx + rw / 2} y={ry + rh / 2 - 3} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">{label}</text>
                <text x={rx + rw / 2} y={ry + rh / 2 + 12} textAnchor="middle" fontSize="10" fill="currentColor" opacity=".55">{m2} m²</text>
              </>
            )}
          </g>
        );
      })}
      <rect x={X} y={Y} width={W} height={H} fill="none" stroke="currentColor" strokeWidth="6" />
      {/* kirish eshigi */}
      <rect x={X + W - 26} y={Y + H - 3} width="18" height="6" fill="var(--paper)" />
    </svg>
  );
}

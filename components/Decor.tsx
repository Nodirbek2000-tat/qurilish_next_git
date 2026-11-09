/**
 * Bo'limlar uchun fon bezaklari: Samarqand girih naqshi, to'lqin chiziqlar, ravoqlar va fasad krokisi.
 * Rang currentColor dan olinadi, xiraligi esa ota sinfida beriladi (masalan text-white/[0.06]),
 * shuning uchun yorug' va qorong'i rejimga o'zi moslashadi. Rasm fayl yo'q — faqat SVG.
 */

const FLOORS = Array.from({ length: 12 }, (_, i) => 400 - 24 * (i + 1)); // 12 qavat, har biri 24 birlik
const COLS_A = [84, 118, 152, 186, 220];
const COLS_C = [476, 506, 536];

/** 12 qavatli turar-joy binosining fasad chizmasi, yonida minorali kran va balandlik belgilari */
export function FacadeSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 420" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"
         className={`pointer-events-none select-none ${className}`}>
      {/* yer chizig'i va shtrixlash */}
      <path d="M0 400H640" strokeWidth="1.4" />
      <path d={Array.from({ length: 54 }, (_, i) => `M${i * 12 + 6} 400l-8 10`).join("")} opacity=".5" />

      {/* A bino — oldingi, 12 qavat */}
      <path d="M70 400V110H250V400M64 110V102H256V110" />
      {FLOORS.map((y) => <path key={y} d={`M70 ${y}H250`} opacity=".55" />)}
      {FLOORS.map((y, f) => COLS_A.map((x, c) => (
        <g key={`${x}-${y}`}>
          {/* ba'zi derazalar «yonib turadi» — chizmaga jon kiradi */}
          <rect x={x} y={y + 6} width="16" height="12" opacity=".8"
                fill={(f * 3 + c * 7) % 5 === 0 ? "currentColor" : "none"} fillOpacity=".35" />
          {c % 2 === 1 && <path d={`M${x - 4} ${y + 21}H${x + 20}`} />}
        </g>
      )))}
      <path d="M150 400v-18h20v18" />

      {/* B bino — orqadagi, baland, uzuq chiziqlar bilan */}
      <path d="M280 400V64H430V400" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M280 ${400 - 24 * (i + 1)}H430`} strokeDasharray="2 5" opacity=".6" />)}
      {[310, 340, 370, 400].map((x) => <path key={x} d={`M${x} 64V400`} strokeDasharray="1 6" opacity=".5" />)}

      {/* C bino — past, o'ng tomonda */}
      <path d="M460 400V232H570V400M456 232v-6h118v6" />
      {[0, 1, 2, 3, 4, 5].map((k) => COLS_C.map((x, c) => (
        <rect key={`${x}-${k}`} x={x} y={244 + k * 26} width="14" height="12" opacity=".75"
              fill={(k + c * 2) % 4 === 1 ? "currentColor" : "none"} fillOpacity=".35" />
      )))}

      {/* minorali kran */}
      <path d="M600 400V24M612 400V24" />
      <path d={Array.from({ length: 16 }, (_, i) => `M600 ${400 - i * 24}L612 ${388 - i * 24}`).join("")} opacity=".6" />
      <path d="M440 24H640M460 36H640M600 24L612 8L624 24M470 36V24M500 36V24M530 36V24M560 36V24" />
      <path d="M492 36V150M486 150h12l-6 9z" opacity=".8" />

      {/* balandlik belgilari (bo'lim chizmasidagidek) */}
      <path d="M40 110V400M34 110h12M34 400h12M34 254h12" opacity=".7" />
      <g fill="currentColor" stroke="none" fontSize="9" fontFamily="ui-monospace, monospace" opacity=".9">
        <text x="6" y="104">+38.400</text>
        <text x="6" y="250">+19.200</text>
        <text x="6" y="396">±0.000</text>
      </g>

      {/* daraxtlar */}
      <circle cx="268" cy="372" r="12" opacity=".6" /><path d="M268 384v16" opacity=".6" />
      <circle cx="446" cy="378" r="9" opacity=".6" /><path d="M446 387v13" opacity=".6" />
    </svg>
  );
}


// ---------- Girih: Samarqand koshinlaridagi 8 qirrali yulduz (xotam) panjarasi ----------

const T = 96; // bitta katak
const C = T / 2;
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
};
const R = 44; // yulduz uchlari
// Xotam: bir-birining ustiga 45° burib qo'yilgan ikki kvadrat
const SQUARES = [0, 45].map((rot) => "M" + [0, 90, 180, 270].map((a) => pt(R, a - 90 + rot)).join("L") + "Z").join("");
// Markazdagi o'tkir uchli kichik yulduz (rozetka)
const ROSETTE = "M" + Array.from({ length: 16 }, (_, k) => pt(k % 2 ? 7 : 17, -90 + k * 22.5)).join("L") + "Z";
// Kvadratlar kesishgan sakkizburchak uchlaridan rozetka uchlariga nurlar
const RAYS = Array.from({ length: 8 }, (_, k) => `M${pt(17, -90 + k * 45)}L${pt(R * Math.SQRT1_2, -90 + k * 45)}`).join("");
// yulduz uchidan qo'shni katakka: o'qlar bo'ylab — chetgacha, diagonal bo'ylab — burchakdagi rombgacha
const LINKS = `M${C} ${C - R}V0M${C} ${C + R}V${T}M${C - R} ${C}H0M${C + R} ${C}H${T}` +
  [[1, -1], [1, 1], [-1, 1], [-1, -1]].map(([sx, sy]) => {
    const d = R * Math.SQRT1_2, t = (T - 10) / 2; // |x−T|+|y| = 10 → burchakdagi romb qirrasi
    return `M${(C + sx * d).toFixed(2)} ${(C + sy * d).toFixed(2)}L${(C + sx * t).toFixed(2)} ${(C + sy * t).toFixed(2)}`;
  }).join("");
const DIAMONDS = [[0, 0], [T, 0], [0, T], [T, T]].map(([x, y]) => `M${x} ${y - 10}L${x + 10} ${y}L${x} ${y + 10}L${x - 10} ${y}Z`).join("");

/** Girih naqshi bilan to'ldirilgan qatlam. `id` sahifada noyob bo'lsin; `scale` — naqsh kattaligi. */
export function GirihPattern({ id, scale = 1, className = "" }: { id: string; scale?: number; className?: string }) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none absolute select-none ${className}`}>
      <defs>
        <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <g fill="none" stroke="currentColor" strokeWidth={1 / scale} strokeLinejoin="round">
            <path d={SQUARES} />
            <path d={ROSETTE} opacity=".85" />
            <path d={RAYS} opacity=".6" />
            <path d={LINKS} />
            <path d={DIAMONDS} opacity=".9" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ---------- To'lqin chiziqlar: marmar tomirlaridek ravon oqim ----------

const WAVES = Array.from({ length: 12 }, (_, i) => {
  const y = 20 + i * 44, a = 26 + (i % 3) * 12, s = (i * 53) % 140;
  return `M-120 ${y}C${160 + s} ${y - a} ${380 + s / 2} ${y + a * 1.3} ${640} ${y + 6}S${1000 - s} ${y - a * 0.9} ${1320} ${y + a * 0.5}`;
});

export function WaveLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" aria-hidden="true"
         className={`pointer-events-none absolute select-none ${className}`}>
      {WAVES.map((d, i) => (
        <path key={i} d={d} strokeWidth={i % 4 === 0 ? 1.6 : 1} opacity={i % 2 ? 0.6 : 1} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// ---------- Ravoqlar tasmasi: Registon peshtoqlaridagi uchli ravoqlar ketma-ketligi ----------

export function ArchBand({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none absolute select-none ${className}`}>
      <defs>
        <pattern id={id} width="64" height="100" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 100V50Q6 22 32 6Q58 22 58 50V100" />
            <path d="M14 100V52Q14 30 32 17Q50 30 50 52V100" opacity=".7" />
            <path d="M0 50H6M58 50H64" />
            <path d="M32 58l6 6-6 6-6-6z" opacity=".8" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

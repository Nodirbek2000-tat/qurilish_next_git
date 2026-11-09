"use client";

import { useEffect, useRef } from "react";

/**
 * Yengil 3D "kechki shahar": kutubxonasiz, canvas 2D.
 * Minorali kran yukni yerdan olib, qurilayotgan binoning tepasiga qo'yadi — bino qavatma-qavat o'sadi,
 * qurilgan qavatlarda derazalar yonadi. Ekrandan chiqsa / tab yashirilsa to'xtaydi; reduced-motion da statik.
 * Har doim to'q fonda ishlaydi (hero paneli).
 */

type Box = { x: number; z: number; w: number; d: number; h: number; hero?: boolean; seed: number };
type V = [number, number];

const FLOOR = 0.32;
const HERO_FLOORS = 15;
const START_FLOORS = 5;
const CYCLE = 5.2; // bir qavat uchun kran sikli, soniya
const LINE = "#efe8dc";

function makeCity(): Box[] {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const boxes: Box[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const hero = i === 2 && j === 2;
      const dist = Math.hypot(i - 2, j - 2);
      if (!hero && (rnd() < 0.22 || (i === 3 && j === 1))) continue; // kran uchun joy
      boxes.push({
        x: (i - 2) * 1.7, z: (j - 2) * 1.7,
        w: hero ? 1.1 : 0.85 + rnd() * 0.3, d: hero ? 1.1 : 0.85 + rnd() * 0.3,
        h: hero ? HERO_FLOORS * FLOOR : Math.max(0.6, (3.2 - dist * 0.8) * (0.55 + rnd() * 0.65)),
        hero, seed: Math.floor(rnd() * 1e6),
      });
    }
  }
  return boxes;
}

const smooth = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lit = (seed: number, i: number) => ((seed * 9301 + i * 49297) % 233280) / 233280;

export function Hero3D({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const city = makeCity();
    const hero = city.find((b) => b.hero)!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const accent = () => getComputedStyle(canvas).getPropertyValue("--accent").trim() || "#c0673f";

    // Kran: binoning orqa burchagida
    const crane = { x: hero.x + 1.25, z: hero.z - 1.15, top: HERO_FLOORS * FLOOR + 1.3 };
    const toPolar = (x: number, z: number) => ({ a: Math.atan2(z - crane.z, x - crane.x), r: Math.hypot(x - crane.x, z - crane.z) });
    const drop = toPolar(hero.x, hero.z);
    const pick = { a: drop.a + 2.1, r: 2.2 };
    const pallet = { x: crane.x + Math.cos(pick.a) * pick.r, z: crane.z + Math.sin(pick.a) * pick.r };

    let w = 0, h = 0, dpr = 1;
    let running = false, raf = 0, visible = true;
    const t0 = performance.now();
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (!running) draw(reduce ? 1e6 : performance.now() - t0);
    };

    function draw(ms: number) {
      const t = ms / 1000;
      const ACC = accent();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      mouse.sx += (mouse.x - mouse.sx) * 0.05;
      mouse.sy += (mouse.y - mouse.sy) * 0.05;
      const yaw = -0.62 + (reduce ? 0 : Math.sin(t * 0.05) * 0.25) + mouse.sx * 0.3;
      const pitch = 0.5 + mouse.sy * 0.07;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = Math.min(w * 1.15, h * 1.3);
      const D = 13, ox = w * 0.5, oy = h * 0.7;

      const P = (x: number, y: number, z: number): V => {
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = (y - 1.7) * cp - z1 * sp, z2 = (y - 1.7) * sp + z1 * cp;
        const k = scale / (z2 + D);
        return [ox + x1 * k, oy - y2 * k];
      };
      const seg = (a: V, b: V) => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); };
      const stroke = (color: string, alpha: number, width = 1) => {
        ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.stroke();
      };
      const boxEdges = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
        const b = [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)];
        const u = [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
        for (let i = 0; i < 4; i++) { seg(b[i], b[(i + 1) % 4]); seg(u[i], u[(i + 1) % 4]); seg(b[i], u[i]); }
        return u;
      };
      const windows = (b: Box, H: number, alpha: number) => {
        const floors = Math.floor(H / FLOOR);
        ctx.fillStyle = "#ffd59a";
        for (let f = 0; f < floors; f++) {
          for (let k = 0; k < 3; k++) {
            const id = f * 7 + k;
            const flicker = reduce ? 0 : Math.sin(t * 0.3 + id) * 0.08;
            if (lit(b.seed, id) + flicker < 0.55) continue;
            const y = (f + 0.5) * FLOOR;
            const fx = b.x - b.w / 2 + (k + 0.5) * (b.w / 3);
            const fz = b.z - b.d / 2 + (k + 0.5) * (b.d / 3);
            for (const p of [P(fx, y, b.z - b.d / 2), P(b.x - b.w / 2, y, fz)]) {
              ctx.globalAlpha = alpha * (0.5 + lit(b.seed, id + 3) * 0.5);
              ctx.fillRect(p[0] - 1.6, p[1] - 1.2, 3.2, 2.4);
            }
          }
        }
      };

      // ---- Yer to'ri ----
      ctx.beginPath();
      for (let g = -5; g <= 5; g++) { seg(P(g, 0, -5), P(g, 0, 5)); seg(P(-5, 0, g), P(5, 0, g)); }
      stroke(LINE, 0.06);

      // ---- Qurilish holati ----
      const intro = reduce ? 1 : 1 - Math.pow(1 - Math.min(1, t / 2.4), 3);
      const k = reduce ? HERO_FLOORS : Math.floor(Math.max(0, t - 2.4) / CYCLE);
      const phase = reduce ? 0 : (Math.max(0, t - 2.4) % CYCLE) / CYCLE;
      const done = reduce || START_FLOORS + k >= HERO_FLOORS;
      const placed = phase > 0.74 ? 1 : 0;
      const built = Math.min(HERO_FLOORS, START_FLOORS + k + (done ? 0 : placed));
      const heroH = built * FLOOR * (reduce ? 1 : Math.min(1, t / 1.6));

      // ---- Binolar ----
      for (const b of city) {
        if (b.hero) continue;
        const H = b.h * intro;
        ctx.beginPath();
        boxEdges(b.x - b.w / 2, b.x + b.w / 2, 0, H, b.z - b.d / 2, b.z + b.d / 2);
        stroke(LINE, 0.22);
        windows(b, H, 0.55 * intro);
      }

      // Qurilayotgan bino: tayyor qavatlar + armatura (keyingi qavat karkasi)
      {
        const b = hero, x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
        ctx.beginPath();
        const top = boxEdges(x0, x1, 0, heroH, z0, z1);
        stroke(ACC, 0.95, 1.5);
        ctx.beginPath();
        ctx.moveTo(...top[0]); top.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath();
        ctx.fillStyle = ACC; ctx.globalAlpha = 0.18; ctx.fill();
        ctx.beginPath();
        for (let y = FLOOR; y < heroH - 0.01; y += FLOOR) {
          const f = [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)];
          for (let i = 0; i < 4; i++) seg(f[i], f[(i + 1) % 4]);
        }
        stroke(ACC, 0.35);
        windows(b, heroH, 0.9);
        if (!done) {
          // keyingi qavat ustunlari — punktir
          ctx.beginPath();
          ctx.setLineDash([3, 4]);
          for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) seg(P(x, heroH, z), P(x, heroH + FLOOR, z));
          stroke(ACC, 0.6);
          ctx.setLineDash([]);
        }
      }

      // ---- Yuk to'plami (yerda) ----
      ctx.beginPath();
      for (let i = 0; i < 2; i++) boxEdges(pallet.x - 0.3, pallet.x + 0.3, i * 0.12, (i + 1) * 0.12, pallet.z - 0.2, pallet.z + 0.2);
      stroke(LINE, 0.4);

      // ---- Minorali kran ----
      // Sikl: 0–.14 ilgak tushadi, .14–.3 yuk ko'tariladi, .3–.6 burilish, .6–.74 yuk tushiriladi, .74–1 qaytish
      let ang: number, rad: number, hookY: number, carrying: boolean;
      const high = crane.top - 0.55;
      const topY = heroH + FLOOR * 0.6;
      if (done) {
        ang = drop.a + 0.6 + Math.sin(t * 0.25) * 0.5; rad = 1.6; hookY = high - 0.3; carrying = false;
      } else if (phase < 0.3) {
        ang = pick.a; rad = pick.r;
        hookY = phase < 0.14 ? lerp(high, 0.35, smooth(0, 0.14, phase)) : lerp(0.35, high, smooth(0.14, 0.3, phase));
        carrying = phase >= 0.14;
      } else if (phase < 0.74) {
        const turn = smooth(0.3, 0.6, phase);
        ang = lerp(pick.a, drop.a, turn); rad = lerp(pick.r, drop.r, turn);
        hookY = phase < 0.6 ? high : lerp(high, topY, smooth(0.6, 0.74, phase));
        carrying = true;
      } else {
        const back = smooth(0.8, 1, phase);
        ang = lerp(drop.a, pick.a, back); rad = lerp(drop.r, pick.r, back);
        hookY = lerp(topY, high, smooth(0.74, 0.86, phase)); carrying = false;
      }

      const ca = Math.cos(ang), sa = Math.sin(ang);
      const along = (r: number, y: number): V => P(crane.x + ca * r, y, crane.z + sa * r);
      const m = 0.13; // minora yarim kengligi
      ctx.beginPath();
      // minora: 4 ustun + panjara (zigzag)
      const corners: [number, number][] = [[-m, -m], [m, -m], [m, m], [-m, m]];
      for (const [dx, dz] of corners) seg(P(crane.x + dx, 0, crane.z + dz), P(crane.x + dx, crane.top, crane.z + dz));
      for (let y = 0, i = 0; y < crane.top - 0.2; y += 0.26, i++) {
        const [a, b] = i % 2 ? [corners[0], corners[1]] : [corners[1], corners[0]];
        seg(P(crane.x + a[0], y, crane.z + a[1]), P(crane.x + b[0], y + 0.26, crane.z + b[1]));
        const [c, d] = i % 2 ? [corners[3], corners[0]] : [corners[0], corners[3]];
        seg(P(crane.x + c[0], y, crane.z + c[1]), P(crane.x + d[0], y + 0.26, crane.z + d[1]));
      }
      // strela (old) va qarshi strela (orqa) — pastki va yuqori belbog' + diagonallar
      const jib = 3.0, counter = 1.1, chord = 0.16;
      seg(along(-counter, crane.top), along(jib, crane.top));
      seg(along(-counter, crane.top + chord), along(jib * 0.95, crane.top + chord));
      for (let r = -counter, i = 0; r < jib - 0.2; r += 0.22, i++) {
        seg(along(r, crane.top + (i % 2 ? chord : 0)), along(r + 0.22, crane.top + (i % 2 ? 0 : chord)));
      }
      // kalla va trosslar
      const apex = along(0, crane.top + 0.75);
      seg(along(0, crane.top), apex);
      seg(apex, along(jib * 0.7, crane.top + chord));
      seg(apex, along(-counter, crane.top + chord));
      stroke(LINE, 0.6);

      // qarshi yuk va kabina
      ctx.beginPath();
      boxEdges(crane.x + ca * -counter - 0.16, crane.x + ca * -counter + 0.16, crane.top - 0.3, crane.top, crane.z + sa * -counter - 0.16, crane.z + sa * -counter + 0.16);
      stroke(LINE, 0.75);
      const cab = along(0.32, crane.top - 0.12);
      ctx.globalAlpha = 0.9; ctx.fillStyle = "#ffd59a"; ctx.fillRect(cab[0] - 3, cab[1] - 3, 6, 5);

      // trolley, tross, ilgak
      const trolley = along(rad, crane.top);
      const hook = along(rad, hookY);
      ctx.beginPath();
      seg([trolley[0] - 2, trolley[1]], [hook[0] - 1, hook[1]]);
      seg([trolley[0] + 2, trolley[1]], [hook[0] + 1, hook[1]]);
      stroke(LINE, 0.55);
      ctx.globalAlpha = 1; ctx.fillStyle = LINE; ctx.fillRect(trolley[0] - 4, trolley[1] - 2, 8, 4);
      ctx.fillStyle = ACC; ctx.fillRect(hook[0] - 3, hook[1], 6, 4);

      if (carrying) {
        // ko'tarilayotgan devor paneli (tebranadi)
        const swing = reduce ? 0 : Math.sin(t * 2.2) * 0.04;
        const lx = crane.x + ca * rad + swing, lz = crane.z + sa * rad;
        ctx.beginPath();
        boxEdges(lx - 0.3, lx + 0.3, hookY - 0.3, hookY - 0.12, lz - 0.2, lz + 0.2);
        stroke(ACC, 0.95, 1.3);
        const hk = P(lx, hookY, lz);
        ctx.beginPath();
        seg(hk, P(lx - 0.3, hookY - 0.12, lz - 0.2));
        seg(hk, P(lx + 0.3, hookY - 0.12, lz + 0.2));
        stroke(LINE, 0.4);
      }

      // signal chirog'i kran tepasida
      if (!reduce && Math.sin(t * 3) > 0.2) {
        const [bx, by] = apex;
        ctx.globalAlpha = 0.95; ctx.fillStyle = "#ff5a3c";
        ctx.beginPath(); ctx.arc(bx, by - 2, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const loop = (now: number) => { draw(now - t0); raf = requestAnimationFrame(loop); };
    const start = () => {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const onPointer = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onVis = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); });
    io.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    resize();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-label="Qurilayotgan bino va minorali kran animatsiyasi" role="img" className={`block h-full w-full ${className}`} />;
}

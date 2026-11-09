"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Bosh sahifa animatsiyalari (GSAP). Markup serverda — bu komponent faqat [data-*] belgilarini jonlantiradi.
 * prefers-reduced-motion da hech narsa qilmaydi. Sahifadan chiqilganda hammasi tozalanadi (useGSAP).
 */
export function HomeMotion() {
  useGSAP(() => {
    const root = document.documentElement;
    const show = (els: gsap.TweenTarget) => gsap.set(els, { visibility: "visible" });
    // Niqob "g", "y" kabi harflarning pastini kesmasin
    const pad = (masks: Element[]) => gsap.set(masks, { paddingBottom: "0.14em", marginBottom: "-0.14em" });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show("[data-hero-hide]");
      return;
    }
    const delay = root.dataset.intro === "skip" ? 0.15 : 2.85; // intro tugashini kutamiz

    // ---------- HERO ----------
    const title = document.querySelector<HTMLElement>("[data-hero-title]");
    if (title) {
      show(title);
      const split = SplitText.create(title, { type: "lines,chars", mask: "lines" });
      pad(split.masks);
      gsap.from(split.chars, { yPercent: 115, rotate: 8, duration: 1.1, ease: "expo.out", stagger: 0.022, delay });
    }
    gsap.fromTo("[data-hero-fade]", { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: delay + 0.45 });
    gsap.fromTo("[data-hero-scene]", { autoAlpha: 0, scale: 0.92, filter: "blur(10px)" },
      { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.6, ease: "power3.out", delay: delay + 0.2 });

    // Hero paneli scroll bilan chuqurlashadi
    const panel = document.querySelector("[data-hero-panel]");
    if (panel) {
      gsap.to(panel, {
        scale: 0.94, borderRadius: 64, ease: "none",
        scrollTrigger: { trigger: panel, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-copy]", {
        yPercent: -18, autoAlpha: 0.2, ease: "none",
        scrollTrigger: { trigger: panel, start: "top top", end: "bottom top", scrub: true },
      });
    }

    // ---------- Bo'lim sarlavhalari: qatorlar niqob ostidan ----------
    gsap.utils.toArray<HTMLElement>("main h2[data-split]").forEach((h) => {
      h.removeAttribute("data-reveal"); // CSS animatsiyasi bilan to'qnashmasin
      const split = SplitText.create(h, { type: "lines", mask: "lines" });
      pad(split.masks);
      gsap.from(split.lines, {
        yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: h, start: "top 88%", once: true },
      });
    });

    // ---------- Rasmlar ichida parallaks ----------
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((box) => {
      const media = box.querySelector("img, svg");
      if (!media) return;
      gsap.set(media, { scale: 1.16 });
      gsap.fromTo(media, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // ---------- Magnit tugmalar ----------
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
        const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
        const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          x((e.clientX - r.left - r.width / 2) * 0.3);
          y((e.clientY - r.top - r.height / 2) * 0.35);
        });
        el.addEventListener("pointerleave", () => { x(0); y(0); });
      });
    }

    // Shriftlar yuklangach o'lchamlar o'zgaradi
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });

  return null;
}

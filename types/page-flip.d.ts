// page-flip 2.0.7 o'z tiplarini paketga qo'shmagan — Flipbook ishlatadigan qismi uchun qisqa ta'rif.
declare module "page-flip" {
  export type FlipSetting = {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startPage?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    swipeDistance?: number;
  };

  export type Orientation = "portrait" | "landscape";

  export class PageFlip {
    constructor(element: HTMLElement, setting: FlipSetting);
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    on(event: "flip", callback: (e: { data: number }) => void): PageFlip;
    on(event: "changeOrientation", callback: (e: { data: Orientation }) => void): PageFlip;
    on(event: "init" | "update", callback: (e: { data: { page: number; mode: Orientation } }) => void): PageFlip;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    flip(page: number, corner?: "top" | "bottom"): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): Orientation;
    update(): void;
    destroy(): void;
  }
}

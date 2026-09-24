"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { ambient } from "@/lib/ambient";
import { useUI } from "@/lib/store";
import { roomFromPath, type Room } from "@/content/rooms";
import { getProduct, products } from "@/content/products";
import { useReducedMotion } from "@/hooks";
import { useScroll } from "@/components/providers/SmoothScroll";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { MaterialTexture } from "@/components/media/MaterialTexture";
import { Plate } from "@/components/media/Plate";
import { resolveVariant, type TransitionVariant } from "./variants";

type NavigateOpts = { variant?: TransitionVariant; origin?: { x: number; y: number } };

type TransitionApi = {
  navigate: (href: string, opts?: NavigateOpts) => void;
  busy: boolean;
};

const TransitionContext = createContext<TransitionApi>({ navigate: () => {}, busy: false });
export const useTransition = () => useContext(TransitionContext);

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The page-transition system. A click closes the current room (cover),
 * the router swaps content underneath, and the next room opens (reveal).
 * The overlay is always mounted, so transitions never wait on React.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { scrollTo } = useScroll();
  const root = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef<{ path: string; resolve: () => void } | null>(null);
  const [meta, setMeta] = useState<{ to: Room; variant: TransitionVariant; product: string }>({
    to: roomFromPath("/"),
    variant: "room",
    product: products[0].slug,
  });

  // Resolve the "arrived" promise once the router has committed the new route.
  useEffect(() => {
    if (pending.current && pathname === pending.current.path) {
      pending.current.resolve();
      pending.current = null;
    }
  }, [pathname]);

  const q = useCallback((sel: string) => gsap.utils.toArray<HTMLElement>(root.current?.querySelectorAll(sel) ?? []), []);

  const cover = useCallback(
    (variant: TransitionVariant, origin?: { x: number; y: number }) => {
      const el = root.current!;
      const page = document.getElementById("page");
      gsap.killTweensOf([el, page, ...q("[data-l], [data-l] *, [data-label] *")]);
      gsap.set(el, { visibility: "visible", pointerEvents: "auto" });
      gsap.set(q("[data-l]"), { autoAlpha: 0, clearProps: "transform,clipPath" });
      const label = q("[data-label] [data-w]");
      const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });

      const ox = origin ? `${origin.x}px` : "50%";
      const oy = origin ? `${origin.y}px` : "50%";

      switch (variant) {
        case "room": {
          gsap.set(q("[data-l=doors]"), { autoAlpha: 1 });
          tl.fromTo(q("[data-door=l]"), { xPercent: -100 }, { xPercent: 0, duration: 0.8 }, 0)
            .fromTo(q("[data-door=r]"), { xPercent: 100 }, { xPercent: 0, duration: 0.8 }, 0)
            .fromTo(q("[data-seam]"), { scaleY: 0, autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 0.5, ease: "expo.out" }, 0.6);
          if (page) tl.to(page, { scale: 0.94, autoAlpha: 0.35, duration: 0.8, ease: "power3.inOut" }, 0);
          break;
        }
        case "iris": {
          gsap.set(q("[data-l=iris]"), { autoAlpha: 1, clipPath: `circle(0% at ${ox} ${oy})` });
          tl.to(q("[data-l=iris]"), { clipPath: `circle(150% at ${ox} ${oy})`, duration: 0.9, ease: "power3.inOut" }, 0);
          if (page) tl.to(page, { scale: 1.08, transformOrigin: `${ox} ${oy}`, duration: 0.9, ease: "power3.in" }, 0);
          break;
        }
        case "dolly": {
          tl.fromTo(q("[data-l=light]"), { autoAlpha: 0, scale: 0.15 }, { autoAlpha: 1, scale: 1.6, duration: 1.1, ease: "power2.in" }, 0);
          if (page) tl.to(page, { scale: 1.35, autoAlpha: 0, duration: 1.1, ease: "power2.in" }, 0);
          break;
        }
        case "blueprint": {
          gsap.set(q("[data-l=paper]"), { autoAlpha: 1, clipPath: "inset(0% 0% 0% 100%)" });
          const lines = q("[data-l=paper] [data-ln], [data-l=paper] [data-drawing] polygon, [data-l=paper] [data-drawing] rect, [data-l=paper] [data-drawing] circle");
          lines.forEach((ln) => ln.setAttribute("pathLength", "1"));
          gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
          if (page) tl.to(page, { x: "-14vw", autoAlpha: 0, filter: "grayscale(1) contrast(1.4)", duration: 0.8, ease: "power3.in" }, 0);
          tl.to(q("[data-l=paper]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8 }, 0.1).to(
            lines,
            { strokeDashoffset: 0, duration: 0.9, stagger: 0.012, ease: "power2.out" },
            0.45,
          );
          break;
        }
        case "texture": {
          const lines = q("[data-l=paper] [data-ln]");
          lines.forEach((ln) => ln.setAttribute("pathLength", "1"));
          gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 0 });
          gsap.set(q("[data-l=paper] [data-drawing]"), { autoAlpha: 0 });
          tl.to(q("[data-l=paper]"), { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
            .fromTo(q("[data-l=texture]"), { autoAlpha: 1, clipPath: "circle(0% at 50% 50%)", scale: 1.25 }, { clipPath: "circle(80% at 50% 50%)", scale: 1, duration: 0.9 }, 0.3);
          if (page) tl.to(page, { autoAlpha: 0, filter: "blur(8px)", duration: 0.6, ease: "power2.in" }, 0);
          break;
        }
        case "photo": {
          tl.fromTo(q("[data-l=texture]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0)
            .set(q("[data-l=photo]"), { autoAlpha: 1 }, 0.3)
            .fromTo(q("[data-frame]"), { scale: 0.35, rotate: -4, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out" }, 0.3);
          if (page) tl.to(page, { scale: 1.06, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 0);
          break;
        }
        case "prototype": {
          const wires = q("[data-l=proto] [data-wire] line, [data-l=proto] [data-wire] path");
          wires.forEach((w) => w.setAttribute("pathLength", "1"));
          gsap.set(wires, { strokeDasharray: 1, strokeDashoffset: 1 });
          tl.fromTo(q("[data-l=proto]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0)
            .fromTo(q("[data-sepia]"), { filter: "sepia(1) contrast(1.1)", autoAlpha: 1 }, { autoAlpha: 0.18, filter: "sepia(0) contrast(1.6)", duration: 1 }, 0.35)
            .to(wires, { strokeDashoffset: 0, duration: 0.8, stagger: 0.01, ease: "power2.out" }, 0.45);
          if (page) tl.to(page, { autoAlpha: 0, filter: "sepia(1)", duration: 0.6, ease: "power2.in" }, 0);
          break;
        }
        case "fade": {
          tl.to(q("[data-l=iris]"), { autoAlpha: 1, duration: 0.2, ease: "none" }, 0);
          break;
        }
      }

      if (variant !== "fade") {
        tl.fromTo(label, { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "expo.out" }, "-=0.35");
      }
      return tl.then(() => undefined);
    },
    [q],
  );

  const reveal = useCallback(
    (variant: TransitionVariant) => {
      const el = root.current!;
      const page = document.getElementById("page");
      const label = q("[data-label] [data-w]");
      const tl = gsap.timeline({
        defaults: { ease: "power4.inOut" },
        onComplete: () => {
          gsap.set(el, { visibility: "hidden", pointerEvents: "none" });
          if (page) gsap.set(page, { clearProps: "transform,opacity,visibility,filter,transformOrigin,x" });
        },
      });
      if (variant !== "fade") tl.to(label, { yPercent: -110, duration: 0.5, stagger: 0.04, ease: "power3.in" }, 0);
      if (page) {
        gsap.set(page, { clearProps: "filter,x,transformOrigin" });
        tl.fromTo(page, { scale: variant === "dolly" ? 1.12 : 1.035, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "expo.out" }, 0.25);
      }

      switch (variant) {
        case "room":
          tl.to(q("[data-seam]"), { autoAlpha: 0, duration: 0.3 }, 0.2)
            .to(q("[data-door=l]"), { xPercent: -100, duration: 1 }, 0.3)
            .to(q("[data-door=r]"), { xPercent: 100, duration: 1 }, 0.3);
          break;
        case "iris":
        case "fade":
          tl.to(q("[data-l=iris]"), { autoAlpha: 0, duration: variant === "fade" ? 0.3 : 0.9, ease: "power2.inOut" }, 0.2);
          break;
        case "dolly":
          tl.to(q("[data-l=light]"), { autoAlpha: 0, scale: 2.4, duration: 1.3, ease: "power2.out" }, 0.1);
          break;
        case "blueprint":
          tl.to(q("[data-l=paper]"), { clipPath: "inset(0% 100% 0% 0%)", duration: 1 }, 0.3);
          break;
        case "texture":
          tl.set(q("[data-l=paper]"), { autoAlpha: 0 }, 0).to(q("[data-l=texture]"), { autoAlpha: 0, scale: 1.12, duration: 1, ease: "power2.inOut" }, 0.2);
          break;
        case "photo":
          tl.to(q("[data-frame]"), { scale: 2.8, autoAlpha: 0, duration: 1, ease: "power3.in" }, 0.1).to(
            q("[data-l=texture]"),
            { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" },
            0.4,
          );
          break;
        case "prototype":
          tl.to(q("[data-l=proto]"), { autoAlpha: 0, duration: 0.9, ease: "power2.inOut" }, 0.3);
          break;
      }
      return tl.then(() => undefined);
    },
    [q],
  );

  const navigate = useCallback(
    async (href: string, opts?: NavigateOpts) => {
      if (busyRef.current) return;
      const url = new URL(href, window.location.href);
      if (url.pathname === pathname) {
        useUI.getState().setMenu(false);
        if (url.hash) scrollTo(url.hash);
        return;
      }
      busyRef.current = true;
      setBusy(true);
      const variant: TransitionVariant = reduced ? "fade" : (opts?.variant ?? resolveVariant(pathname, url.pathname, !!opts?.origin));
      const fromSlug = pathname.startsWith("/objects/") ? pathname.split("/")[2] : useUI.getState().focus;
      setMeta({ to: roomFromPath(url.pathname), variant, product: getProduct(fromSlug ?? "")?.slug ?? products[0].slug });
      useUI.getState().setMenu(false);
      pulse.emit({ strength: 1, kind: "nav" });
      ambient.whoosh(1.1);

      try {
        await frame();
        await cover(variant, opts?.origin);
        const arrived = new Promise<void>((resolve) => {
          pending.current = { path: url.pathname, resolve };
        });
        router.push(url.pathname + url.search + url.hash, { scroll: false });
        await Promise.race([arrived, wait(6000)]);
        scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
        await frame();
        await frame();
        ScrollTrigger.refresh();
        await reveal(variant);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [pathname, reduced, router, cover, reveal, scrollTo],
  );

  const api = useMemo(() => ({ navigate, busy }), [navigate, busy]);
  const product = getProduct(meta.product) ?? products[0];

  return (
    <TransitionContext.Provider value={api}>
      {children}

      <div ref={root} className="invisible fixed inset-0 z-[80] overflow-hidden" style={{ pointerEvents: "none" }} aria-hidden>
        {/* ROOM — doors */}
        <div data-l="doors" className="absolute inset-0">
          <div data-door="l" className="absolute inset-y-0 left-0 w-1/2 bg-carbon" />
          <div data-door="r" className="absolute inset-y-0 right-0 w-1/2 bg-carbon" />
          <div data-seam className="absolute inset-y-0 left-1/2 w-px origin-center bg-bone/60" />
        </div>

        {/* IRIS / FADE */}
        <div data-l="iris" className="absolute inset-0 bg-ink" />

        {/* DOLLY — light at the end of the corridor */}
        <div
          data-l="light"
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 50%, #f4efe4 0%, #e7e2d7 22%, #3a3834 55%, #0b0b0a 75%)" }}
        />

        {/* BLUEPRINT — the object becomes a drawing */}
        <div data-l="paper" className="absolute inset-0 bg-[#e8e4da] text-[#26241f]">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {Array.from({ length: 13 }, (_, i) => (
              <line key={`v${i}`} data-ln x1={i * 8.33} x2={i * 8.33} y1="0" y2="100" stroke="currentColor" strokeWidth="0.08" opacity="0.14" />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`h${i}`} data-ln y1={i * 12.5} y2={i * 12.5} x1="0" x2="100" stroke="currentColor" strokeWidth="0.08" opacity="0.14" />
            ))}
          </svg>
          <div data-drawing className="absolute left-1/2 top-1/2 h-[64vh] w-[64vh] max-w-[86vw] -translate-x-1/2 -translate-y-1/2">
            <ElevationDrawing product={product} mode="line" dims />
          </div>
          <div className="t-label absolute left-[var(--gutter)] top-24 opacity-60">
            DWG {product.index}/{product.name} — Scale 1:4 — Atelier
          </div>
        </div>

        {/* TEXTURE — the drawing thickens into matter */}
        <div data-l="texture" className="absolute inset-0">
          <MaterialTexture kind="concrete" seed={4} />
        </div>

        {/* PHOTO — matter becomes the ground of a photograph */}
        <div data-l="photo" className="absolute inset-0 grid place-items-center">
          <figure data-frame className="relative h-[64vh] w-[48vh] max-w-[78vw] bg-paper p-3 pb-12 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="h-full w-full overflow-hidden">
              <Plate kind="portrait" tone="night" seed={31} />
            </div>
            <figcaption className="t-label absolute inset-x-3 bottom-4 flex justify-between text-ink">
              <span>VELOR Journal</span>
              <span>Issue 07</span>
            </figcaption>
          </figure>
        </div>

        {/* PROTOTYPE — an old photograph resolves into a wireframe */}
        <div data-l="proto" className="absolute inset-0 bg-ink text-bone">
          <div data-sepia className="absolute inset-0">
            <Plate kind="stairs" tone="sepia" seed={8} />
          </div>
          <svg data-wire className="absolute inset-0 h-full w-full" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 17 }, (_, i) => (
              <line key={`r${i}`} x1="80" y1="46" x2={-40 + i * 15} y2="100" stroke="currentColor" strokeWidth="0.12" opacity="0.35" />
            ))}
            {[50, 55, 62, 72, 86].map((y) => (
              <line key={`y${y}`} x1="0" x2="160" y1={y} y2={y} stroke="currentColor" strokeWidth="0.12" opacity="0.3" />
            ))}
            <path
              d="M66 64 L94 64 L94 36 L66 36 Z M66 36 L74 30 L102 30 L94 36 M102 30 L102 58 L94 64"
              fill="none"
              stroke="var(--color-brass)"
              strokeWidth="0.3"
            />
          </svg>
        </div>

        {/* Label — where you are going */}
        <div data-label className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 px-[var(--gutter)] pb-[calc(var(--gutter)+0.5rem)] text-bone mix-blend-difference">
          <div className="overflow-hidden">
            <span data-w className="t-label block">
              Entering — Room {meta.to.index}
            </span>
          </div>
          <div className="overflow-hidden">
            <span data-w className="t-display size-xl block">
              {meta.to.name}
            </span>
          </div>
          <div className="overflow-hidden">
            <span data-w className="t-label block">
              {meta.to.line}
            </span>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

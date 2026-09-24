"use client";

import { useEffect, useId, useRef, type CSSProperties, type RefObject } from "react";
import type { MaterialSlug } from "@/content/types";
import { gsap } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { cn, isPositioned } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { MaterialTexture } from "@/components/media/MaterialTexture";

type PointerState = { x: number; y: number; active: boolean; last: number };

/**
 * Pointer → CSS variables (--mx/--my in %, --nx/--ny in -1..1). When nobody
 * is touching the specimen it drifts on its own, so every material stays
 * alive on touch screens and in peripheral vision.
 */
function useSpecimenPointer(ref: RefObject<HTMLElement | null>) {
  const state = useRef<PointerState>({ x: 0.5, y: 0.5, active: false, last: 0 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = true;
    const apply = (x: number, y: number) => {
      state.current.x = x;
      state.current.y = y;
      el.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
      el.style.setProperty("--nx", (x * 2 - 1).toFixed(3));
      el.style.setProperty("--ny", (y * 2 - 1).toFixed(3));
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      apply((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      state.current.active = true;
      state.current.last = performance.now();
      el.style.setProperty("--hover", "1");
    };
    const leave = () => {
      state.current.active = false;
      el.style.setProperty("--hover", "0");
    };
    const enter = () => pulse.emit({ strength: 0.15, kind: "hover" });
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerenter", enter);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    apply(0.5, 0.5);

    const seed = Math.random() * 10;
    const tick = (t: number) => {
      if (reduced || !visible || state.current.active || performance.now() - state.current.last < 1800) return;
      apply(0.5 + Math.sin(t * 0.35 + seed) * 0.3, 0.5 + Math.cos(t * 0.27 + seed * 2) * 0.28);
    };
    gsap.ticker.add(tick);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerenter", enter);
      io.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [ref, reduced]);

  return state;
}

/** Canvas threads — fabric (woven grid) and wood (flowing grain) deform around the pointer. */
function Threads({ kind, pointer }: { kind: "fabric" | "wood"; pointer: RefObject<PointerState> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let visible = true;
    let influence = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    const draw = (t: number) => {
      if (!visible) return;
      const p = pointer.current!;
      influence += ((p.active ? 1 : 0.45) - influence) * 0.08;
      const px = p.x * w;
      const py = p.y * h;
      const R = Math.min(w, h) * 0.28;
      ctx.clearRect(0, 0, w, h);
      const push = (x: number, y: number) => {
        const dx = x - px;
        const dy = y - py;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - d / R);
        const k = f * f * 26 * influence;
        return [x + (dx / d) * k, y + (dy / d) * k, f] as const;
      };

      if (kind === "fabric") {
        const gap = 8;
        for (let pass = 0; pass < 2; pass++) {
          const vertical = pass === 0;
          const count = vertical ? Math.ceil(w / gap) : Math.ceil(h / gap);
          for (let i = 0; i <= count; i++) {
            ctx.beginPath();
            const len = vertical ? h : w;
            for (let s = 0; s <= len + 9; s += 9) {
              const bx = vertical ? i * gap : s;
              const by = vertical ? s : i * gap;
              const breathe = Math.sin(t * 0.8 + i * 0.3) * 0.6;
              const [x, y] = push(bx + (vertical ? breathe : 0), by + (vertical ? 0 : breathe));
              if (s === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = vertical ? `rgba(92,66,40,${0.55 + (i % 2) * 0.2})` : `rgba(236,220,196,${0.35 + (i % 3) * 0.12})`;
            ctx.lineWidth = vertical ? 2.2 : 1.6;
            ctx.stroke();
          }
        }
      } else {
        const gap = 9;
        const count = Math.ceil(w / gap) + 4;
        for (let i = -2; i < count; i++) {
          ctx.beginPath();
          for (let y = 0; y <= h + 8; y += 8) {
            const knot = Math.exp(-((y - h * 0.62) ** 2 + (i * gap - w * 0.3) ** 2) / 1800) * 18;
            const bx = i * gap + Math.sin(y * 0.012 + i * 0.4) * 5 + knot;
            const [x, yy] = push(bx, y);
            if (y === 0) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
          }
          const shade = i % 4 === 0 ? 0.55 : 0.22;
          ctx.strokeStyle = `rgba(58,36,18,${shade})`;
          ctx.lineWidth = i % 4 === 0 ? 1.8 : 1;
          ctx.stroke();
        }
        const g = ctx.createRadialGradient(px, py, 0, px, py, R * 1.3);
        g.addColorStop(0, `rgba(255,232,196,${0.35 * influence})`);
        g.addColorStop(1, "rgba(255,232,196,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      ro.disconnect();
      io.disconnect();
    };
  }, [kind, pointer]);
  return <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />;
}

/** Each material physically reacts to the pointer in its own way. */
export function Specimen({ slug, className, hero = false }: { slug: MaterialSlug; className?: string; hero?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useSpecimenPointer(ref);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const vars = { ["--mx" as string]: "50%", ["--my" as string]: "50%", ["--nx" as string]: 0, ["--ny" as string]: 0, ["--hover" as string]: 0 } as CSSProperties;

  return (
    <div ref={ref} className={cn(!isPositioned(className) && "relative", "overflow-hidden [perspective:900px]", className)} style={vars}>
      {slug === "steel" && (
        <div
          className="absolute inset-[-4%] transition-transform duration-300 ease-out"
          style={{ transform: "rotateX(calc(var(--ny) * -6deg)) rotateY(calc(var(--nx) * 8deg))" }}
        >
          <MaterialTexture kind="steel" seed={2} />
          <div className="absolute inset-0 mix-blend-overlay" style={{ background: "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.95), transparent 34%)" }} />
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{
              background:
                "linear-gradient(calc(100deg + var(--nx) * 40deg), transparent calc(35% + var(--ny) * 10%), rgba(255,255,255,0.9) calc(48% + var(--ny) * 10%), transparent calc(62% + var(--ny) * 10%))",
            }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(calc(var(--nx) * 30deg + 180deg), rgba(0,0,0,0.35), transparent 60%)" }} />
        </div>
      )}

      {slug === "glass" && (
        <>
          <svg className="absolute h-0 w-0" aria-hidden>
            <filter id={`${uid}lens`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="46" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <GlassBackdrop />
          <div
            className="absolute inset-0 scale-110"
            style={{
              filter: `url(#${uid}lens)`,
              WebkitMaskImage: "radial-gradient(circle at var(--mx) var(--my), #000 0 16%, transparent 30%)",
              maskImage: "radial-gradient(circle at var(--mx) var(--my), #000 0 16%, transparent 30%)",
            }}
          >
            <GlassBackdrop />
          </div>
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <MaterialTexture kind="glass" seed={6} />
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at var(--mx) var(--my), transparent 14%, rgba(255,255,255,0.55) 16.5%, transparent 19%)" }} />
        </>
      )}

      {slug === "stone" && (
        <>
          <div className="absolute inset-0 bg-[#2a251e]" />
          <div className="absolute inset-0 opacity-25">
            <MaterialTexture kind="travertine" seed={3} />
          </div>
          <div
            className="absolute inset-0"
            style={{
              filter: "contrast(1.25) brightness(1.1)",
              WebkitMaskImage: "radial-gradient(ellipse 42% 36% at var(--mx) var(--my), #000 10%, transparent 72%)",
              maskImage: "radial-gradient(ellipse 42% 36% at var(--mx) var(--my), #000 10%, transparent 72%)",
            }}
          >
            <MaterialTexture kind="travertine" seed={3} />
          </div>
          <div className="absolute inset-0 mix-blend-multiply" style={{ background: "linear-gradient(calc(90deg + var(--nx) * 60deg), rgba(0,0,0,0.5), transparent 55%)" }} />
        </>
      )}

      {slug === "fabric" && (
        <>
          <div className="absolute inset-0 bg-[#b39c7c]" />
          <div className="absolute inset-0 opacity-40 mix-blend-multiply">
            <MaterialTexture kind="wool" seed={8} />
          </div>
          <Threads kind="fabric" pointer={pointer} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at var(--mx) var(--my), rgba(0,0,0,0.25), transparent 30%)" }} />
        </>
      )}

      {slug === "wood" && (
        <>
          <div className="absolute inset-0">
            <MaterialTexture kind="wood" seed={5} />
          </div>
          <Threads kind="wood" pointer={pointer} />
        </>
      )}

      {slug === "composite" && (
        <>
          <div className="absolute inset-0 bg-[#141412]" />
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              className="absolute inset-[-6%]"
              style={{
                transform: `translate3d(calc(var(--nx) * ${(k + 1) * -10}px), calc(var(--ny) * ${(k + 1) * -10}px), 0)`,
                opacity: 0.85 - k * 0.18,
                backgroundImage: `repeating-linear-gradient(${k === 0 ? 45 : k === 1 ? -45 : 0}deg, rgba(199,170,116,${0.22 - k * 0.05}) 0 2px, transparent 2px ${9 + k * 5}px)`,
              }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage: "radial-gradient(circle at var(--mx) var(--my), transparent 0 18%, #000 19%)",
              maskImage: "radial-gradient(circle at var(--mx) var(--my), transparent 0 18%, #000 19%)",
            }}
          >
            <MaterialTexture kind="composite" seed={4} />
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at var(--mx) var(--my), transparent 17.5%, rgba(199,170,116,0.9) 18%, transparent 19.5%)" }} />
        </>
      )}

      {hero && <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />}
    </div>
  );
}

function GlassBackdrop() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "repeating-linear-gradient(90deg, #d4dad9 0 22px, #aab6b8 22px 26px, #eef2f1 26px 60px), linear-gradient(180deg, #e5ebea, #b9c5c6)",
        backgroundBlendMode: "multiply",
      }}
    >
      <div className="absolute left-[18%] top-[22%] size-[34%] rounded-full bg-[#1f2a2d]" />
      <div className="absolute bottom-[14%] right-[12%] h-[28%] w-[22%] bg-[#a88a5e]" />
      <p className="t-display absolute bottom-[6%] left-[6%] text-[clamp(2rem,6vw,5rem)] text-[#1f2a2d]">G-02</p>
    </div>
  );
}

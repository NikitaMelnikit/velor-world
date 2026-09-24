"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { getProduct } from "@/content/products";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { useReducedMotion } from "@/hooks";

type Ptr = { x: number; y: number; down: boolean; inside: boolean };

/** Shared canvas loop: DPR, resize, visibility, pointer — draw gets (ctx, w, h, t, ptr). */
function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: Ptr, dt: number) => void, clearEachFrame = true) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const reduced = useReducedMotion();
  useEffect(() => {
    drawRef.current = draw;
  });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const p: Ptr = { x: -999, y: -999, down: false, inside: false };
    let w = 0;
    let h = 0;
    let visible = true;
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
    const pos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      p.x = e.clientX - r.left;
      p.y = e.clientY - r.top;
    };
    const move = (e: PointerEvent) => {
      pos(e);
      p.inside = true;
    };
    const down = (e: PointerEvent) => {
      pos(e);
      p.down = true;
      c.setPointerCapture?.(e.pointerId);
      pulse.emit({ strength: 0.3, kind: "tap" });
    };
    const up = () => (p.down = false);
    const leave = () => {
      p.inside = false;
      p.down = false;
    };
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointerleave", leave);
    const tick = (t: number, dMs: number) => {
      if (!visible) return;
      if (clearEachFrame) ctx.clearRect(0, 0, w, h);
      drawRef.current(ctx, w, h, reduced ? 0 : t, p, Math.min(0.05, dMs / 1000));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointerleave", leave);
    };
  }, [clearEachFrame, reduced]);
  return ref;
}

/* FX-01 — a felt wall that inhales toward you */
export function BreathingWall() {
  const ref = useCanvas((ctx, w, h, t, p) => {
    const gap = 26;
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        const d = Math.hypot(x - p.x, y - p.y);
        const near = p.inside ? Math.max(0, 1 - d / 170) : 0;
        const breathe = (Math.sin(t * 1.4 + x * 0.02 + y * 0.015) + 1) / 2;
        const r = 3 + breathe * 3 + near * 9;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${170 + near * 60},${150 + near * 40},${120},${0.35 + near * 0.6})`;
        ctx.fill();
      }
    }
  });
  return <canvas ref={ref} className="h-full w-full touch-none" data-cursor="Approach" />;
}

/* FX-02 — a surface that remembers, then forgets */
export function MemorySurface() {
  const last = useRef<{ x: number; y: number } | null>(null);
  const hover = useRef(false);
  useEffect(() => {
    hover.current = window.matchMedia("(hover: hover)").matches;
  }, []);
  const ref = useCanvas((ctx, w, h, _t, p) => {
    ctx.fillStyle = "rgba(20,19,17,0.018)";
    ctx.fillRect(0, 0, w, h);
    if (p.inside && (p.down || hover.current)) {
      const l = last.current;
      if (l) {
        const g = ctx.createLinearGradient(l.x, l.y, p.x, p.y);
        g.addColorStop(0, "rgba(214,120,70,0.9)");
        g.addColorStop(1, "rgba(240,190,120,0.9)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      last.current = { x: p.x, y: p.y };
    } else last.current = null;
  }, false);
  return <canvas ref={ref} className="h-full w-full touch-none bg-[#141311]" data-cursor="Draw" />;
}

/* FX-03 — mycelium, grown from where you touch */
type Hypha = { x: number; y: number; a: number; life: number; w: number };
export function MyceliumLight() {
  const tips = useRef<Hypha[]>([]);
  const seeded = useRef(false);
  const ref = useCanvas((ctx, w, h, _t, p, dt) => {
    if (!seeded.current && w > 0) {
      seeded.current = true;
      for (let k = 0; k < 5; k++) tips.current.push({ x: w / 2, y: h * 0.6, a: -Math.PI / 2 + (k - 2) * 0.5, life: 1, w: 1.6 });
    }
    if (p.down) {
      p.down = false;
      for (let k = 0; k < 6; k++) tips.current.push({ x: p.x, y: p.y, a: (k / 6) * Math.PI * 2, life: 1, w: 1.8 });
    }
    const next: Hypha[] = [];
    for (const tip of tips.current) {
      const nx = tip.x + Math.cos(tip.a) * 60 * dt;
      const ny = tip.y + Math.sin(tip.a) * 60 * dt;
      ctx.strokeStyle = `rgba(242,${200 + tip.life * 40},${150 + tip.life * 60},${0.25 + tip.life * 0.6})`;
      ctx.shadowColor = "rgba(255,210,150,0.8)";
      ctx.shadowBlur = 6;
      ctx.lineWidth = tip.w * tip.life + 0.3;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      tip.x = nx;
      tip.y = ny;
      tip.a += (Math.random() - 0.5) * 0.35;
      tip.life -= dt * 0.12;
      if (tip.life > 0 && nx > 0 && nx < w && ny > 0 && ny < h) {
        next.push(tip);
        if (Math.random() < 0.012 && next.length < 260) next.push({ ...tip, a: tip.a + (Math.random() > 0.5 ? 0.7 : -0.7), w: tip.w * 0.75 });
      }
    }
    ctx.shadowBlur = 0;
    tips.current = next;
  }, false);
  return <canvas ref={ref} className="h-full w-full touch-none bg-[#0c0a08]" data-cursor="Seed" />;
}

/* FX-04 — deliberately unfinished */
export function UnfinishedVessel() {
  const [pct, setPct] = useState(73);
  const [glitch, setGlitch] = useState(false);
  const vael = getProduct("vael")!;
  const push = () => {
    pulse.emit({ strength: 0.5, kind: "tap" });
    if (pct >= 76) {
      setGlitch(true);
      setTimeout(() => {
        setPct(73);
        setGlitch(false);
      }, 700);
      return;
    }
    setPct((v) => v + 1);
  };
  return (
    <button type="button" onClick={push} data-cursor="Finish it" className="relative flex h-full w-full flex-col justify-between bg-[#0e0e0d] p-4 text-left text-bone">
      <div className="relative flex-1" style={{ animation: glitch ? "flicker 0.3s steps(2) infinite" : undefined }}>
        <div className="absolute inset-[6%] text-bone/80">
          <ElevationDrawing product={vael} mode="line" partial={pct / 100} />
        </div>
        <div
          className="absolute inset-y-0 right-0 bg-[#0e0e0d]"
          style={{ width: `${100 - pct}%`, backgroundImage: "repeating-linear-gradient(45deg, rgba(231,226,215,0.06) 0 6px, transparent 6px 12px)" }}
        />
      </div>
      <div>
        <p className="t-label flex justify-between">
          <span>Render {pct}% — halted</span>
          <span className="opacity-60">ERR_UNDEFINED_INTENT</span>
        </p>
        <span className="mt-2 block h-1 bg-bone/15">
          <span className="block h-full bg-brass transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </span>
        <p className="mt-3 flex gap-2" aria-hidden>
          <span className="block h-3 w-24 bg-bone/20" />
          <span className="block h-3 w-10 bg-bone/20" />
          <span className="block h-3 w-16 bg-bone/20" />
        </p>
      </div>
    </button>
  );
}

/* FX-05 — objects holding each other in place */
export function GravityShelf() {
  const pieces = [
    { w: 70, h: 110, r: 0, c: "#c7aa74", shape: "rounded-t-full" },
    { w: 56, h: 56, r: 0, c: "#8a867d", shape: "rounded-full" },
    { w: 40, h: 150, r: 0, c: "#e7e2d7", shape: "" },
    { w: 90, h: 44, r: 0, c: "#8f4a31", shape: "rounded-sm" },
    { w: 48, h: 84, r: 0, c: "#34322e", shape: "rounded-[40%]" },
  ];
  const [jolt, setJolt] = useState(0);
  return (
    <div className="relative flex h-full w-full items-end justify-center gap-2 bg-[#1a1917] px-4 pb-[18%]">
      <span className="absolute inset-x-6 bottom-[18%] h-1 bg-bone/40" />
      {pieces.map((p, k) => (
        <motion.div
          key={k}
          drag
          dragSnapToOrigin
          dragElastic={0.6}
          whileDrag={{ scale: 1.08, rotate: (k % 2 ? 1 : -1) * 10, zIndex: 5 }}
          onDragStart={() => {
            setJolt((j) => j + 1);
            pulse.emit({ strength: 0.4, kind: "tap" });
          }}
          animate={{ rotate: jolt === 0 ? 0 : [0, (k % 2 ? 1 : -1) * (jolt % 2 ? 4 : 5), 0] }}
          transition={{ duration: 0.6, ease: "easeInOut", delay: k * 0.05 }}
          className={`relative cursor-grab touch-none ${p.shape}`}
          style={{ width: p.w, height: p.h, background: p.c }}
          data-cursor="Drag"
        />
      ))}
    </div>
  );
}

/* FX-06 — stone that flows */
export function LiquidStone() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const box = useRef<HTMLDivElement>(null);
  const lead = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const el = box.current;
    const c = lead.current;
    if (!el || !c) return;
    const xTo = gsap.quickTo(c, "attr.cx", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(c, "attr.cy", { duration: 0.8, ease: "power3" });
    const on = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width) * 400);
      yTo(((e.clientY - r.top) / r.height) * 300);
    };
    el.addEventListener("pointermove", on);
    return () => el.removeEventListener("pointermove", on);
  }, []);
  return (
    <div ref={box} className="relative h-full w-full touch-none bg-[#cbbda3]" data-cursor="Stir">
      <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id={`${uid}goo`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
          <pattern id={`${uid}veins`} width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="#3a352d" />
            <path d="M0 40 Q20 20 40 42 T80 38" stroke="#6c6254" strokeWidth="2" fill="none" />
          </pattern>
        </defs>
        <g filter={`url(#${uid}goo)`} fill={`url(#${uid}veins)`}>
          <circle cx="120" cy="150" r="54" style={{ animation: "blobA 9s ease-in-out infinite alternate" }} />
          <circle cx="260" cy="120" r="46" style={{ animation: "blobB 11s ease-in-out infinite alternate" }} />
          <circle cx="220" cy="210" r="38" style={{ animation: "blobA 7s ease-in-out infinite alternate-reverse" }} />
          <circle ref={lead} cx="200" cy="150" r="40" />
        </g>
      </svg>
      <style>{`
        @keyframes blobA { to { transform: translate(60px, -30px) } }
        @keyframes blobB { to { transform: translate(-70px, 50px) } }
      `}</style>
    </div>
  );
}

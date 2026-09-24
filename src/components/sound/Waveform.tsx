"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { pulse } from "@/lib/pulse";
import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

export type WaveParams = { amp: number; freq: number; noise: number; speed: number };

type Props = Partial<WaveParams> & {
  mode?: "line" | "bars";
  bars?: number;
  color?: string;
  /** Add the global pulse energy (interactions, scroll) to the signal. */
  reactive?: boolean;
  layers?: number;
  className?: string;
  label?: string;
};

/**
 * A visual "sound" — frequency-like motion drawn on canvas. Parameters are
 * eased toward their targets, so a room can change its tone smoothly.
 * Runs on the shared GSAP ticker and sleeps when off-screen.
 */
export function Waveform({
  amp = 0.3,
  freq = 2,
  noise = 0,
  speed = 1,
  mode = "line",
  bars = 24,
  color = "currentColor",
  reactive = true,
  layers = 3,
  className,
  label,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef<WaveParams>({ amp, freq, noise, speed });
  const current = useRef<WaveParams>({ amp, freq, noise, speed });
  const reduced = useReducedMotion();

  useEffect(() => {
    target.current = { amp, freq, noise, speed };
  }, [amp, freq, noise, speed]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let visible = true;
    let t = 0;
    let resolved = color;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = c.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      c.width = Math.max(1, Math.round(w * dpr));
      c.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resolved = color === "currentColor" ? getComputedStyle(c).color : color;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    const draw = (dt: number) => {
      const cur = current.current;
      const tg = target.current;
      const k = Math.min(1, dt * 3);
      cur.amp += (tg.amp - cur.amp) * k;
      cur.freq += (tg.freq - cur.freq) * k;
      cur.noise += (tg.noise - cur.noise) * k;
      cur.speed += (tg.speed - cur.speed) * k;
      t += dt * cur.speed;

      const energy = reactive ? Math.min(1, pulse.energy) : 0;
      const A = Math.min(1, cur.amp + energy * 0.45);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = resolved;
      ctx.strokeStyle = resolved;
      const mid = h / 2;

      if (mode === "bars") {
        const gap = w / bars;
        const bw = Math.max(1, gap * 0.38);
        for (let i = 0; i < bars; i++) {
          const env = Math.sin((i / (bars - 1)) * Math.PI) * 0.7 + 0.3;
          const s = Math.abs(Math.sin(i * 0.55 * cur.freq + t * 3.2) * 0.6 + Math.sin(i * 1.7 + t * 5.1) * 0.4);
          const n = cur.noise * Math.random();
          const bh = Math.max(1, (s * A * env + n * 0.4 + 0.04) * h);
          ctx.globalAlpha = 0.35 + 0.65 * env;
          ctx.fillRect(i * gap + (gap - bw) / 2, mid - bh / 2, bw, bh);
        }
        ctx.globalAlpha = 1;
        return;
      }

      for (let l = 0; l < layers; l++) {
        ctx.globalAlpha = l === 0 ? 0.95 : 0.35 / l;
        ctx.lineWidth = l === 0 ? 1.2 : 1;
        ctx.beginPath();
        const phase = l * 0.9;
        for (let x = 0; x <= w; x += 2) {
          const u = x / w;
          const env = Math.sin(u * Math.PI);
          const base =
            Math.sin(u * Math.PI * 2 * cur.freq + t * 2 + phase) * 0.65 +
            Math.sin(u * Math.PI * 2 * cur.freq * 2.3 - t * 1.3 + phase) * 0.25 +
            Math.sin(u * Math.PI * 2 * cur.freq * 5.1 + t * 4) * 0.1;
          const n = cur.noise > 0.01 ? (Math.random() - 0.5) * cur.noise * 1.4 : 0;
          const y = mid + (base + n) * A * env * (h / 2) * (1 - l * 0.22);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      draw(0);
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    const tick = (_time: number, deltaMs: number) => {
      if (!visible || document.hidden) return;
      draw(Math.min(0.05, deltaMs / 1000));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
    };
  }, [bars, color, layers, mode, reactive, reduced]);

  return <canvas ref={canvas} className={cn("block h-full w-full", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}

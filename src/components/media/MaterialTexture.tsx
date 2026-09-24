"use client";

import { memo, useId, type ReactNode } from "react";
import type { TextureKind } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Procedural macro textures: the material vocabulary shared by the
 * Material Lab, the Atelier, product environments and page transitions.
 */

/** Alpha-from-noise colour matrix: alpha = k*R + b, colour = rgb. */
const alpha = (rgb: [number, number, number], k: number, b: number) =>
  `0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} ${k} 0 0 0 ${b}`;

type Layer = { freq: string; oct?: number; type?: "fractalNoise" | "turbulence"; m: string; op?: number; seed?: number };

type Recipe = { base: (id: (s: string) => string) => ReactNode; layers: Layer[]; extra?: (id: (s: string) => string) => ReactNode };

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const recipes: Record<TextureKind, Recipe> = {
  concrete: {
    base: () => <rect width="400" height="400" fill="#8b8882" />,
    layers: [
      { freq: "0.012", oct: 3, m: alpha(hex("#b9b6ae"), 1.3, -0.45), op: 0.55 },
      { freq: "0.7", oct: 3, m: alpha(hex("#3e3c38"), 1.8, -0.8), op: 0.6 },
      { freq: "0.11", oct: 1, m: alpha(hex("#2d2b28"), 9, -6.2), op: 0.9 },
    ],
    extra: () => (
      <g>
        <rect x="0" y="199" width="400" height="1.2" fill="#3a3834" opacity="0.5" />
        <rect x="199" y="0" width="1.2" height="400" fill="#3a3834" opacity="0.35" />
        {[
          [100, 100],
          [300, 100],
          [100, 300],
          [300, 300],
        ].map(([x, y]) => (
          <g key={`${x}${y}`}>
            <circle cx={x} cy={y} r="7" fill="#2b2926" />
            <circle cx={x - 1.5} cy={y - 1.5} r="5" fill="#1b1a18" />
          </g>
        ))}
      </g>
    ),
  },
  steel: {
    base: (id) => <rect width="400" height="400" fill={`url(#${id("sheen")})`} />,
    layers: [
      { freq: "0.002 0.9", oct: 2, m: alpha([1, 1, 1], 1.4, -0.55), op: 0.45 },
      { freq: "0.004 0.6", oct: 2, m: alpha(hex("#3a3f44"), 1.5, -0.6), op: 0.45 },
    ],
  },
  brass: {
    base: (id) => <rect width="400" height="400" fill={`url(#${id("brass")})`} />,
    layers: [
      { freq: "0.002 0.9", oct: 2, m: alpha(hex("#fff0cc"), 1.4, -0.55), op: 0.4 },
      { freq: "0.05", oct: 2, m: alpha(hex("#5a3f1c"), 1.6, -0.9), op: 0.4 },
    ],
  },
  glass: {
    base: (id) => <rect width="400" height="400" fill={`url(#${id("glass")})`} />,
    layers: [{ freq: "0.004 0.03", oct: 2, m: alpha([1, 1, 1], 1.6, -0.6), op: 0.35 }],
    extra: () => (
      <g>
        {[60, 150, 250, 330].map((x, i) => (
          <rect key={x} x={x} y="-20" width={14 + i * 6} height="440" fill="#fff" opacity={0.18 + (i % 2) * 0.12} transform={`skewX(-8)`} />
        ))}
        {[
          [80, 120, 3],
          [210, 60, 2],
          [300, 260, 4],
          [140, 330, 2.5],
          [350, 150, 1.8],
        ].map(([x, y, r]) => (
          <circle key={`${x}`} cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.7" />
        ))}
      </g>
    ),
  },
  stone: {
    base: () => <rect width="400" height="400" fill="#cfc8bb" />,
    layers: [
      { freq: "0.01", oct: 3, m: alpha(hex("#e9e4d9"), 1.2, -0.4), op: 0.6 },
      { freq: "0.008", oct: 5, type: "turbulence", m: alpha(hex("#56504a"), -7, 1.1), op: 0.55 },
    ],
  },
  travertine: {
    base: () => <rect width="400" height="400" fill="#d2c3a6" />,
    layers: [
      { freq: "0.002 0.045", oct: 3, m: alpha(hex("#b19a74"), 1.5, -0.55), op: 0.7 },
      { freq: "0.6", oct: 2, m: alpha(hex("#f2e8d4"), 1.4, -0.6), op: 0.5 },
      { freq: "0.025 0.14", oct: 2, m: alpha(hex("#6f5c41"), 10, -7), op: 0.85 },
    ],
  },
  fabric: {
    base: (id) => <rect width="400" height="400" fill={`url(#${id("weave")})`} />,
    layers: [
      { freq: "0.55", oct: 3, m: alpha(hex("#e7d9c3"), 1.4, -0.6), op: 0.5 },
      { freq: "0.02", oct: 2, m: alpha(hex("#4f3a26"), 1.2, -0.5), op: 0.3 },
    ],
  },
  wool: {
    base: () => <rect width="400" height="400" fill="#c8b69c" />,
    layers: [
      { freq: "0.6", oct: 4, m: alpha(hex("#f1e6d2"), 1.5, -0.6), op: 0.55 },
      { freq: "0.9", oct: 2, m: alpha(hex("#6d5840"), 1.6, -0.8), op: 0.45 },
      { freq: "0.015", oct: 2, m: alpha(hex("#8e7658"), 1.2, -0.45), op: 0.4 },
    ],
  },
  wood: {
    base: () => <rect width="400" height="400" fill="#a37a52" />,
    layers: [
      { freq: "0.05 0.003", oct: 3, m: alpha(hex("#5e3f22"), 2.6, -1.05), op: 0.7 },
      { freq: "0.3 0.008", oct: 2, m: alpha(hex("#d9b184"), 1.8, -0.8), op: 0.45 },
      { freq: "0.9 0.02", oct: 1, m: alpha(hex("#3b2614"), 2, -1.2), op: 0.35 },
    ],
  },
  composite: {
    base: (id) => <rect width="400" height="400" fill={`url(#${id("twill")})`} />,
    layers: [{ freq: "0.01", oct: 2, m: alpha([1, 1, 1], 1.2, -0.55), op: 0.15 }],
    extra: (id) => <rect width="400" height="400" fill={`url(#${id("gloss")})`} opacity="0.55" />,
  },
  paper: {
    base: () => <rect width="400" height="400" fill="#ece7dc" />,
    layers: [
      { freq: "0.65", oct: 3, m: alpha(hex("#c9c2b3"), 1.3, -0.55), op: 0.55 },
      { freq: "0.03 0.5", oct: 2, m: alpha(hex("#b4ab98"), 2, -1.1), op: 0.35 },
    ],
  },
  graphite: {
    base: () => <rect width="400" height="400" fill="#2b2b2a" />,
    layers: [
      { freq: "0.004 0.35", oct: 3, m: alpha(hex("#7a7a76"), 1.6, -0.6), op: 0.6 },
      { freq: "0.8", oct: 2, m: alpha(hex("#111"), 1.5, -0.6), op: 0.5 },
    ],
    extra: (id) => <rect width="400" height="400" fill={`url(#${id("sheen")})`} opacity="0.18" />,
  },
  plaster: {
    base: () => <rect width="400" height="400" fill="#ebe6dc" />,
    layers: [
      { freq: "0.02", oct: 3, m: alpha(hex("#d6cfc1"), 1.4, -0.5), op: 0.6 },
      { freq: "0.09", oct: 1, m: alpha(hex("#b3ab9b"), 9, -6.4), op: 0.8 },
    ],
  },
};

function MaterialTextureImpl({ kind, className, seed = 1 }: { kind: TextureKind; className?: string; seed?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => `${uid}${s}`;
  const recipe = recipes[kind];

  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f757a" />
          <stop offset="0.45" stopColor="#d5d9dc" />
          <stop offset="0.6" stopColor="#9ea4a8" />
          <stop offset="1" stopColor="#5c6166" />
        </linearGradient>
        <linearGradient id={id("brass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7f5f31" />
          <stop offset="0.45" stopColor="#dcbb7d" />
          <stop offset="0.62" stopColor="#a68349" />
          <stop offset="1" stopColor="#6d4f27" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c3cfd0" />
          <stop offset="0.5" stopColor="#eef3f2" />
          <stop offset="1" stopColor="#b6c3c5" />
        </linearGradient>
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.48" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="0.52" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id={id("weave")} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#a8916f" />
          <rect width="4" height="4" fill="#8f7757" />
          <rect x="4" y="4" width="4" height="4" fill="#8f7757" />
          <rect y="3.5" width="8" height="1" fill="#c4ae8c" opacity="0.6" />
        </pattern>
        <pattern id={id("twill")} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="#1a1917" />
          <rect width="8" height="16" fill="#2f2d28" />
          <rect x="7.5" width="1" height="16" fill="#000" opacity="0.5" />
        </pattern>
        {recipe.layers.map((l, i) => (
          <filter key={i} id={id(`l${i}`)} x="0" y="0" width="100%" height="100%">
            <feTurbulence type={l.type ?? "fractalNoise"} baseFrequency={l.freq} numOctaves={l.oct ?? 2} seed={seed + i * 7} stitchTiles="stitch" />
            <feColorMatrix type="matrix" values={l.m} />
          </filter>
        ))}
      </defs>
      {recipe.base(id)}
      {recipe.layers.map((l, i) => (
        <rect key={i} width="400" height="400" filter={`url(#${id(`l${i}`)})`} opacity={l.op ?? 0.5} />
      ))}
      {recipe.extra?.(id)}
    </svg>
  );
}

export const MaterialTexture = memo(MaterialTextureImpl);

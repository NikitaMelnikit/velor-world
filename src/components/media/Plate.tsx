"use client";

import { memo, useId, type ReactNode } from "react";
import type { PlateKind, PlateSpec, PlateTone } from "@/content/types";
import { cn, mixHex, rng } from "@/lib/utils";

/**
 * Procedural "photography". Every plate is a resolution-independent SVG
 * composition — cinematic light, architecture and objects — so the world
 * ships with zero image weight. Real photography can replace any plate
 * through <Media src>.
 */

type Tone = { a: string; b: string; light: string; mid: string; dark: string };

export const TONES: Record<PlateTone, Tone> = {
  night: { a: "#0c0c0b", b: "#1d1c1a", light: "#e0d3b8", mid: "#3a3834", dark: "#060606" },
  dusk: { a: "#18130f", b: "#3d2e22", light: "#eab985", mid: "#5d4533", dark: "#0c0907" },
  bone: { a: "#d3cec3", b: "#ece8df", light: "#ffffff", mid: "#a29d92", dark: "#4a4741" },
  sand: { a: "#ae9a7e", b: "#d8c8ae", light: "#fbf0dc", mid: "#8a7256", dark: "#3a2d20" },
  sepia: { a: "#5f4c38", b: "#a38a69", light: "#efdfbf", mid: "#4a3a29", dark: "#1f170f" },
  steel: { a: "#15181b", b: "#2f353a", light: "#d2dade", mid: "#4a5359", dark: "#0a0c0d" },
  ember: { a: "#190e0a", b: "#3e1c12", light: "#e88d5b", mid: "#60291a", dark: "#090403" },
};

type Ctx = { t: Tone; r: () => number; id: (s: string) => string };

const compositions: Record<PlateKind, (c: Ctx) => ReactNode> = {
  arches: ({ t, r, id }) => {
    const vpY = 440 + (r() - 0.5) * 50;
    const n = 7;
    const walls = [];
    for (let i = n - 1; i >= 0; i--) {
      const s = Math.pow(0.72, i);
      const aw = 540 * s;
      const base = vpY + 360 * s;
      const top = base - 720 * s;
      const x0 = 400 - aw / 2;
      const x1 = 400 + aw / 2;
      const hole = `M${x0} ${base} V${top + aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${x1} ${top + aw / 2} V${base} Z`;
      const wall = `M0 0 H800 V${base} H0 Z ${hole}`;
      walls.push(<path key={i} d={wall} fillRule="evenodd" fill={mixHex(t.dark, t.mid, i / (n - 1))} />);
    }
    const fs = Math.pow(0.72, 3);
    const fx = 400 + (r() - 0.5) * 120 * fs;
    const fy = vpY + 360 * fs;
    const fh = 150 * fs;
    return (
      <>
        <rect width="800" height="800" fill={`url(#${id("glow")})`} />
        <rect y={vpY} width="800" height={800 - vpY} fill={`url(#${id("floor")})`} />
        <ellipse cx="400" cy={vpY + 40} rx="160" ry="22" fill={t.light} opacity="0.35" filter={`url(#${id("blur")})`} />
        {walls}
        <g fill={t.dark}>
          <rect x={fx - fh * 0.11} y={fy - fh * 0.82} width={fh * 0.22} height={fh * 0.82} rx={fh * 0.05} />
          <circle cx={fx} cy={fy - fh * 0.93} r={fh * 0.1} />
        </g>
      </>
    );
  },

  monolith: ({ t, r, id }) => {
    const hz = 520 + r() * 60;
    const mx = 320 + r() * 80;
    const mw = 90;
    const mt = 150 + r() * 70;
    const base = hz + 44;
    const sx = 520 + r() * 120;
    return (
      <>
        <rect width="800" height={hz} fill={`url(#${id("sky")})`} />
        <circle cx={sx} cy={hz - 36} r="80" fill={t.light} opacity="0.55" filter={`url(#${id("blur")})`} />
        <circle cx={sx} cy={hz - 36} r="34" fill={t.light} opacity="0.85" />
        <rect y={hz} width="800" height={800 - hz} fill={`url(#${id("ground")})`} />
        <polygon points={`${mx},${base} ${mx + mw},${base} ${mx + mw - 460},800 ${mx - 620},800`} fill={t.dark} opacity="0.55" filter={`url(#${id("soft")})`} />
        <rect x={mx} y={mt} width={mw} height={base - mt} fill={t.dark} />
        <rect x={mx + mw - 7} y={mt} width="7" height={base - mt} fill={t.light} opacity="0.35" />
      </>
    );
  },

  shaft: ({ t, r, id }) => {
    const fl = 590 + r() * 40;
    const ox = 300 + r() * 120;
    return (
      <>
        <rect width="800" height="800" fill={t.b} />
        <rect y={fl} width="800" height={800 - fl} fill={`url(#${id("ground")})`} />
        <polygon points={`560,0 720,0 ${ox + 150},${fl} ${ox - 30},${fl}`} fill={t.light} opacity="0.32" filter={`url(#${id("blur")})`} />
        <polygon points={`${ox - 30},${fl} ${ox + 150},${fl} ${ox + 260},800 ${ox - 10},800`} fill={t.light} opacity="0.28" filter={`url(#${id("soft")})`} />
        <ellipse cx={ox + 60} cy={fl + 6} rx="62" ry="10" fill={t.dark} opacity="0.6" filter={`url(#${id("soft")})`} />
        <circle cx={ox + 60} cy={fl - 44} r="46" fill={t.dark} />
        <circle cx={ox + 76} cy={fl - 62} r="16" fill={t.light} opacity="0.35" filter={`url(#${id("soft")})`} />
      </>
    );
  },

  stairs: ({ t, r, id }) => {
    const steps = [];
    const run = 70 + r() * 20;
    const rise = 52;
    let x = -20;
    let y = 800;
    let i = 0;
    while (x < 820 && y > 120) {
      steps.push(
        <g key={i}>
          <rect x={x} y={y - rise} width={820 - x} height={rise} fill={mixHex(t.dark, t.mid, Math.min(1, i / 12))} />
          <rect x={x} y={y - rise} width={820 - x} height="5" fill={t.light} opacity={0.25 + i * 0.04} />
        </g>,
      );
      x += run;
      y -= rise;
      i++;
    }
    return (
      <>
        <rect width="800" height="800" fill={`url(#${id("sky")})`} />
        <circle cx="660" cy="120" r="220" fill={t.light} opacity="0.22" filter={`url(#${id("blur")})`} />
        {steps}
        <rect x="0" y="0" width="800" height="800" fill={`url(#${id("side")})`} opacity="0.6" />
      </>
    );
  },

  studio: ({ t, id }) => (
    <>
      <rect width="800" height="800" fill={`url(#${id("spot")})`} />
      <ellipse cx="400" cy="566" rx="210" ry="26" fill={t.dark} opacity="0.35" filter={`url(#${id("soft")})`} />
      <polygon points="290,560 510,560 540,590 260,590" fill={mixHex(t.mid, t.light, 0.35)} />
      <rect x="260" y="590" width="280" height="220" fill={t.mid} />
      <rect x="260" y="590" width="280" height="220" fill={`url(#${id("side")})`} opacity="0.5" />
      <path
        d="M362 560 C350 520 328 482 350 440 C366 410 386 396 386 368 L414 368 C414 396 434 410 450 440 C472 482 450 520 438 560 Z"
        fill={t.dark}
      />
      <path d="M430 430 C452 470 446 520 436 556" stroke={t.light} strokeWidth="3" fill="none" opacity="0.45" />
    </>
  ),

  portrait: ({ t, r, id }) => {
    const dx = (r() - 0.5) * 60;
    const sil = `M${170 + dx} 800 C${190 + dx} 620 ${290 + dx} 548 ${400 + dx} 540 C${510 + dx} 548 ${610 + dx} 620 ${630 + dx} 800 Z`;
    return (
      <>
        <rect width="800" height="800" fill={`url(#${id("sky")})`} />
        <circle cx={620} cy={220} r="260" fill={t.light} opacity="0.12" filter={`url(#${id("blur")})`} />
        <g transform="translate(9 -5)" fill={t.light} opacity="0.55" filter={`url(#${id("soft")})`}>
          <path d={sil} />
          <ellipse cx={400 + dx} cy="332" rx="96" ry="122" />
          <rect x={362 + dx} y="420" width="76" height="130" />
        </g>
        <g fill={t.dark}>
          <path d={sil} />
          <ellipse cx={400 + dx} cy="332" rx="96" ry="122" />
          <rect x={362 + dx} y="420" width="76" height="130" />
        </g>
      </>
    );
  },

  strata: ({ t, r, id }) => {
    const bands = [];
    let y = 0;
    let i = 0;
    while (y < 820) {
      const h = 24 + r() * 90;
      const k = r();
      bands.push(<rect key={i} x="-40" y={y} width="880" height={h + 2} fill={mixHex(mixHex(t.mid, t.b, k), t.light, k * k * 0.5)} />);
      y += h;
      i++;
    }
    return (
      <>
        <g filter={`url(#${id("warp")})`}>{bands}</g>
        {[180, 420, 610].map((x, k) => (
          <rect key={k} x={x + r() * 40} y="0" width="1.5" height="800" fill={t.dark} opacity="0.18" />
        ))}
        <rect width="800" height="800" fill={`url(#${id("side")})`} opacity="0.55" />
      </>
    );
  },

  horizon: ({ t, r, id }) => {
    const hz = 460 + r() * 80;
    const sx = 260 + r() * 300;
    return (
      <>
        <rect width="800" height={hz} fill={`url(#${id("sky")})`} />
        <circle cx={sx} cy={hz - 60} r="110" fill={t.light} opacity="0.45" filter={`url(#${id("blur")})`} />
        <circle cx={sx} cy={hz - 60} r="38" fill={t.light} />
        {[0, 1, 2].map((k) => (
          <rect key={k} y={hz - 110 + k * 36} width="800" height="10" fill={t.light} opacity={0.06 + k * 0.03} filter={`url(#${id("soft")})`} />
        ))}
        <rect y={hz} width="800" height={800 - hz} fill={`url(#${id("ground")})`} />
        <rect x={sx - 26} y={hz} width="52" height={800 - hz} fill={t.light} opacity="0.2" filter={`url(#${id("blur")})`} />
        <rect y={hz} width="800" height="1.5" fill={t.light} opacity="0.5" />
      </>
    );
  },

  window: ({ t, r, id }) => {
    const fl = 500 + r() * 40;
    const skew = 180 + r() * 80;
    const cells = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const y0 = fl + 40 + row * 110;
        const y1 = y0 + 96;
        const x0 = 260 + col * 92 + (row * skew) / 2.4;
        const x1 = x0 + 80;
        const sk = (y1 - y0) * (skew / 260);
        cells.push(<polygon key={`${row}${col}`} points={`${x0},${y0} ${x1},${y0} ${x1 + sk},${y1} ${x0 + sk},${y1}`} />);
      }
    }
    return (
      <>
        <rect width="800" height={fl} fill={t.b} />
        <rect y={fl} width="800" height={800 - fl} fill={`url(#${id("ground")})`} />
        <rect x="80" y="120" width="170" height="300" fill={t.light} opacity="0.85" />
        <g fill={t.dark}>
          <rect x="162" y="120" width="6" height="300" />
          <rect x="80" y="266" width="170" height="6" />
        </g>
        <rect x="60" y="100" width="210" height="340" fill={t.light} opacity="0.25" filter={`url(#${id("blur")})`} />
        <g fill={t.light} opacity="0.5" filter={`url(#${id("soft")})`}>
          {cells}
        </g>
      </>
    );
  },

  columns: ({ t, r, id }) => {
    const cols = [];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const s = 1 - i * 0.1;
      const x = 60 + i * 128 + (r() - 0.5) * 10;
      const w = 64 * s;
      const top = 110 + i * 22;
      const bottom = 700 - i * 18;
      cols.push(
        <g key={i}>
          <polygon points={`${x + w},${bottom} ${x + w + 30},${bottom} ${x + w + 250 * s},800 ${x + w + 130 * s},800`} fill={t.dark} opacity="0.35" />
          <rect x={x} y={top} width={w} height={bottom - top} fill={t.mid} />
          <rect x={x} y={top} width={w * 0.28} height={bottom - top} fill={t.light} opacity="0.35" />
        </g>,
      );
    }
    return (
      <>
        <rect width="800" height="800" fill={`url(#${id("spot")})`} />
        <rect y="690" width="800" height="110" fill={t.mid} opacity="0.45" />
        {cols}
      </>
    );
  },
};

type PlateProps = PlateSpec & {
  className?: string;
  grain?: boolean;
  title?: string;
};

function PlateImpl({ kind, tone, seed = 1, className, grain = false, title }: PlateProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => `${uid}${s}`;
  const t = TONES[tone];
  const r = rng(seed * 7919 + kind.length * 131);

  return (
    <svg
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset="1" stopColor={mixHex(t.b, t.light, 0.35)} />
        </linearGradient>
        <linearGradient id={id("ground")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.mid} />
          <stop offset="1" stopColor={t.dark} />
        </linearGradient>
        <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixHex(t.mid, t.light, 0.3)} />
          <stop offset="1" stopColor={t.dark} />
        </linearGradient>
        <linearGradient id={id("side")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={t.dark} stopOpacity="0" />
          <stop offset="1" stopColor={t.dark} stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor={t.light} />
          <stop offset="0.35" stopColor={mixHex(t.light, t.mid, 0.5)} />
          <stop offset="1" stopColor={t.mid} />
        </radialGradient>
        <radialGradient id={id("spot")} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor={mixHex(t.b, t.light, 0.55)} />
          <stop offset="1" stopColor={t.a} />
        </radialGradient>
        <radialGradient id={id("vig")} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
        <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id={id("soft")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={id("warp")}>
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="3" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="46" />
        </filter>
        {grain && (
          <filter id={id("grain")}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
      </defs>
      {compositions[kind]({ t, r, id })}
      {grain && <rect width="800" height="800" filter={`url(#${id("grain")})`} opacity="0.2" style={{ mixBlendMode: "overlay" }} />}
      <rect width="800" height="800" fill={`url(#${id("vig")})`} />
    </svg>
  );
}

export const Plate = memo(PlateImpl);

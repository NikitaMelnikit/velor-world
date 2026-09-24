"use client";

import { memo, useEffect, useId, useRef, type SVGProps } from "react";
import type { Part, Product, ProductVariant } from "@/content/types";
import { partCenterY, productBounds } from "@/content/products";
import { MAT_COLORS } from "@/lib/palette";
import { cn, mixHex } from "@/lib/utils";

/**
 * Front elevation generated from the same part data that builds the 3D
 * object. One source of truth feeds sketches, blueprints, dimension
 * drawings, hotspot maps and the Atelier process — so they always agree.
 */

export type DrawingMode = "sketch" | "line" | "solid";

type Marker = { id: string; part: string; label: string };

type Props = {
  product: Product;
  mode?: DrawingMode;
  explode?: number;
  variant?: ProductVariant;
  dims?: boolean;
  highlight?: string | null;
  /** Show hidden parts (dashed) in line mode. */
  xray?: boolean;
  /** Animate strokes in when the drawing enters the viewport. */
  draw?: boolean;
  /** Fraction of parts rendered — for deliberately unfinished drawings. */
  partial?: number;
  markers?: Marker[];
  activeMarker?: string | null;
  onMarker?: (id: string) => void;
  className?: string;
};

const S = 100;
const RIGHT = Math.PI / 2;
const isRight = (a = 0) => Math.abs(Math.abs(a) - RIGHT) < 0.01;

function shape(p: Part, e: number, props: SVGProps<SVGElement>) {
  const x = (p.pos[0] + p.explode[0] * e) * S;
  const yc = (partCenterY(p) + p.explode[1] * e) * S;
  const [rx = 0, , rz = 0] = p.rot ?? [];
  const g = p.geo;
  const common = props as Record<string, unknown>;

  switch (g.t) {
    case "cyl": {
      if (isRight(rx)) return <circle cx={x} cy={-yc} r={g.r * S} {...common} />;
      if (isRight(rz)) return <rect x={x - (g.h / 2) * S} y={-yc - g.r * S} width={g.h * S} height={g.r * 2 * S} {...common} />;
      const rt = g.r * S;
      const rb = (g.r2 ?? g.r) * S;
      const hh = (g.h / 2) * S;
      return <polygon points={`${x - rt},${-yc - hh} ${x + rt},${-yc - hh} ${x + rb},${-yc + hh} ${x - rb},${-yc + hh}`} {...common} />;
    }
    case "box": {
      let hw = (g.w / 2) * S;
      let hh = ((g.h * Math.cos(rx) + g.d * Math.abs(Math.sin(rx))) / 2) * S;
      if (isRight(rz)) [hw, hh] = [hh, hw];
      return <rect x={x - hw} y={-yc - hh} width={hw * 2} height={hh * 2} rx={(g.r ?? 0) * S} {...common} />;
    }
    case "sphere":
      return <circle cx={x} cy={-yc} r={g.r * S} {...common} />;
    case "torus": {
      const R = (g.r + g.tube) * S;
      if (isRight(rx)) return <rect x={x - R} y={-yc - g.tube * S} width={R * 2} height={g.tube * 2 * S} rx={g.tube * S} {...common} />;
      return <circle cx={x} cy={-yc} r={g.r * S} {...common} />;
    }
    case "lathe": {
      const y0 = p.pos[1] + p.explode[1] * e;
      const right = g.pts.map(([r, y]) => `${x + r * S},${-(y0 + y) * S}`);
      const left = [...g.pts].reverse().map(([r, y]) => `${x - r * S},${-(y0 + y) * S}`);
      return <polygon points={[...right, ...left].join(" ")} {...common} />;
    }
  }
}

const order = { inner: 0, core: 1, shell: 2 } as const;

function ElevationDrawingImpl({
  product,
  mode = "line",
  explode = 0,
  variant,
  dims = false,
  highlight = null,
  xray = false,
  draw = false,
  partial = 1,
  markers,
  activeMarker,
  onMarker,
  className,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!draw || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-drawn");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [draw]);

  const b = productBounds(product, explode);
  const pad = 0.28 + (dims ? 0.22 : 0);
  const vb = [(b.minX - pad) * S, -(b.maxY + pad) * S, (b.w + pad * 2) * S, (b.h + pad * 2) * S];

  const parts = [...product.parts]
    .filter((p) => (p.layer === "inner" ? xray || explode > 0.05 || mode === "line" : true))
    .sort((a, c) => order[a.layer] - order[c.layer]);
  const visible = parts.slice(0, Math.max(1, Math.round(parts.length * partial)));

  const drawProps = draw ? { pathLength: 1, className: "stroke-draw" } : {};
  // Stroke widths live in user space (≈1px at typical display sizes). Screen-space
  // strokes (vector-effect) would break pathLength-based line drawing in Chrome.
  const unit = Math.max(vb[2], vb[3]) / 480;
  const sketch = mode === "sketch";

  return (
    <svg
      ref={ref}
      viewBox={vb.join(" ")}
      className={cn("h-full w-full overflow-visible", className)}
      role="img"
      aria-label={`${product.name} — ${mode === "solid" ? "elevation" : "technical drawing"}`}
    >
      {sketch && (
        <defs>
          <filter id={`${uid}rough`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="3.2" />
          </filter>
        </defs>
      )}

      {/* construction lines */}
      {(sketch || mode === "line") && (
        <g stroke="currentColor" strokeWidth={unit} opacity={sketch ? 0.18 : 0.14}>
          <line x1={vb[0]} x2={vb[0] + vb[2]} y1={-b.minY * S} y2={-b.minY * S} />
          {mode === "line" && (
            <line x1={0} x2={0} y1={vb[1]} y2={vb[1] + vb[3]} strokeDasharray="14 4 2 4" />
          )}
          {sketch &&
            visible.map((p) => {
              const yc = (partCenterY(p) + p.explode[1] * explode) * S;
              return <line key={p.id} x1={vb[0]} x2={vb[0] + vb[2]} y1={-yc} y2={-yc} opacity="0.5" />;
            })}
        </g>
      )}

      <g filter={sketch ? `url(#${uid}rough)` : undefined}>
        {visible.map((p) => {
          const mat = variant?.map[p.mat] ?? p.mat;
          const hl = highlight === p.id;
          const hidden = p.layer === "inner" && explode < 0.05;
          const fill = mode === "solid" ? MAT_COLORS[mat] : "none";
          const stroke = mode === "solid" ? mixHex(MAT_COLORS[mat], "#000000", 0.45) : "currentColor";
          return (
            <g key={p.id} opacity={hidden ? 0.45 : 1}>
              {shape(p, explode, {
                fill,
                stroke,
                strokeWidth: unit * (hl ? 2.4 : sketch ? 1.35 : 1),
                strokeDasharray: hidden && !draw ? "5 4" : undefined,
                strokeLinejoin: "round",
                ...drawProps,
              })}
              {sketch && shape({ ...p, pos: [p.pos[0] + 0.006, p.pos[1] - 0.004, p.pos[2]] }, explode, {
                fill: "none",
                stroke: "currentColor",
                strokeWidth: unit * 0.7,
                opacity: 0.45,
                ...drawProps,
              })}
            </g>
          );
        })}
      </g>

      {dims && (
        <g stroke="currentColor" fill="currentColor" strokeWidth={unit}>
          {(() => {
            const y = -(b.minY - 0.16) * S;
            const x = (b.maxX + 0.16) * S;
            const fs = Math.max(b.w, b.h) * 4.2;
            return (
              <>
                <line x1={b.minX * S} x2={b.maxX * S} y1={y} y2={y} {...drawProps} />
                <line x1={b.minX * S} x2={b.minX * S} y1={y - unit * 8} y2={y + unit * 8} />
                <line x1={b.maxX * S} x2={b.maxX * S} y1={y - unit * 8} y2={y + unit * 8} />
                <text x={b.cx * S} y={y + fs * 1.4} textAnchor="middle" fontSize={fs} stroke="none" fontFamily="var(--font-mono)" letterSpacing="1">
                  {product.dims.w} MM
                </text>
                <line x1={x} x2={x} y1={-b.maxY * S} y2={-b.minY * S} {...drawProps} />
                <line x1={x - unit * 8} x2={x + unit * 8} y1={-b.maxY * S} y2={-b.maxY * S} />
                <line x1={x - unit * 8} x2={x + unit * 8} y1={-b.minY * S} y2={-b.minY * S} />
                <text
                  x={x + fs * 1.2}
                  y={-b.cy * S}
                  textAnchor="middle"
                  fontSize={fs}
                  stroke="none"
                  fontFamily="var(--font-mono)"
                  letterSpacing="1"
                  transform={`rotate(90 ${x + fs * 1.2} ${-b.cy * S})`}
                >
                  {product.dims.h} MM
                </text>
              </>
            );
          })()}
        </g>
      )}

      {markers?.map((m) => {
        const p = product.parts.find((q) => q.id === m.part);
        if (!p) return null;
        const cx = (p.pos[0] + p.explode[0] * explode) * S;
        const cy = -(partCenterY(p) + p.explode[1] * explode) * S;
        const r = Math.max(b.w, b.h) * 5.2;
        const active = activeMarker === m.id;
        return (
          <g
            key={m.id}
            role="button"
            tabIndex={0}
            aria-label={m.label}
            data-cursor="Detail"
            onClick={() => onMarker?.(m.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onMarker?.(m.id)}
            className="cursor-pointer outline-none"
          >
            <circle cx={cx} cy={cy} r={r * 2.2} fill="transparent" />
            <circle cx={cx} cy={cy} r={r * (active ? 1.35 : 1)} fill={active ? "var(--color-brass)" : "currentColor"} opacity={active ? 1 : 0.9} />
            <circle cx={cx} cy={cy} r={r * 2} fill="none" stroke="currentColor" strokeWidth={unit} opacity="0.5">
              <animate attributeName="r" values={`${r * 1.2};${r * 2.6};${r * 1.2}`} dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

export const ElevationDrawing = memo(ElevationDrawingImpl);

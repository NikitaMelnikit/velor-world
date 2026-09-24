"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ObjectViewerProps } from "./ObjectViewer";
import { WebGLGate } from "./WebGLGate";
import { ElevationDrawing } from "@/components/media/ElevationDrawing";
import { cn, isPositioned } from "@/lib/utils";

export type { ViewerApi } from "./ObjectViewer";

/** Static stand-in: shown while three.js streams in, and whenever WebGL is unavailable. */
function ViewerFallback({ product, variant, explode = 0 }: ObjectViewerProps) {
  return (
    <div className="grid h-full w-full place-items-center" style={{ color: product.env.fg }}>
      <div className="h-[58%] w-[58%] opacity-90">
        <ElevationDrawing product={product} variant={variant} mode="solid" explode={explode} />
      </div>
    </div>
  );
}

const ObjectViewer = dynamic(() => import("./ObjectViewer"), { ssr: false, loading: () => null });

/**
 * The reusable interactive object viewer — lazy-loaded, GPU-gated, with a
 * drawn fallback that crossfades away once the WebGL scene is live.
 */
export function LazyObjectViewer({ className, ...props }: ObjectViewerProps) {
  const [ready, setReady] = useState(false);
  const fallback = <ViewerFallback {...props} />;
  return (
    <div className={cn(!isPositioned(className) && "relative", className)}>
      <div className={cn("pointer-events-none absolute inset-0 transition-opacity duration-700", ready && "opacity-0")}>{fallback}</div>
      <WebGLGate fallback={null}>
        <ObjectViewer {...props} className="absolute inset-0" onReady={() => setReady(true)} />
      </WebGLGate>
    </div>
  );
}

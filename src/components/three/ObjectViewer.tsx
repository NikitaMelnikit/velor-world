"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Html, Lightformer, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Part, Product, ProductEnv, ProductVariant } from "@/content/types";
import { partCenterY, productBounds } from "@/content/products";
import { getGhost, getMaterial, getShadowTexture } from "./materials";
import { useReducedMotion } from "@/hooks";
import { pulse } from "@/lib/pulse";

export type ViewerApi = { zoom: (dir: 1 | -1) => void; reset: () => void };

export type ObjectViewerProps = {
  product: Product;
  variant?: ProductVariant;
  /** Static disassembly target 0..1. */
  explode?: number;
  /** Live disassembly target (e.g. scroll-driven), read every frame. */
  explodeRef?: RefObject<number>;
  xray?: boolean;
  interactive?: boolean;
  autoRotate?: boolean;
  hotspots?: boolean;
  activeHotspot?: string | null;
  onHotspot?: (id: string) => void;
  labels?: boolean;
  leaving?: boolean;
  apiRef?: RefObject<ViewerApi | null>;
  className?: string;
  /** Camera distance multiplier. */
  distance?: number;
  onReady?: () => void;
};

const damp = THREE.MathUtils.damp;

function geometryFor(p: Part): THREE.BufferGeometry {
  const g = p.geo;
  switch (g.t) {
    case "cyl":
      return new THREE.CylinderGeometry(g.r, g.r2 ?? g.r, g.h, 72, 1, !!g.open);
    case "box":
      return g.r ? new RoundedBoxGeometry(g.w, g.h, g.d, 4, g.r) : new THREE.BoxGeometry(g.w, g.h, g.d);
    case "sphere":
      return new THREE.SphereGeometry(g.r, 48, 32);
    case "torus":
      return new THREE.TorusGeometry(g.r, g.tube, 24, 96);
    case "lathe":
      return new THREE.LatheGeometry(
        g.pts.map(([x, y]) => new THREE.Vector2(x, y)),
        96,
      );
  }
}

/* ───────────────────────── Model ───────────────────────── */

type ModelProps = Required<Pick<ObjectViewerProps, "product">> &
  Pick<ObjectViewerProps, "variant" | "explode" | "explodeRef" | "xray" | "hotspots" | "activeHotspot" | "onHotspot" | "labels" | "leaving"> & {
    /** Self-rotation for non-interactive viewers (controls are disabled there). */
    spin?: boolean;
  };

function Model({ product, variant, explode = 0, explodeRef, xray, hotspots, activeHotspot, onHotspot, labels, leaving, spin }: ModelProps) {
  const reduced = useReducedMotion();
  const root = useRef<THREE.Group>(null);
  const partRefs = useRef<(THREE.Group | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const e = useRef<number | null>(null);
  const appear = useRef(reduced ? 1 : 0);
  const turn = useRef(0);

  const geos = useMemo(() => product.parts.map(geometryFor), [product]);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  const b0 = useMemo(() => productBounds(product, 0), [product]);
  const b1 = useMemo(() => productBounds(product, 1), [product]);
  // Fit the object to the visible frustum — tall canvases and wide canvases alike.
  const viewport = useThree((s) => s.viewport);
  const baseScale = Math.min((viewport.height * 0.55) / b0.h, (viewport.width * 0.64) / b0.w);

  useFrame((state, dt) => {
    const target = explodeRef?.current ?? explode;
    e.current = reduced || e.current === null ? target : damp(e.current, target, 5, dt);
    appear.current = reduced ? (leaving ? 0 : 1) : damp(appear.current, leaving ? 0 : 1, leaving ? 9 : 3.2, dt);
    const ex = e.current;
    const a = appear.current;

    product.parts.forEach((p, i) => {
      const g = partRefs.current[i];
      if (!g) return;
      g.position.set(p.pos[0] + p.explode[0] * ex, p.pos[1] + p.explode[1] * ex, p.pos[2] + p.explode[2] * ex);
      g.visible = p.layer !== "inner" || !!xray || ex > 0.03;
      const l = labelRefs.current[i];
      if (l) l.style.opacity = String(THREE.MathUtils.clamp((ex - 0.35) * 2.5, 0, 1));
    });

    if (root.current) {
      const s = (baseScale / (1 + ex * 0.5)) * (0.7 + 0.3 * a);
      const cx = THREE.MathUtils.lerp(b0.cx, b1.cx, ex);
      const cy = THREE.MathUtils.lerp(b0.cy, b1.cy, ex);
      root.current.scale.setScalar(s);
      root.current.position.set(-cx * s, -cy * s - (1 - a) * 0.6, 0);
      if (spin && !reduced) turn.current += dt * 0.22;
      root.current.rotation.y = (1 - a) * -0.9 + turn.current + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.25) * 0.02);
      root.current.visible = a > 0.02;
    }
  });

  return (
    <group ref={root}>
      {product.parts.map((p, i) => {
        const mat = variant?.map[p.mat] ?? p.mat;
        const ghost = xray && p.layer === "shell";
        const hot = product.hotspots.find((h) => h.part === p.id);
        const active = hot && activeHotspot === hot.id;
        return (
          <group
            key={p.id}
            ref={(el) => {
              partRefs.current[i] = el;
            }}
            position={p.pos}
          >
            <mesh geometry={geos[i]} rotation={p.rot ?? [0, 0, 0]} material={ghost ? getGhost(product.env.fg) : getMaterial(mat)} renderOrder={ghost ? 2 : 0}>
              {(ghost || active) && <Edges threshold={20} color={active ? product.env.accent : product.env.fg} />}
            </mesh>
            {hotspots && hot && (
              <Html position={[0, partCenterY(p) - p.pos[1], 0.02]} center zIndexRange={[30, 0]}>
                <button
                  type="button"
                  data-cursor="Detail"
                  aria-label={hot.title}
                  onClick={() => {
                    onHotspot?.(hot.id);
                    pulse.emit({ strength: 0.4, kind: "tap" });
                  }}
                  className="group relative grid size-7 place-items-center"
                >
                  <span
                    className="absolute inset-0 rounded-full border opacity-60"
                    style={{ borderColor: product.env.fg, animation: "breathe 2.4s ease-in-out infinite" }}
                  />
                  <span className="size-2 rounded-full transition-transform group-hover:scale-150" style={{ background: active ? product.env.accent : product.env.fg }} />
                </button>
              </Html>
            )}
            {labels && (
              <Html position={[0, partCenterY(p) - p.pos[1], 0]} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
                <div
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  className="t-label flex items-center gap-2 whitespace-nowrap pl-3 opacity-0"
                  style={{ color: product.env.fg }}
                >
                  <span className="h-px w-8 opacity-50" style={{ background: product.env.fg }} />
                  <span className="opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <span>{p.label}</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ───────────────────────── Scene furniture ───────────────────────── */

function Lights({ env }: { env: ProductEnv }) {
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const targetKey = useMemo(() => new THREE.Color(env.key), [env.key]);
  const targetFill = useMemo(() => new THREE.Color(env.fill), [env.fill]);
  useFrame((_, dt) => {
    key.current?.color.lerp(targetKey, Math.min(1, dt * 2.5));
    fill.current?.color.lerp(targetFill, Math.min(1, dt * 2.5));
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={key} position={[3, 5, 4]} intensity={2.4} color={env.key} />
      <directionalLight ref={fill} position={[-4, 1.5, -3]} intensity={0.9} color={env.fill} />
    </>
  );
}

function Shadow() {
  const tex = useMemo(() => getShadowTexture(), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.2, 0]} renderOrder={-1}>
      <planeGeometry args={[3.6, 3.6]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

function ControlsApi({ apiRef, controls }: { apiRef?: RefObject<ViewerApi | null>; controls: RefObject<OrbitControlsImpl | null> }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (!apiRef) return;
    const c = controls.current;
    c?.saveState();
    apiRef.current = {
      zoom: (dir) => {
        const ctl = controls.current;
        if (!ctl) return;
        const offset = camera.position.clone().sub(ctl.target);
        const len = THREE.MathUtils.clamp(offset.length() * (dir > 0 ? 0.82 : 1.2), ctl.minDistance, ctl.maxDistance);
        camera.position.copy(ctl.target).add(offset.setLength(len));
        ctl.update();
      },
      reset: () => controls.current?.reset(),
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, camera, controls]);
  return null;
}

/* ───────────────────────── Viewer ───────────────────────── */

export default function ObjectViewer(props: ObjectViewerProps) {
  const { product, interactive = false, autoRotate = false, apiRef, className, distance = 1 } = props;
  const reduced = useReducedMotion();
  const [dpr, setDpr] = useState(1.6);
  const [visible, setVisible] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const controls = useRef<OrbitControlsImpl>(null);

  // Stop rendering entirely when the canvas is off-screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const env = product.env;

  return (
    <div
      ref={wrap}
      className={className}
      style={{ touchAction: interactive ? "none" : "pan-y", pointerEvents: interactive || props.hotspots ? "auto" : "none" }}
      data-cursor={interactive ? "Drag" : undefined}
    >
      <Canvas
        dpr={[1, dpr]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.4, 7.2 * distance], fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: interactive || props.hotspots ? "auto" : "none" }}
        onCreated={() => props.onReady?.()}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
        <Lights env={env} />
        <Suspense fallback={null}>
          <Environment key={env.name} resolution={128} frames={1}>
            <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} color={env.key} />
            <Lightformer form="rect" intensity={1.6} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} color={env.fill} />
            <Lightformer form="rect" intensity={1.2} position={[5, 0.5, -1]} rotation-y={-Math.PI / 2} scale={[6, 0.6, 1]} color={env.key} />
            <Lightformer form="ring" intensity={1.4} position={[2, 2, 5]} scale={2} color={env.accent} />
            <Lightformer form="rect" intensity={0.5} position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color={env.bg} />
          </Environment>
        </Suspense>
        <Model key={product.slug} {...props} spin={autoRotate && !interactive} />
        <Shadow />
        <OrbitControls
          ref={controls}
          makeDefault
          enabled={interactive}
          enablePan={false}
          enableZoom={interactive}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          minDistance={3.2}
          maxDistance={12}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 1.85}
          autoRotate={autoRotate && !reduced}
          autoRotateSpeed={0.55}
          onStart={() => pulse.emit({ strength: 0.15, kind: "hover" })}
        />
        <ControlsApi apiRef={apiRef} controls={controls} />
      </Canvas>
    </div>
  );
}

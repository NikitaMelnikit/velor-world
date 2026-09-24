"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { rng } from "@/lib/utils";

/**
 * The entry: a colonnade of monoliths receding into fog, a floating slab,
 * and seven lit apertures at the end. Scroll moves the camera through it;
 * the pointer turns the head.
 */

type Props = {
  progress: RefObject<number>;
  pointer: RefObject<{ x: number; y: number }>;
  lite?: boolean;
  onReady?: () => void;
};

const SPACING = 6.5;
const COUNT = 14;
const END_Z = -92;

function Colonnade() {
  const slabs = useRef<THREE.InstancedMesh>(null);
  const beams = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < COUNT; i++) {
      const z = -i * SPACING;
      [-7.2, 7.2].forEach((x, k) => {
        m.compose(new THREE.Vector3(x, 8, z), q, s);
        slabs.current?.setMatrixAt(i * 2 + k, m);
      });
      m.compose(new THREE.Vector3(0, 15.6, z - SPACING / 2), q, s);
      beams.current?.setMatrixAt(i, m);
    }
    if (slabs.current) slabs.current.instanceMatrix.needsUpdate = true;
    if (beams.current) beams.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={slabs} args={[undefined, undefined, COUNT * 2]} frustumCulled={false}>
        <boxGeometry args={[1.5, 16, 3.4]} />
        <meshStandardMaterial color="#35322d" roughness={0.88} metalness={0.04} />
      </instancedMesh>
      <instancedMesh ref={beams} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[16, 0.9, 1.1]} />
        <meshStandardMaterial color="#26241f" roughness={0.95} />
      </instancedMesh>
    </>
  );
}

function gradientTexture(stops: [number, string][], w = 4, h = 256) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Shafts() {
  const tex = useMemo(
    () =>
      gradientTexture([
        [0, "rgba(255,238,210,0.0)"],
        [0.15, "rgba(255,238,210,0.55)"],
        [1, "rgba(255,238,210,0.0)"],
      ]),
    [],
  );
  const zs = [-9, -29, -48, -67];
  return (
    <>
      {zs.map((z, i) => (
        <mesh key={z} position={[i % 2 ? 2.2 : -1.6, 7.5, z]} rotation={[0, 0, i % 2 ? -0.32 : 0.28]}>
          <planeGeometry args={[2.6, 18]} />
          <meshBasicMaterial map={tex} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function Monolith() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.08;
    ref.current.position.y = 5.4 + Math.sin(s.clock.elapsedTime * 0.5) * 0.25;
  });
  return (
    <mesh ref={ref} position={[0, 5.4, -36]}>
      <boxGeometry args={[2.1, 8.6, 0.45]} />
      <meshStandardMaterial color="#0d0d0c" roughness={0.18} metalness={0.9} />
    </mesh>
  );
}

function Threshold() {
  const glow = useMemo(
    () =>
      gradientTexture(
        [
          [0, "rgba(255,244,222,0)"],
          [0.5, "rgba(255,236,204,0.9)"],
          [1, "rgba(255,244,222,0)"],
        ],
        256,
        256,
      ),
    [],
  );
  const slits = Array.from({ length: 7 }, (_, i) => -6.6 + i * 2.2);
  return (
    <group position={[0, 0, END_Z]}>
      {/* The wall, with an opening */}
      <mesh position={[0, 8, -0.6]}>
        <boxGeometry args={[40, 20, 1]} />
        <meshStandardMaterial color="#141311" roughness={0.95} />
      </mesh>
      {slits.map((x, i) => (
        <group key={i} position={[x, 3.8, 0]}>
          <mesh>
            <planeGeometry args={[0.55, 7.2]} />
            <meshBasicMaterial color={i === 3 ? "#fff6e6" : "#f0dfbf"} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.05]} scale={[3.2, 1.25, 1]}>
            <planeGeometry args={[0.55, 7.2]} />
            <meshBasicMaterial map={glow} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
      {/* light spilled on the floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 6]}>
        <planeGeometry args={[18, 14]} />
        <meshBasicMaterial map={glow} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    const r = rng(1400);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (r() - 0.5) * 13;
      a[i * 3 + 1] = r() * 14;
      a[i * 3 + 2] = 6 - r() * 100;
    }
    return a;
  }, [count]);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.15) * 0.4;
    ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.05) * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#e6d9bf" transparent opacity={0.5} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function CameraRig({ progress, pointer }: Pick<Props, "progress" | "pointer">) {
  const look = useRef(new THREE.Vector3(0, 4, -20));
  const target = useRef(new THREE.Vector3());
  const eased = useRef(0);

  useFrame(({ camera }, dt) => {
    const p = progress.current ?? 0;
    eased.current = THREE.MathUtils.damp(eased.current, p, 4, dt);
    const e = eased.current;
    // Ease-in-out along the corridor, stopping short of the threshold.
    const k = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
    const z = THREE.MathUtils.lerp(14, END_Z + 11, k);
    const px = pointer.current?.x ?? 0;
    const py = pointer.current?.y ?? 0;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.9, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.4 + Math.sin(e * Math.PI) * 1.4 - py * 0.4, 2.5, dt);
    camera.position.z = z;
    target.current.set(px * 3.2, 3.6 - py * 1.6 - k * 0.2, z - 24);
    look.current.lerp(target.current, Math.min(1, dt * 3));
    camera.lookAt(look.current);
  });
  return null;
}

export default function EntryScene({ progress, pointer, lite = false, onReady }: Props) {
  const [dpr, setDpr] = useState(lite ? 1 : 1.5);
  return (
    <Canvas
      dpr={[1, dpr]}
      camera={{ position: [0, 2.4, 14], fov: 50, near: 0.1, far: 160 }}
      gl={{ antialias: !lite, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <color attach="background" args={["#0c0b0a"]} />
      <fog attach="fog" args={["#1c1a16", 12, 96]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={["#cfc3aa", "#0b0b0a", 0.3]} />
      <directionalLight position={[0, 10, -70]} intensity={2.2} color="#f2d9b0" />
      <directionalLight position={[6, 18, 24]} intensity={0.45} color="#b9c4cc" />
      {[-22, -46, -68].map((z) => (
        <pointLight key={z} position={[0, 14, z]} intensity={42} distance={30} decay={1.7} color="#ffe2b8" />
      ))}
      <pointLight position={[0, 6, END_Z + 8]} intensity={90} distance={44} color="#ffe7c4" />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
        <planeGeometry args={[40, 140]} />
        <meshStandardMaterial color="#151412" roughness={0.82} metalness={0.12} />
      </mesh>
      <Colonnade />
      <Shafts />
      <Monolith />
      <Threshold />
      <Dust count={lite ? 500 : 1400} />
      <CameraRig progress={progress} pointer={pointer} />
    </Canvas>
  );
}

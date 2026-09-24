import * as THREE from "three";
import type { MatKey } from "@/content/types";
import { rng } from "@/lib/utils";

/**
 * Material factory for the object viewer. Surface detail comes from tiny
 * procedural canvas textures (generated once, cached) — no texture downloads.
 */

type TexKind = "grain" | "brushed" | "fibre" | "pores" | "wood";

const texCache = new Map<string, THREE.Texture>();

function canvasTexture(kind: TexKind, seed = 1): THREE.Texture {
  const key = `${kind}:${seed}`;
  const cached = texCache.get(key);
  if (cached) return cached;

  const size = kind === "wood" ? 512 : 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const r = rng(seed * 31 + kind.length);

  if (kind === "wood") {
    const g = ctx.createLinearGradient(0, 0, size, 0);
    g.addColorStop(0, "#b48c62");
    g.addColorStop(1, "#a07650");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 90; i++) {
      const x0 = r() * size;
      ctx.strokeStyle = `rgba(${70 + r() * 30},${45 + r() * 20},${22 + r() * 10},${0.12 + r() * 0.3})`;
      ctx.lineWidth = 0.6 + r() * 2.4;
      ctx.beginPath();
      for (let y = 0; y <= size; y += 8) {
        const x = x0 + Math.sin(y * 0.012 + i) * 6 + Math.sin(y * 0.05 + i * 3) * 1.5;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else {
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      let v = 128;
      if (kind === "grain") v = 110 + r() * 90;
      if (kind === "pores") v = r() > 0.985 ? 20 : 150 + r() * 40;
      if (kind === "fibre") v = 120 + r() * 80;
      if (kind === "brushed") v = 128;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    if (kind === "brushed") {
      for (let i = 0; i < 1400; i++) {
        const y = r() * size;
        ctx.strokeStyle = r() > 0.5 ? `rgba(255,255,255,${r() * 0.35})` : `rgba(0,0,0,${r() * 0.3})`;
        ctx.lineWidth = r() * 0.9;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + (r() - 0.5) * 2);
        ctx.stroke();
      }
    }
    if (kind === "fibre") {
      for (let i = 0; i < 2600; i++) {
        const x = r() * size;
        const y = r() * size;
        const a = r() * Math.PI;
        const l = 2 + r() * 7;
        ctx.strokeStyle = r() > 0.5 ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.22)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(kind === "wood" ? 1 : 3, kind === "wood" ? 1 : 3);
  tex.anisotropy = 4;
  if (kind === "wood") tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
}

const matCache = new Map<string, THREE.Material>();

function build(key: MatKey): THREE.Material {
  const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
  const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);

  switch (key) {
    case "concrete":
    case "concreteDark":
    case "terracotta":
      return std({
        color: key === "concrete" ? "#8e8b85" : key === "concreteDark" ? "#45433f" : "#9a5a43",
        roughness: 0.96,
        metalness: 0,
        bumpMap: canvasTexture("pores", 2),
        bumpScale: 0.6,
        roughnessMap: canvasTexture("grain", 3),
      });
    case "steel":
      return std({ color: "#c9ccce", metalness: 1, roughness: 0.3, bumpMap: canvasTexture("brushed", 4), bumpScale: 0.15 });
    case "blackSteel":
      return std({ color: "#2b2b2b", metalness: 0.85, roughness: 0.42, bumpMap: canvasTexture("brushed", 5), bumpScale: 0.1 });
    case "oxide":
      return std({ color: "#6e3d27", metalness: 0.55, roughness: 0.78, bumpMap: canvasTexture("grain", 6), bumpScale: 0.5 });
    case "brass":
      return std({ color: "#c69c5b", metalness: 1, roughness: 0.26, bumpMap: canvasTexture("brushed", 7), bumpScale: 0.08 });
    case "bronze":
      return std({ color: "#8c6641", metalness: 1, roughness: 0.4 });
    case "oak":
      return std({ map: canvasTexture("wood", 8), color: "#ffffff", roughness: 0.72, metalness: 0 });
    case "walnut":
      return std({ map: canvasTexture("wood", 9), color: "#6b4a36", roughness: 0.68, metalness: 0 });
    case "wool":
    case "woolCharcoal":
    case "felt":
      return phys({
        color: key === "wool" ? "#d9d2c3" : key === "woolCharcoal" ? "#3d3b38" : "#6b6660",
        roughness: 1,
        metalness: 0,
        sheen: 1,
        sheenRoughness: 0.75,
        sheenColor: new THREE.Color(key === "wool" ? "#fff6e6" : "#8c8780"),
        bumpMap: canvasTexture("fibre", 10),
        bumpScale: 0.8,
      });
    case "leather":
      return phys({ color: "#6b4630", roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color("#c89a78"), bumpMap: canvasTexture("grain", 11), bumpScale: 0.25 });
    case "glass":
    case "smokeGlass":
      return phys({
        color: key === "glass" ? "#e9f0f1" : "#3b4042",
        roughness: 0.04,
        metalness: 0,
        transparent: true,
        opacity: key === "glass" ? 0.24 : 0.55,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    case "frosted":
      return phys({
        color: "#f4f1ea",
        roughness: 0.55,
        transparent: true,
        opacity: 0.9,
        emissive: new THREE.Color("#fff1d6"),
        emissiveIntensity: 0.22,
        side: THREE.DoubleSide,
      });
    case "travertine":
    case "basalt":
      return std({
        color: key === "travertine" ? "#d8cbb3" : "#2f2e2c",
        roughness: 0.9,
        bumpMap: canvasTexture("pores", 12),
        bumpScale: 1.2,
      });
    case "light":
      return new THREE.MeshBasicMaterial({ color: "#fff3dc", toneMapped: false });
    case "rubber":
      return std({ color: "#1b1b1b", roughness: 0.92 });
    case "cork":
      return std({ color: "#a7825a", roughness: 1, bumpMap: canvasTexture("pores", 13), bumpScale: 1.5 });
    case "foam":
      return std({ color: "#e6d9b8", roughness: 1, bumpMap: canvasTexture("pores", 14), bumpScale: 0.8 });
    case "ceramic":
      return phys({ color: "#efece6", roughness: 0.32, clearcoat: 0.6 });
  }
}

export function getMaterial(key: MatKey): THREE.Material {
  let m = matCache.get(key);
  if (!m) {
    m = build(key);
    matCache.set(key, m);
  }
  return m;
}

const ghostCache = new Map<string, THREE.Material>();

/** Translucent shell used by X-ray / hidden-details mode. */
export function getGhost(color: string) {
  let m = ghostCache.get(color);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
    ghostCache.set(color, m);
  }
  return m;
}

let shadowTex: THREE.Texture | null = null;

/** Soft radial blob shadow — cheaper than real-time shadows and never stale. */
export function getShadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.5, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}

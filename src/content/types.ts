/* Shared content model. Everything the world renders is typed data. */

export type PlateKind =
  | "arches"
  | "monolith"
  | "shaft"
  | "stairs"
  | "studio"
  | "portrait"
  | "strata"
  | "horizon"
  | "window"
  | "columns";

export type PlateTone = "night" | "dusk" | "bone" | "sand" | "sepia" | "steel" | "ember";

export type PlateSpec = { kind: PlateKind; tone: PlateTone; seed?: number };

export type TextureKind =
  | "concrete"
  | "steel"
  | "glass"
  | "stone"
  | "fabric"
  | "wood"
  | "composite"
  | "paper"
  | "graphite"
  | "plaster"
  | "brass"
  | "wool"
  | "travertine";

/* ───────── Objects ───────── */

export type V3 = [number, number, number];

export type MatKey =
  | "concrete"
  | "concreteDark"
  | "terracotta"
  | "steel"
  | "blackSteel"
  | "oxide"
  | "brass"
  | "bronze"
  | "oak"
  | "walnut"
  | "wool"
  | "woolCharcoal"
  | "felt"
  | "leather"
  | "glass"
  | "smokeGlass"
  | "frosted"
  | "travertine"
  | "basalt"
  | "light"
  | "rubber"
  | "cork"
  | "foam"
  | "ceramic";

export type Geo =
  | { t: "cyl"; r: number; r2?: number; h: number; open?: boolean }
  | { t: "box"; w: number; h: number; d: number; r?: number }
  | { t: "sphere"; r: number }
  | { t: "torus"; r: number; tube: number }
  | { t: "lathe"; pts: [number, number][] };

export type PartGroup = "structure" | "material" | "mechanism" | "internal" | "texture";

export type Part = {
  id: string;
  label: string;
  geo: Geo;
  pos: V3;
  rot?: V3;
  mat: MatKey;
  /** Offset applied at full disassembly. */
  explode: V3;
  /** shell = outer surface, core = visible structure, inner = hidden until x-ray / disassembly. */
  layer: "shell" | "core" | "inner";
  group: PartGroup;
  note: string;
};

export type ProductVariant = { id: string; name: string; swatch: string; map: Partial<Record<MatKey, MatKey>> };

export type Hotspot = { id: string; part: string; title: string; text: string };

export type EnvName = "concrete" | "metal" | "soft" | "light";

export type ProductEnv = {
  name: EnvName;
  label: string;
  bg: string;
  bg2: string;
  fg: string;
  muted: string;
  accent: string;
  /** Key and fill light colours for the WebGL scene. */
  key: string;
  fill: string;
  texture: TextureKind;
};

export type MaterialUse = {
  lab: MaterialSlug;
  name: string;
  role: string;
  props: { density: number; warmth: number; reflectance: number; patina: number };
};

export type Product = {
  slug: string;
  index: string;
  name: string;
  type: string;
  year: number;
  edition: string;
  tagline: string;
  summary: string;
  env: ProductEnv;
  parts: Part[];
  variants: ProductVariant[];
  hotspots: Hotspot[];
  materials: MaterialUse[];
  why: string[];
  shaping: { title: string; text: string; stage: "sketch" | "line" | "solid" | "explode" }[];
  idea: { line: string; body: string };
  specs: { label: string; value: string }[];
  dims: { w: number; h: number; d: number };
  weight: string;
};

/* ───────── Materials ───────── */

export type MaterialSlug = "steel" | "glass" | "stone" | "fabric" | "wood" | "composite";

export type StructurePattern = "texture" | "cells" | "lattice" | "orbit" | "fibres" | "rings";

export type LabMaterial = {
  slug: MaterialSlug;
  code: string;
  name: string;
  spec: string;
  reaction: string;
  texture: TextureKind;
  tone: { bg: string; fg: string; accent: string };
  source: { place: string; coords: string; text: string };
  structure: { mag: string; title: string; text: string; pattern: StructurePattern }[];
  tactility: {
    temperature: number;
    hardness: number;
    density: string;
    weight: number;
    text: string;
    sound: { freq: number; decay: number; type: OscillatorType; label: string };
  };
  application: { text: string; uses: string[]; products: string[] };
};

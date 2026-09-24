import type { Geo, Part, Product } from "./types";

const H = Math.PI / 2;

/* ───────────────────────── 01 — SOLEN ───────────────────────── */

const solen: Product = {
  slug: "solen",
  index: "01",
  name: "SOLEN",
  type: "Table light",
  year: 2023,
  edition: "Series I — 300 pieces",
  tagline: "A lamp that decides where the light should fall.",
  summary:
    "A cast-concrete base, a solid brass arm and an opal glass shade. SOLEN doesn't flood a room — it chooses one surface and gives it everything.",
  env: {
    name: "concrete",
    label: "Concrete room",
    bg: "#86837c",
    bg2: "#5c5953",
    fg: "#0f0f0e",
    muted: "#34322e",
    accent: "#f1ede4",
    key: "#fff0d8",
    fill: "#9aa3ad",
    texture: "concrete",
  },
  parts: [
    { id: "felt", label: "Felt pad", geo: { t: "cyl", r: 0.6, h: 0.02 }, pos: [0, 0.01, 0], mat: "felt", explode: [0, -0.55, 0], layer: "core", group: "texture", note: "Undyed wool felt. Protects the table, softens the landing." },
    { id: "base", label: "Cast base", geo: { t: "cyl", r: 0.62, h: 0.34 }, pos: [0, 0.19, 0], mat: "concrete", explode: [0, -0.28, 0], layer: "shell", group: "material", note: "Fibre-reinforced concrete, one pour. No two bases share a surface." },
    { id: "ballast", label: "Iron ballast", geo: { t: "cyl", r: 0.42, h: 0.18 }, pos: [0, 0.17, 0], mat: "blackSteel", explode: [-1.05, -0.28, 0], layer: "inner", group: "internal", note: "1.8 kg of cast iron, hidden. Stability you feel but never see." },
    { id: "dimmer", label: "Rotary dimmer", geo: { t: "torus", r: 0.07, tube: 0.02 }, pos: [0, 0.62, 0], rot: [H, 0, 0], mat: "blackSteel", explode: [-0.5, 0, 0.2], layer: "core", group: "mechanism", note: "24-detent dimmer. Light in steps you can count." },
    { id: "stem", label: "Brass stem", geo: { t: "cyl", r: 0.032, h: 1.44 }, pos: [0, 1.08, 0], mat: "brass", explode: [0, 0.12, 0], layer: "shell", group: "structure", note: "Turned from solid bar. It darkens where your hand returns." },
    { id: "cable", label: "Core cable", geo: { t: "cyl", r: 0.014, h: 1.44 }, pos: [0, 1.08, 0], mat: "rubber", explode: [-0.5, 0.12, 0], layer: "inner", group: "internal", note: "Silicone-sheathed cable routed through the heart of the stem." },
    { id: "knuckle", label: "Friction knuckle", geo: { t: "sphere", r: 0.075 }, pos: [0, 1.83, 0], mat: "brass", explode: [0, 0.45, 0], layer: "core", group: "mechanism", note: "270° of travel, no springs. Holds wherever you stop." },
    { id: "arm", label: "Cantilever arm", geo: { t: "cyl", r: 0.024, h: 0.74 }, pos: [0.37, 1.83, 0], rot: [0, 0, H], mat: "brass", explode: [0.15, 0.5, 0], layer: "shell", group: "structure", note: "Counterweighted by the base, so the reach never feels precarious." },
    { id: "shade", label: "Opal shade", geo: { t: "cyl", r: 0.09, r2: 0.56, h: 0.3, open: true }, pos: [0.74, 1.68, 0], mat: "frosted", explode: [0.5, 0.75, 0], layer: "shell", group: "material", note: "Hand-blown opal glass, acid-etched inside to kill glare." },
    { id: "led", label: "Light engine", geo: { t: "cyl", r: 0.16, h: 0.05 }, pos: [0.74, 1.79, 0], mat: "light", explode: [0.5, 1.25, 0], layer: "inner", group: "internal", note: "2700K COB, CRI 97. The colour of late afternoon." },
    { id: "diffuser", label: "Prism diffuser", geo: { t: "cyl", r: 0.52, h: 0.012 }, pos: [0.74, 1.55, 0], mat: "frosted", explode: [0.5, 0.3, 0], layer: "core", group: "texture", note: "Micro-prismatic sheet. No hot spot, no visible source." },
  ],
  variants: [
    { id: "raw", name: "Raw concrete", swatch: "#8e8b85", map: {} },
    { id: "charcoal", name: "Charcoal", swatch: "#45433f", map: { concrete: "concreteDark" } },
    { id: "terracotta", name: "Terracotta / bronze", swatch: "#9a5a43", map: { concrete: "terracotta", brass: "bronze" } },
  ],
  hotspots: [
    { id: "h-dimmer", part: "dimmer", title: "24 clicks of light", text: "You don't slide towards brightness — you count your way there. Each detent is a decision." },
    { id: "h-base", part: "base", title: "The tie-hole", text: "A formwork tie-hole is left open on the base. It's where the object admits it was poured." },
    { id: "h-knuckle", part: "knuckle", title: "Friction knuckle", text: "No springs, no screws to lose. Two bronze discs and a precise amount of pressure." },
    { id: "h-shade", part: "shade", title: "Etched opal", text: "You see the glow, never the source. Glare is a design failure, not a lighting one." },
  ],
  materials: [
    { lab: "stone", name: "Fibre concrete", role: "Base · 4.2 kg", props: { density: 0.8, warmth: 0.3, reflectance: 0.08, patina: 0.6 } },
    { lab: "steel", name: "Solid brass", role: "Stem & arm", props: { density: 0.95, warmth: 0.62, reflectance: 0.82, patina: 0.9 } },
    { lab: "glass", name: "Opal glass", role: "Shade", props: { density: 0.5, warmth: 0.42, reflectance: 0.5, patina: 0.05 } },
    { lab: "fabric", name: "Wool felt", role: "Pad", props: { density: 0.15, warmth: 0.95, reflectance: 0, patina: 0.4 } },
  ],
  why: [
    "We kept noticing that most lamps apologise. They are designed to disappear, to be neutral, to fit anywhere. SOLEN was built on the opposite assumption: a light should have an opinion about where it points.",
    "The brief was a single sentence taped to the workshop wall — light one thing well. Everything else followed from it: the weight of the base, the reach of the arm, the twenty-four clicks of the dimmer.",
  ],
  shaping: [
    { title: "Gesture", text: "Forty charcoal sketches of a single motion: a hand reaching across a table to point at something.", stage: "sketch" },
    { title: "Proportion", text: "The arm was cut from 72 to 64 cm after we lived with it for a month. Shorter reach, stronger opinion.", stage: "line" },
    { title: "Mass", text: "The base was poured nine times until its weight felt like an argument rather than an obstacle.", stage: "solid" },
    { title: "Anatomy", text: "Eleven parts. No glue. Every component can be removed, repaired and returned.", stage: "explode" },
  ],
  idea: {
    line: "Light is not a quantity. It is a decision.",
    body: "Anyone can sell lumens. SOLEN is a position on how a room should feel at nine in the evening: one warm pool of light on the table, and the rest of the world allowed to go quiet.",
  },
  specs: [
    { label: "Light source", value: "2700K COB · CRI 97" },
    { label: "Output", value: "620 lm" },
    { label: "Dimming", value: "24-detent rotary" },
    { label: "Base", value: "Fibre concrete · 4.2 kg" },
    { label: "Arm", value: "Solid brass · Ø 24 mm" },
    { label: "Shade", value: "Opal blown glass" },
    { label: "Cable", value: "Silicone · 2.4 m" },
    { label: "Service", value: "Repairable for life" },
  ],
  dims: { w: 480, h: 640, d: 310 },
  weight: "5.1 kg",
};

/* ───────────────────────── 02 — KERF ───────────────────────── */

const kerf: Product = {
  slug: "kerf",
  index: "02",
  name: "KERF",
  type: "Side table",
  year: 2024,
  edition: "Series II — 180 pieces",
  tagline: "One sheet of steel, persuaded.",
  summary:
    "A single 3 mm steel sheet, cut thirty-seven times so it can fold like paper. No welds. The cuts are the design.",
  env: {
    name: "metal",
    label: "Steel room",
    bg: "#16181b",
    bg2: "#2b3035",
    fg: "#e3e6e8",
    muted: "#7d868d",
    accent: "#b9c6cf",
    key: "#eaf2f8",
    fill: "#56626d",
    texture: "steel",
  },
  parts: [
    { id: "top", label: "Top plane", geo: { t: "box", w: 1.3, h: 0.05, d: 1.3 }, pos: [0, 1.125, 0], mat: "steel", explode: [0, 0.6, 0], layer: "shell", group: "structure", note: "A single 3 mm sheet — folded, never welded." },
    { id: "cork", label: "Cork inlay", geo: { t: "box", w: 1.16, h: 0.02, d: 1.16 }, pos: [0, 1.16, 0], mat: "cork", explode: [0, 1.05, 0], layer: "core", group: "texture", note: "Pressed cork. Quiet for glasses, warm for wrists." },
    { id: "sideL", label: "Left fold", geo: { t: "box", w: 0.05, h: 1.08, d: 1.26 }, pos: [-0.625, 0.56, 0], mat: "steel", explode: [-0.6, 0, 0], layer: "shell", group: "structure", note: "Load travels down the plane, not through a joint." },
    { id: "sideR", label: "Right fold", geo: { t: "box", w: 0.05, h: 1.08, d: 1.26 }, pos: [0.625, 0.56, 0], mat: "steel", explode: [0.6, 0, 0], layer: "shell", group: "structure", note: "Mirrored fold, same sheet, same grain direction." },
    { id: "bendL", label: "Kerf bend", geo: { t: "cyl", r: 0.045, h: 1.26 }, pos: [-0.61, 1.1, 0], rot: [H, 0, 0], mat: "steel", explode: [-0.42, 0.42, 0], layer: "core", group: "mechanism", note: "37 cuts, 0.8 mm each. The only place the steel remembers being flat." },
    { id: "bendR", label: "Kerf bend", geo: { t: "cyl", r: 0.045, h: 1.26 }, pos: [0.61, 1.1, 0], rot: [H, 0, 0], mat: "steel", explode: [0.42, 0.42, 0], layer: "core", group: "mechanism", note: "Bend radius R12, formed by hand on a press brake." },
    { id: "brace", label: "Tension brace", geo: { t: "box", w: 1.2, h: 0.1, d: 0.03 }, pos: [0, 0.32, 0], mat: "blackSteel", explode: [0, -0.15, 0.75], layer: "core", group: "structure", note: "Bolted, removable — KERF flat-packs into a box 6 cm deep." },
    { id: "rib", label: "Silencing rib", geo: { t: "box", w: 1.15, h: 0.06, d: 0.04 }, pos: [0, 1.07, 0], mat: "blackSteel", explode: [0, 0.3, -0.65], layer: "inner", group: "internal", note: "Hidden stiffener. Stops the top from ringing like a drum skin." },
    { id: "boltL", label: "Captive bolt", geo: { t: "cyl", r: 0.028, h: 0.08 }, pos: [-0.665, 0.32, 0], rot: [0, 0, H], mat: "brass", explode: [-1.0, -0.1, 0.45], layer: "core", group: "mechanism", note: "Brass captive bolt. Hand-tightened, never lost." },
    { id: "boltR", label: "Captive bolt", geo: { t: "cyl", r: 0.028, h: 0.08 }, pos: [0.665, 0.32, 0], rot: [0, 0, H], mat: "brass", explode: [1.0, -0.1, 0.45], layer: "core", group: "mechanism", note: "Brass captive bolt. The only warm metal on the table." },
    { id: "footL", label: "Rubber glide", geo: { t: "box", w: 0.08, h: 0.025, d: 1.2 }, pos: [-0.625, 0.0125, 0], mat: "rubber", explode: [-0.6, -0.4, 0], layer: "core", group: "texture", note: "Natural rubber glide. Floors stay unscarred." },
    { id: "footR", label: "Rubber glide", geo: { t: "box", w: 0.08, h: 0.025, d: 1.2 }, pos: [0.625, 0.0125, 0], mat: "rubber", explode: [0.6, -0.4, 0], layer: "core", group: "texture", note: "Natural rubber glide." },
  ],
  variants: [
    { id: "brushed", name: "Brushed steel", swatch: "#b8b8b6", map: {} },
    { id: "blackened", name: "Blackened", swatch: "#2b2b2b", map: { steel: "blackSteel", brass: "steel" } },
    { id: "oxide", name: "Oxide", swatch: "#6e3d27", map: { steel: "oxide" } },
  ],
  hotspots: [
    { id: "h-bend", part: "bendL", title: "Thirty-seven cuts", text: "Fewer cuts cracked the steel; more made it soft. Thirty-seven is the number where metal agrees to fold." },
    { id: "h-cork", part: "cork", title: "A quiet surface", text: "Steel rings. Cork doesn't. The inlay makes the table sound like furniture, not a tool." },
    { id: "h-bolt", part: "boltR", title: "Captive bolts", text: "The bolts can't fall out — they're captured in the brace. Designed for people who move house." },
    { id: "h-rib", part: "rib", title: "The silenced ring", text: "A hidden rib under the top kills resonance. You'll never see it, you'll just never hear the table." },
  ],
  materials: [
    { lab: "steel", name: "Stainless steel", role: "Body · 3 mm", props: { density: 0.9, warmth: 0.12, reflectance: 0.78, patina: 0.2 } },
    { lab: "wood", name: "Pressed cork", role: "Top inlay", props: { density: 0.12, warmth: 0.85, reflectance: 0.05, patina: 0.55 } },
    { lab: "steel", name: "Brass", role: "Captive bolts", props: { density: 0.95, warmth: 0.6, reflectance: 0.8, patina: 0.9 } },
    { lab: "composite", name: "Natural rubber", role: "Glides", props: { density: 0.35, warmth: 0.5, reflectance: 0.02, patina: 0.3 } },
  ],
  why: [
    "Steel furniture usually hides how it was made — seams ground away, joints filled, surfaces powder-coated into silence. We wanted the opposite: an object whose method is its ornament.",
    "A kerf is the gap a blade leaves behind. Thirty-seven of them let a rigid sheet remember how to bend. Look closely at the corners and you can read the entire manufacturing process.",
  ],
  shaping: [
    { title: "Paper model", text: "It began as a napkin folded in a café in Porto. The proportions barely changed after that afternoon.", stage: "sketch" },
    { title: "Cut pattern", text: "Fourteen kerf patterns were tested to failure. The winning one is almost boringly regular.", stage: "line" },
    { title: "Fold", text: "Folded by hand on a press brake — one bend per side, under four minutes, no heat.", stage: "solid" },
    { title: "Anatomy", text: "Twelve parts, two bolts per side, and a flat-pack box six centimetres deep.", stage: "explode" },
  ],
  idea: {
    line: "Show the method. Let the process be the ornament.",
    body: "Most objects hide the way they were made, as if making were embarrassing. KERF is proud of its cuts. When you understand how something was made you start to trust it — and trust is how you end up keeping something for a lifetime.",
  },
  specs: [
    { label: "Body", value: "3 mm stainless · brushed" },
    { label: "Top", value: "Pressed cork inlay" },
    { label: "Joints", value: "Brass captive bolts" },
    { label: "Load", value: "120 kg" },
    { label: "Finishes", value: "Brushed / Blackened / Oxide" },
    { label: "Assembly", value: "Tool-free · 2 min" },
    { label: "Packaging", value: "Flat · 60 mm" },
  ],
  dims: { w: 420, h: 460, d: 420 },
  weight: "7.8 kg",
};

/* ───────────────────────── 03 — HALDEN ───────────────────────── */

const halden: Product = {
  slug: "halden",
  index: "03",
  name: "HALDEN",
  type: "Lounge chair",
  year: 2025,
  edition: "Series III — made to order",
  tagline: "A chair that asks you to stay a little longer.",
  summary:
    "Rift-sawn oak, a vegetable-tanned leather suspension and boiled wool. HALDEN is soft where you touch it and severe where you don't.",
  env: {
    name: "soft",
    label: "Warm room",
    bg: "#c2ab8f",
    bg2: "#977b60",
    fg: "#23180f",
    muted: "#6b5540",
    accent: "#7b3f22",
    key: "#ffd6a2",
    fill: "#c7a07c",
    texture: "wool",
  },
  parts: [
    { id: "legFL", label: "Oak leg", geo: { t: "box", w: 0.07, h: 0.5, d: 0.07 }, pos: [-0.6, 0.25, 0.5], mat: "oak", explode: [-0.35, -0.45, 0.35], layer: "shell", group: "structure", note: "Rift-sawn so the grain runs straight down the leg." },
    { id: "legFR", label: "Oak leg", geo: { t: "box", w: 0.07, h: 0.5, d: 0.07 }, pos: [0.6, 0.25, 0.5], mat: "oak", explode: [0.35, -0.45, 0.35], layer: "shell", group: "structure", note: "Rift-sawn so the grain runs straight down the leg." },
    { id: "legBL", label: "Oak leg", geo: { t: "box", w: 0.07, h: 0.5, d: 0.07 }, pos: [-0.6, 0.25, -0.5], mat: "oak", explode: [-0.35, -0.45, -0.35], layer: "shell", group: "structure", note: "Rift-sawn European oak." },
    { id: "legBR", label: "Oak leg", geo: { t: "box", w: 0.07, h: 0.5, d: 0.07 }, pos: [0.6, 0.25, -0.5], mat: "oak", explode: [0.35, -0.45, -0.35], layer: "shell", group: "structure", note: "Rift-sawn European oak." },
    { id: "railL", label: "Side rail", geo: { t: "box", w: 0.07, h: 0.08, d: 1.1 }, pos: [-0.6, 0.52, 0], mat: "oak", explode: [-0.55, -0.1, 0], layer: "core", group: "structure", note: "Mortise and tenon, pinned with oak dowels. No metal in the frame." },
    { id: "railR", label: "Side rail", geo: { t: "box", w: 0.07, h: 0.08, d: 1.1 }, pos: [0.6, 0.52, 0], mat: "oak", explode: [0.55, -0.1, 0], layer: "core", group: "structure", note: "Mortise and tenon, pinned with oak dowels." },
    { id: "postL", label: "Back post", geo: { t: "box", w: 0.07, h: 0.95, d: 0.07 }, pos: [-0.6, 0.98, -0.6], rot: [-0.2, 0, 0], mat: "oak", explode: [-0.55, 0.3, -0.35], layer: "core", group: "structure", note: "Raked at 104° — the angle where people stop talking and start thinking." },
    { id: "postR", label: "Back post", geo: { t: "box", w: 0.07, h: 0.95, d: 0.07 }, pos: [0.6, 0.98, -0.6], rot: [-0.2, 0, 0], mat: "oak", explode: [0.55, 0.3, -0.35], layer: "core", group: "structure", note: "Raked at 104°." },
    { id: "straps", label: "Leather suspension", geo: { t: "box", w: 1.1, h: 0.02, d: 1.0 }, pos: [0, 0.55, 0], mat: "leather", explode: [0, 0.05, 0], layer: "inner", group: "internal", note: "Seven vegetable-tanned straps. The part of the chair that actually holds you." },
    { id: "core", label: "Latex core", geo: { t: "box", w: 1.1, h: 0.14, d: 0.98, r: 0.05 }, pos: [0, 0.68, 0.02], mat: "foam", explode: [0, 0.45, 0.1], layer: "inner", group: "internal", note: "Natural latex in three densities — firm, forgiving, then soft." },
    { id: "seat", label: "Seat cushion", geo: { t: "box", w: 1.26, h: 0.22, d: 1.12, r: 0.09 }, pos: [0, 0.68, 0.02], mat: "wool", explode: [0, 0.9, 0.25], layer: "shell", group: "material", note: "Boiled wool, 780 g/m². Stretched by hand, steamed to fit." },
    { id: "back", label: "Back cushion", geo: { t: "box", w: 1.26, h: 0.7, d: 0.2, r: 0.08 }, pos: [0, 1.1, -0.52], rot: [-0.2, 0, 0], mat: "wool", explode: [0, 0.75, -0.55], layer: "shell", group: "material", note: "Same wool, a softer core. Your back is more honest than you are." },
    { id: "sabotL", label: "Brass sabot", geo: { t: "cyl", r: 0.05, h: 0.04 }, pos: [-0.6, 0.02, 0.5], mat: "brass", explode: [-0.35, -0.85, 0.35], layer: "core", group: "texture", note: "The chair's only jewellery." },
    { id: "sabotR", label: "Brass sabot", geo: { t: "cyl", r: 0.05, h: 0.04 }, pos: [0.6, 0.02, 0.5], mat: "brass", explode: [0.35, -0.85, 0.35], layer: "core", group: "texture", note: "Brass protects the end grain — and quietly marks the front." },
  ],
  variants: [
    { id: "bone", name: "Bone wool / oak", swatch: "#d9d2c3", map: {} },
    { id: "charcoal", name: "Charcoal wool", swatch: "#3d3b38", map: { wool: "woolCharcoal" } },
    { id: "walnut", name: "Walnut / leather", swatch: "#5b3d2a", map: { oak: "walnut", wool: "leather" } },
  ],
  hotspots: [
    { id: "h-back", part: "back", title: "104 degrees", text: "In our tests, 104° was the recline at which people stopped checking their phones. We didn't round it." },
    { id: "h-straps", part: "straps", title: "Suspension, not padding", text: "Seven leather straps move with you. Padding only pretends to." },
    { id: "h-leg", part: "legFR", title: "Rift-sawn oak", text: "Cut radially from the log so the grain is dead straight and the leg will never twist." },
    { id: "h-sabot", part: "sabotR", title: "The only jewellery", text: "Two brass sabots, front legs only. They mark the direction the chair faces the room." },
  ],
  materials: [
    { lab: "wood", name: "Rift-sawn oak", role: "Frame", props: { density: 0.55, warmth: 0.78, reflectance: 0.15, patina: 0.85 } },
    { lab: "fabric", name: "Boiled wool", role: "Upholstery", props: { density: 0.2, warmth: 0.98, reflectance: 0.02, patina: 0.5 } },
    { lab: "fabric", name: "Veg-tan leather", role: "Suspension", props: { density: 0.4, warmth: 0.8, reflectance: 0.2, patina: 1 } },
    { lab: "composite", name: "Natural latex", role: "Core", props: { density: 0.25, warmth: 0.7, reflectance: 0, patina: 0.2 } },
  ],
  why: [
    "Most lounge chairs are designed to be looked at. HALDEN started with a different measurement: the average time a person sits before reaching for their phone. We wanted to double it.",
    "The answer wasn't more padding. It was suspension — leather straps under the cushion that move with you — and a back angle of exactly 104°.",
  ],
  shaping: [
    { title: "Posture", text: "We drew people, not chairs. Two hundred posture studies before a single line of furniture.", stage: "sketch" },
    { title: "Frame", text: "Pure joinery: mortise, tenon, oak dowel. There is no metal anywhere in the structure.", stage: "line" },
    { title: "Upholstery", text: "Boiled wool is stretched by hand, then steamed until it shrinks onto the frame like a second skin.", stage: "solid" },
    { title: "Anatomy", text: "Fourteen parts. The cushions lift off; the frame can be re-oiled on a kitchen table.", stage: "explode" },
  ],
  idea: {
    line: "Comfort is a form of attention.",
    body: "A chair is a proposal about time. Fast chairs get you back on your feet. HALDEN proposes something slower: sit down, stay, notice the light move across the floor.",
  },
  specs: [
    { label: "Frame", value: "Rift-sawn European oak" },
    { label: "Suspension", value: "Veg-tan leather · 7 straps" },
    { label: "Core", value: "Natural latex · 3 densities" },
    { label: "Upholstery", value: "Boiled wool · 780 g/m²" },
    { label: "Seat height", value: "380 mm" },
    { label: "Recline", value: "104°" },
  ],
  dims: { w: 760, h: 780, d: 820 },
  weight: "19 kg",
};

/* ───────────────────────── 04 — VAEL ───────────────────────── */

const vaelBody: [number, number][] = [
  [0.001, 0], [0.3, 0], [0.46, 0.12], [0.55, 0.42], [0.52, 0.78], [0.36, 1.06], [0.22, 1.2], [0.2, 1.26], [0.23, 1.3],
];
const vaelLiner: [number, number][] = [
  [0.001, 0.04], [0.24, 0.04], [0.38, 0.14], [0.45, 0.42], [0.42, 0.76], [0.28, 1.02], [0.17, 1.14],
];

const vael: Product = {
  slug: "vael",
  index: "04",
  name: "VAEL",
  type: "Vessel",
  year: 2026,
  edition: "Series IV — 90 pieces",
  tagline: "A container for light, water, and almost nothing.",
  summary:
    "Free-blown glass on an unfilled travertine foot, closed by a bronze collar. VAEL holds flowers — or nothing at all. Both look intentional.",
  env: {
    name: "light",
    label: "Light room",
    bg: "#ebe8e1",
    bg2: "#d3cfc4",
    fg: "#121211",
    muted: "#6c6860",
    accent: "#a88a5e",
    key: "#ffffff",
    fill: "#d8e2e6",
    texture: "glass",
  },
  parts: [
    { id: "foot", label: "Travertine foot", geo: { t: "cyl", r: 0.46, h: 0.22 }, pos: [0, 0.11, 0], mat: "travertine", explode: [0, -0.5, 0], layer: "shell", group: "material", note: "Unfilled travertine. The holes are the stone breathing." },
    { id: "body", label: "Glass body", geo: { t: "lathe", pts: vaelBody }, pos: [0, 0.22, 0], mat: "glass", explode: [0, 0.1, 0], layer: "shell", group: "material", note: "Free-blown in two gathers. The seam is a record, not a flaw." },
    { id: "liner", label: "Stoneware liner", geo: { t: "lathe", pts: vaelLiner }, pos: [0, 0.22, 0], mat: "ceramic", explode: [1.15, 0.2, 0], layer: "inner", group: "internal", note: "Removable liner: flowers in water, glass stays clear." },
    { id: "collar", label: "Bronze collar", geo: { t: "torus", r: 0.22, tube: 0.028 }, pos: [0, 1.5, 0], rot: [H, 0, 0], mat: "bronze", explode: [0, 0.55, 0], layer: "core", group: "mechanism", note: "Cold-fitted bronze. Holds the lid on a 0.2 mm tolerance." },
    { id: "lid", label: "Stone lid", geo: { t: "cyl", r: 0.19, r2: 0.22, h: 0.07 }, pos: [0, 1.56, 0], mat: "travertine", explode: [0, 0.9, 0], layer: "core", group: "structure", note: "Cut from the same block as the foot." },
    { id: "knob", label: "Bronze knob", geo: { t: "sphere", r: 0.055 }, pos: [0, 1.65, 0], mat: "bronze", explode: [0, 1.25, 0], layer: "core", group: "texture", note: "Lost-wax cast. It closes with a sound you'll learn to recognise." },
  ],
  variants: [
    { id: "clear", name: "Clear / travertine", swatch: "#dfe6e8", map: {} },
    { id: "smoke", name: "Smoke glass", swatch: "#5a5f61", map: { glass: "smokeGlass" } },
    { id: "basalt", name: "Basalt foot", swatch: "#2f2e2c", map: { travertine: "basalt" } },
  ],
  hotspots: [
    { id: "h-body", part: "body", title: "Two breaths", text: "Each body is blown in two gathers. The glassblower's breath sets the final curve — no mould." },
    { id: "h-foot", part: "foot", title: "Unfilled stone", text: "Travertine is usually filled with resin to look perfect. We leave the holes. They're 400,000 years old." },
    { id: "h-collar", part: "collar", title: "0.2 millimetres", text: "The bronze collar is fitted cold. The tolerance is tighter than a sheet of paper." },
    { id: "h-liner", part: "liner", title: "Hidden liner", text: "A stoneware liner sits invisibly inside. Water goes there; the glass stays clear forever." },
  ],
  materials: [
    { lab: "glass", name: "Borosilicate", role: "Body", props: { density: 0.55, warmth: 0.3, reflectance: 0.9, patina: 0.02 } },
    { lab: "stone", name: "Travertine", role: "Foot & lid", props: { density: 0.75, warmth: 0.45, reflectance: 0.15, patina: 0.7 } },
    { lab: "steel", name: "Cast bronze", role: "Collar & knob", props: { density: 0.97, warmth: 0.55, reflectance: 0.65, patina: 1 } },
    { lab: "stone", name: "Stoneware", role: "Liner", props: { density: 0.6, warmth: 0.5, reflectance: 0.3, patina: 0.3 } },
  ],
  why: [
    "A vessel is the oldest designed object there is. Before chairs, before lamps, someone shaped clay around nothing and made a place to keep water. We wanted to return to that gesture — and make the nothing visible.",
    "Glass lets you see the emptiness; travertine gives it a floor; bronze closes it with a sound you'll learn to recognise. Three materials, three temperatures, one quiet object.",
  ],
  shaping: [
    { title: "Breath", text: "Each body is blown in two gathers; the glassblower's breath sets the final curve.", stage: "sketch" },
    { title: "Profile", text: "Nine points define the silhouette. We moved one of them 3 mm and remade everything.", stage: "line" },
    { title: "Weight", text: "The foot weighs exactly what the vessel weighs full of water. It never tips, never looks anchored.", stage: "solid" },
    { title: "Anatomy", text: "Six parts. The liner lifts out; the collar can be re-fitted by hand.", stage: "explode" },
  ],
  idea: {
    line: "Emptiness, designed carefully, is a presence.",
    body: "We designed VAEL empty. Every rendering, every prototype, every photograph — empty. If an object is only beautiful when it's full, it's a container. If it's beautiful empty, it's a presence.",
  },
  specs: [
    { label: "Body", value: "Free-blown borosilicate" },
    { label: "Foot & lid", value: "Unfilled travertine" },
    { label: "Collar", value: "Lost-wax bronze" },
    { label: "Liner", value: "Glazed stoneware" },
    { label: "Capacity", value: "1.6 L" },
    { label: "Each piece", value: "Signed & numbered" },
  ],
  dims: { w: 300, h: 560, d: 300 },
  weight: "3.4 kg",
};

export const products: Product[] = [solen, kerf, halden, vael];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

/* ───────────────────────── Geometry helpers ───────────────────────── */

/** Half extents of a part in its local frame, accounting for the ±90° rotations we use. */
export function partExtents(p: Part): { hw: number; hh: number; hd: number } {
  const g: Geo = p.geo;
  let hw = 0;
  let hh = 0;
  let hd = 0;
  switch (g.t) {
    case "cyl": {
      const r = Math.max(g.r, g.r2 ?? g.r);
      hw = r;
      hh = g.h / 2;
      hd = r;
      break;
    }
    case "box":
      hw = g.w / 2;
      hh = g.h / 2;
      hd = g.d / 2;
      break;
    case "sphere":
      hw = hh = hd = g.r;
      break;
    case "torus":
      hw = hh = g.r + g.tube;
      hd = g.tube;
      break;
    case "lathe": {
      const r = Math.max(...g.pts.map((q) => q[0]));
      const ys = g.pts.map((q) => q[1]);
      hw = hd = r;
      hh = (Math.max(...ys) - Math.min(...ys)) / 2;
      break;
    }
  }
  const [rx, , rz] = p.rot ?? [0, 0, 0];
  if (Math.abs(Math.abs(rz) - Math.PI / 2) < 0.01) [hw, hh] = [hh, hw];
  if (Math.abs(Math.abs(rx) - Math.PI / 2) < 0.01) [hh, hd] = [hd, hh];
  return { hw, hh, hd };
}

/** Vertical centre offset for lathe geometry (lathe grows up from y=0). */
export function partCenterY(p: Part) {
  if (p.geo.t === "lathe") {
    const ys = p.geo.pts.map((q) => q[1]);
    return p.pos[1] + (Math.max(...ys) + Math.min(...ys)) / 2;
  }
  return p.pos[1];
}

export function productBounds(product: Product, explode = 0) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of product.parts) {
    const { hw, hh } = partExtents(p);
    const cx = p.pos[0] + p.explode[0] * explode;
    const cy = partCenterY(p) + p.explode[1] * explode;
    minX = Math.min(minX, cx - hw);
    maxX = Math.max(maxX, cx + hw);
    minY = Math.min(minY, cy - hh);
    maxY = Math.max(maxY, cy + hh);
  }
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

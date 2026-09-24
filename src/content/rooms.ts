import type { PlateSpec } from "./types";

export type RoomId =
  | "home"
  | "world"
  | "origin"
  | "objects"
  | "atelier"
  | "materials"
  | "journal"
  | "archive"
  | "future"
  | "collection";

export type Room = {
  id: RoomId;
  index: string;
  name: string;
  href: string;
  line: string;
  description: string;
  plate: PlateSpec;
  /** Position on the world map (viewBox 1600 × 1000). */
  map?: { x: number; y: number };
};

export const rooms: Record<RoomId, Room> = {
  home: {
    id: "home",
    index: "00",
    name: "ENTRY",
    href: "/",
    line: "The threshold",
    description: "The way in. A corridor of monoliths that ends in seven doors.",
    plate: { kind: "arches", tone: "night", seed: 3 },
  },
  world: {
    id: "world",
    index: "01",
    name: "WORLD",
    href: "/world",
    line: "The map of everything",
    description: "Seven rooms, one territory. Wander in any order — the map remembers where you've been.",
    plate: { kind: "horizon", tone: "dusk", seed: 11 },
  },
  origin: {
    id: "origin",
    index: "02",
    name: "ORIGIN",
    href: "/origin",
    line: "Where it began",
    description: "A question, four hundred and eleven failures, and the flaw that became a form.",
    plate: { kind: "monolith", tone: "dusk", seed: 7 },
    map: { x: 290, y: 640 },
  },
  objects: {
    id: "objects",
    index: "03",
    name: "OBJECTS",
    href: "/objects",
    line: "The collection",
    description: "Four objects, four rooms. Each one arrives with its own weather.",
    plate: { kind: "studio", tone: "bone", seed: 5 },
    map: { x: 700, y: 360 },
  },
  atelier: {
    id: "atelier",
    index: "04",
    name: "ATELIER",
    href: "/atelier",
    line: "How it is made",
    description: "Research, sketch, prototype, material, engineering — the long road to a single object.",
    plate: { kind: "window", tone: "sand", seed: 9 },
    map: { x: 1010, y: 560 },
  },
  materials: {
    id: "materials",
    index: "05",
    name: "MATERIALS",
    href: "/materials",
    line: "The laboratory",
    description: "Steel, glass, stone, fabric, wood, composite. Don't read about them — touch them.",
    plate: { kind: "strata", tone: "sepia", seed: 2 },
    map: { x: 1290, y: 300 },
  },
  journal: {
    id: "journal",
    index: "06",
    name: "JOURNAL",
    href: "/journal",
    line: "Stories & ideas",
    description: "Interviews, essays and visual stories from the edges of design and culture.",
    plate: { kind: "portrait", tone: "night", seed: 4 },
    map: { x: 1170, y: 810 },
  },
  archive: {
    id: "archive",
    index: "07",
    name: "ARCHIVE",
    href: "/archive",
    line: "What came before",
    description: "Five years of concepts, prototypes, rejections — and the ideas we didn't build.",
    plate: { kind: "stairs", tone: "sepia", seed: 8 },
    map: { x: 540, y: 820 },
  },
  future: {
    id: "future",
    index: "08",
    name: "FUTURE",
    href: "/future",
    line: "Not yet",
    description: "Speculative objects and unfinished thoughts. Not everything here is meant to exist.",
    plate: { kind: "shaft", tone: "steel", seed: 6 },
    map: { x: 1470, y: 640 },
  },
  collection: {
    id: "collection",
    index: "∞",
    name: "COLLECTION",
    href: "/collection",
    line: "Your archive",
    description: "Everything you chose to keep. A private room inside the world.",
    plate: { kind: "columns", tone: "bone", seed: 12 },
  },
};

export const navOrder: RoomId[] = ["world", "origin", "objects", "atelier", "materials", "journal", "archive", "future"];

export const journey: RoomId[] = ["origin", "objects", "atelier", "materials", "journal", "archive", "future"];

export function roomFromPath(path: string): Room {
  const seg = path.split("?")[0].split("/")[1] ?? "";
  return Object.values(rooms).find((r) => r.href === `/${seg}`) ?? rooms.home;
}

export function nextInJourney(id: RoomId, visited: string[] = []): Room {
  const n = journey.length;
  const start = journey.indexOf(id); // -1 for rooms outside the journey → begins at ORIGIN
  for (let i = 1; i <= n; i++) {
    const r = journey[(start + i + n) % n];
    if (!visited.includes(r)) return rooms[r];
  }
  return rooms[journey[(start + 1 + n) % n]];
}
